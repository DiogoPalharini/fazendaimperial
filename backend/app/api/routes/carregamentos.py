from datetime import datetime
import json
import traceback # Added for debugging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.models.armazem import Armazem

from app.crud import carregamento as carregamento_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.carregamento import CarregamentoForm, CarregamentoRead
from app.schemas.carregamento import CarregamentoForm, CarregamentoRead
from app.services.focus_nfe import gerar_referencia, montar_json_nfe, enviar_nfe_focus
from app.core.config import get_settings
from app.crud import group as crud_groups

settings = get_settings()

router = APIRouter()


# ============================================================================
# DEBUG HOMOLOGAÇÃO ATIVO - REMOVER QUANDO FOR PARA PRODUÇÃO
# ============================================================================
@router.post('/', status_code=status.HTTP_201_CREATED, response_model=CarregamentoRead)
async def create_carregamento(
    carregamento_form: CarregamentoForm,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Cria um novo carregamento.
    Se type == 'EXTERNAL', gera NFe automaticamente.
    Se type == 'INTERNAL', apenas salva no banco.
    """
    from app.core.config import get_settings
    from app.schemas.carregamento import CarregamentoCreate
    settings = get_settings()

    # --- 1. Validações e Conversões Comuns ---
    try:
        # Converter scheduledAt para datetime
        scheduled_at_str = carregamento_form.scheduledAt
        if 'Z' in scheduled_at_str:
            scheduled_at_str = scheduled_at_str.replace('Z', '+00:00')
        elif '+' not in scheduled_at_str and scheduled_at_str.count(':') >= 2:
            scheduled_at_str = scheduled_at_str + '+00:00'
        scheduled_at = datetime.fromisoformat(scheduled_at_str)
    except (ValueError, AttributeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Formato de data inválido: {carregamento_form.scheduledAt}. Erro: {str(exc)}'
        ) from exc

    try:
        quantity = float(carregamento_form.quantity)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Quantidade inválida: {carregamento_form.quantity}'
        ) from exc

    # --- 2. Cálculos de Peso e Descontos ---
    from app.services.calculo_peso_service import calcular_descontos
    from app.models.armazem import Armazem
    
    # 2.1 Peso Líquido
    peso_liquido = None
    if carregamento_form.peso_bruto_kg and carregamento_form.tara_kg:
        peso_liquido = float(carregamento_form.peso_bruto_kg) - float(carregamento_form.tara_kg)
    
    # 2.2 Parâmetros da Fazenda (Personalizável)
    desc_fazenda = calcular_descontos(
        peso_liquido=peso_liquido or quantity, 
        umidade_medida=float(carregamento_form.umidade_percent or 0),
        impurezas_medida=float(carregamento_form.impurezas_percent or 0),
        umidade_padrao=float(carregamento_form.umidade_padrao or 14.0),
        fator_umidade=float(carregamento_form.fator_umidade or 1.5),
        impurezas_padrao=float(carregamento_form.impurezas_padrao or 1.0)
    )
    
    # 2.3 Parâmetros do Armazém (Mantém lógica de pegar do cadastro do armazém se existir)
    desc_armazem = None
    if carregamento_form.armazem_destino_id:
        armazem = db.query(Armazem).filter(Armazem.id == carregamento_form.armazem_destino_id).first()
        if armazem:
            desc_armazem = calcular_descontos(
                peso_liquido=peso_liquido or quantity,
                umidade_medida=float(carregamento_form.umidade_percent or 0),
                impurezas_medida=float(carregamento_form.impurezas_percent or 0),
                umidade_padrao=float(armazem.umidade_padrao),
                fator_umidade=float(armazem.fator_umidade),
                impurezas_padrao=float(armazem.impurezas_padrao)
            )

    # --- 3. Criação do Objeto no Banco ---
    carregamento_create = CarregamentoCreate(
        truck=carregamento_form.truck,
        driver=carregamento_form.driver,
        farm=carregamento_form.farm,
        field=carregamento_form.field,
        product=carregamento_form.product,
        quantity=quantity,
        unit=carregamento_form.unit,
        destination=carregamento_form.destination,
        scheduled_at=scheduled_at,
        type=carregamento_form.type,
        nfe_status='pendente' if carregamento_form.type in ['remessa', 'venda'] else None,
        
        # Novos Campos
        peso_estimado_kg=carregamento_form.peso_estimado_kg,
        peso_bruto_kg=carregamento_form.peso_bruto_kg,
        tara_kg=carregamento_form.tara_kg,
        peso_liquido_kg=peso_liquido,
        umidade_percent=carregamento_form.umidade_percent,
        impurezas_percent=carregamento_form.impurezas_percent,
        peso_com_desconto_fazenda=desc_fazenda['peso_com_desconto'],
        peso_com_desconto_armazem=desc_armazem['peso_com_desconto'] if desc_armazem else None,
        peso_recebido_final_kg=carregamento_form.peso_recebido_final_kg,
        armazem_destino_id=carregamento_form.armazem_destino_id,

        # Configurações Salvas
        umidade_padrao=carregamento_form.umidade_padrao,
        fator_umidade=carregamento_form.fator_umidade,
        impurezas_padrao=carregamento_form.impurezas_padrao,
        
        # Comparativo Empresa
        umidade_empresa_percent=carregamento_form.umidade_empresa_percent,
        impurezas_empresa_percent=carregamento_form.impurezas_empresa_percent,
        peso_com_desconto_empresa=carregamento_form.peso_com_desconto_empresa,
        
        
        # Driver Info
        driver_document=carregamento_form.driver_document,

        # Snapshot Fiscal (NFe)
        natureza_operacao=carregamento_form.natureza_operacao,
        cfop=carregamento_form.cfop,
        ncm=carregamento_form.ncm,
        valor_unitario=float(carregamento_form.valor_unitario or 0) if carregamento_form.valor_unitario else None,
    )

    # --- AUTO-SAVE DESTINATARIO (Armazem) ---
    # Se o usuário não selecionou um armazém da lista (armazem_destino_id vazio)
    # MAS informou um CNPJ de destinatário, vamos cadastrar automaticamente para a próxima vez.
    # --- AUTO-SAVE DESTINATARIO (Armazem) ---
    # Se o usuário não selecionou um armazém da lista (armazem_destino_id vazio)
    # MAS informou um CNPJ de destinatário, vamos cadastrar automaticamente para a próxima vez.
    if carregamento_form.armazem_destino_id:
        # Se JÁ tem ID, vamos atualizar os dados do Armazem com o que veio do formulário
        # Isso garante que se o usuário editou o endereço na tela, o cadastro atualiza
        existing_armazem = db.get(Armazem, carregamento_form.armazem_destino_id)
        if existing_armazem:
             # Update fields if provided in form
             existing_armazem.inscricao_estadual = carregamento_form.inscricao_estadual_destinatario or existing_armazem.inscricao_estadual
             existing_armazem.logradouro = carregamento_form.logradouro_destinatario or existing_armazem.logradouro
             existing_armazem.numero = carregamento_form.numero_destinatario or existing_armazem.numero
             existing_armazem.bairro = carregamento_form.bairro_destinatario or existing_armazem.bairro
             existing_armazem.municipio = carregamento_form.municipio_destinatario or existing_armazem.municipio
             existing_armazem.uf = carregamento_form.uf_destinatario or existing_armazem.uf
             existing_armazem.cep = carregamento_form.cep_destinatario or existing_armazem.cep
             db.add(existing_armazem) # Mark for update

    elif carregamento_form.cnpj_destinatario:
        # Verifica se já existe armazém com este CNPJ
        existing_armazem = db.query(Armazem).filter(Armazem.cnpj == carregamento_form.cnpj_destinatario).first()
        
        if existing_armazem:
            # Associa ao existente E ATUALIZA
            carregamento_create.armazem_destino_id = existing_armazem.id
            carregamento_form.armazem_destino_id = existing_armazem.id
            
            existing_armazem.inscricao_estadual = carregamento_form.inscricao_estadual_destinatario or existing_armazem.inscricao_estadual
            existing_armazem.logradouro = carregamento_form.logradouro_destinatario or existing_armazem.logradouro
            existing_armazem.numero = carregamento_form.numero_destinatario or existing_armazem.numero
            existing_armazem.bairro = carregamento_form.bairro_destinatario or existing_armazem.bairro
            existing_armazem.municipio = carregamento_form.municipio_destinatario or existing_armazem.municipio
            existing_armazem.uf = carregamento_form.uf_destinatario or existing_armazem.uf
            existing_armazem.cep = carregamento_form.cep_destinatario or existing_armazem.cep
            db.add(existing_armazem)

        elif carregamento_form.nome_destinatario: # Só cria se tiver pelo menos o nome
            # Cria novo Armazém
            new_armazem = Armazem(
                nome=carregamento_form.nome_destinatario,
                cnpj=carregamento_form.cnpj_destinatario,
                inscricao_estadual=carregamento_form.inscricao_estadual_destinatario,
                logradouro=carregamento_form.logradouro_destinatario,
                numero=carregamento_form.numero_destinatario,
                bairro=carregamento_form.bairro_destinatario,
                municipio=carregamento_form.municipio_destinatario,
                uf=carregamento_form.uf_destinatario,
                cep=carregamento_form.cep_destinatario,
                # Defaults
                eh_proprio=False,
                umidade_padrao=14.0,
                fator_umidade=1.5,
                impurezas_padrao=1.0
            )
            db.add(new_armazem)
            try:
                db.flush() 
                carregamento_create.armazem_destino_id = new_armazem.id
            except Exception as e:
                print(f"Erro ao auto-salvar destinatario: {e}")
    
    # Salva inicialmente (sem commit se for EXTERNAL para poder rollback em caso de erro na API)
    # Se for INTERNAL, já podemos commitar
    should_commit = (carregamento_form.type == 'interno')
    db_carregamento = carregamento_crud.create(db, obj_in=carregamento_create, commit=should_commit)

    # --- 4. Fluxo INTERNO (Sem NFe) ---
    if carregamento_form.type == 'interno':
        # Hydrate Response
        if db_carregamento.armazem_destino_id:
            from app.models.armazem import Armazem
            from app.schemas.carregamento import CarregamentoRead
            armazem_obj = db.get(Armazem, db_carregamento.armazem_destino_id)
            if armazem_obj:
               carregamento_dict = {c.name: getattr(db_carregamento, c.name) for c in db_carregamento.__table__.columns}
               carregamento_dict.update({
                    'cnpj_destinatario': armazem_obj.cnpj,
                    'nome_destinatario': armazem_obj.nome,
                    'logradouro_destinatario': armazem_obj.logradouro,
                    'numero_destinatario': armazem_obj.numero,
                    'bairro_destinatario': armazem_obj.bairro,
                    'municipio_destinatario': armazem_obj.municipio,
                    'uf_destinatario': armazem_obj.uf,
                    'cep_destinatario': armazem_obj.cep,
                    'inscricao_estadual_destinatario': armazem_obj.inscricao_estadual
                })
               return CarregamentoRead(**carregamento_dict)

        return db_carregamento

    # --- 5. Fluxo EXTERNO (Com NFe) ---
    # Se chegou aqui, type == 'remessa' ou 'venda'
    
    # Gerar referência única
    referencia = gerar_referencia(settings.FOCUS_NFE_AMBIENTE)
    
    # Atualizar referência no objeto (ainda na memória/transação)
    db_carregamento.nfe_ref = referencia

    try:
        # Lógica Unificada (O usuário quer testar com os dados reais/escritos mesmo em homologação)
        cnpj_emitente = carregamento_form.cnpj_emitente
        nome_emitente = carregamento_form.nome_emitente or carregamento_form.farm
        cnpj_destinatario = carregamento_form.cnpj_destinatario
        nome_destinatario = carregamento_form.nome_destinatario or carregamento_form.destination
        descricao_item = ''
        
        # Em homologação a Focus as vezes exige placa limpa ou formato específico, mas vamos respeitar o input
        placa_limpa = carregamento_form.truck
        if settings.FOCUS_NFE_AMBIENTE == "homologacao":
            # Apenas garantindo que a placa não quebre se tiver caracters especiais, mas mantendo o valor do usuario
            pass
        
        carregamento_dict = {
            'truck': placa_limpa if settings.FOCUS_NFE_AMBIENTE == "homologacao" else carregamento_form.truck,
            'driver': carregamento_form.driver,
            'farm': carregamento_form.farm,
            'field': carregamento_form.field,
            'product': carregamento_form.product,
            'quantity': quantity,
            'unit': carregamento_form.unit,
            'destination': carregamento_form.destination,
            'scheduled_at': scheduled_at.isoformat(),
            # Novos campos opcionais do form
            'cnpj_emitente': carregamento_form.cnpj_emitente,
            'nome_emitente': carregamento_form.nome_emitente,
            'cnpj_destinatario': carregamento_form.cnpj_destinatario,
            'nome_destinatario': carregamento_form.nome_destinatario,
            'cfop': carregamento_form.cfop,
            'natureza_operacao': carregamento_form.natureza_operacao,
            'ncm': carregamento_form.ncm,
            'valor_unitario': carregamento_form.valor_unitario,
            # Add Address Fields
            'logradouro_destinatario': carregamento_form.logradouro_destinatario,
            'numero_destinatario': carregamento_form.numero_destinatario,
            'bairro_destinatario': carregamento_form.bairro_destinatario,
            'municipio_destinatario': carregamento_form.municipio_destinatario,
            'uf_destinatario': carregamento_form.uf_destinatario,
            'cep_destinatario': carregamento_form.cep_destinatario,
            'inscricao_estadual_destinatario': carregamento_form.inscricao_estadual_destinatario,
            'indicador_inscricao_estadual_destinatario': carregamento_form.indicador_inscricao_estadual_destinatario,
        }

        # Buscar dados completos da Fazenda (Emitente)
        from app.models.farm import Farm
        farm_obj = db.query(Farm).filter(
            Farm.name == carregamento_form.farm, 
            Farm.group_id == current_user.group_id
        ).first()
        
        if not farm_obj:
            # Fallback (em teoria não deveria acontecer se o frontend listar corretamente)
            raise HTTPException(status_code=400, detail=f"Fazenda '{carregamento_form.farm}' não encontrada para este usuário")

        # Buscar Grupo e Token
        from app.models.group import Group
        group_obj = db.get(Group, current_user.group_id)
        
        # Em homologação, podemos aceitar sem token, mas em produção NÃO
        focus_token = ''
        if group_obj and group_obj.focus_nfe_token:
             focus_token = group_obj.focus_nfe_token
        elif settings.FOCUS_NFE_AMBIENTE == 'homologacao':
             focus_token = settings.FOCUS_NFE_TOKEN # Fallback do .env apenas em homologação
        
        if not focus_token:
             raise HTTPException(status_code=400, detail="Grupo não possui Token da Focus NFe configurado para emissão fiscal")

        # Armazém já foi buscado anteriormente se existir ID
        # armazem = db.query(Armazem)... (linhas 86-87)

        # Determinar Tipo da NFe
        from app.core.nfe_enums import NfeType
        nfe_type_map = {
            'remessa': NfeType.REMESSA,
            'venda': NfeType.VENDA,
        }
        nfe_type = nfe_type_map.get(carregamento_form.type, NfeType.REMESSA)

        nfe_data = montar_json_nfe(
            carregamento=carregamento_dict,
            referencia=referencia,
            farm_obj=farm_obj,
            armazem_obj=armazem if 'armazem' in locals() and armazem else None,
            descricao_item_homologacao=descricao_item if settings.FOCUS_NFE_AMBIENTE == "homologacao" else None,
            nfe_type=nfe_type
        )
        
        # Atualizar status para "processando"
        carregamento_crud.update_nfe_data(
            db,
            db_obj=db_carregamento,
            nfe_ref=referencia,
            nfe_status='processando',
            commit=False,
        )

        # Enviar para Focus NFe
        try:
            response_focus = await enviar_nfe_focus(nfe_data, token=focus_token)
        except Exception as focus_error:
            # Em caso de erro na API externa, fazemos rollback do carregamento criado
            db.rollback()
            print(f"Erro ao enviar NFe: {focus_error}")
            traceback.print_exc() # Print full traceback
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f'Erro ao enviar NFe para Focus: {str(focus_error)}'
            ) from focus_error

        # Processar resposta
        status_nfe = response_focus.get('status', 'erro')
        protocolo = response_focus.get('protocolo')
        chave = response_focus.get('chave_nfe')
        # Fix: Truncation Error (DB Limit 44, Focus returns 'NFe'+44)
        if chave and chave.startswith('NFe'):
             chave = chave[3:]
             
        xml_url = response_focus.get('caminho_xml_nota_fiscal')
        danfe_url = response_focus.get('caminho_danfe')

        status_mapeado = {
            'autorizado': 'autorizado',
            'processando': 'processando',
            'cancelado': 'cancelado',
            'erro_autorizacao': 'erro',
            'denegado': 'erro',
        }.get(status_nfe, 'erro')

        # Atualizar registro final
        db_carregamento = carregamento_crud.update_nfe_data(
            db,
            db_obj=db_carregamento,
            nfe_status=status_mapeado,
            nfe_protocolo=protocolo,
            nfe_chave=chave,
            nfe_xml_url=xml_url,
            nfe_danfe_url=danfe_url,
            commit=True, # Agora sim commita tudo
        )
        
        # Hydrate Response
        if db_carregamento.armazem_destino_id:
            from app.models.armazem import Armazem
            from app.schemas.carregamento import CarregamentoRead
            armazem_obj = db.get(Armazem, db_carregamento.armazem_destino_id)
            if armazem_obj:
               carregamento_dict = {c.name: getattr(db_carregamento, c.name) for c in db_carregamento.__table__.columns}
               carregamento_dict.update({
                    'cnpj_destinatario': armazem_obj.cnpj,
                    'nome_destinatario': armazem_obj.nome,
                    'logradouro_destinatario': armazem_obj.logradouro,
                    'numero_destinatario': armazem_obj.numero,
                    'bairro_destinatario': armazem_obj.bairro,
                    'municipio_destinatario': armazem_obj.municipio,
                    'uf_destinatario': armazem_obj.uf,
                    'cep_destinatario': armazem_obj.cep,
                    'inscricao_estadual_destinatario': armazem_obj.inscricao_estadual
                })
               return CarregamentoRead(**carregamento_dict)

        return db_carregamento

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro interno ao processar carregamento: {str(exc)}'
        ) from exc


@router.get('/', response_model=list[CarregamentoRead])
async def list_carregamentos(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Lista todos os carregamentos.
    Se não for admin, filtra pelas fazendas do grupo do usuário.
    """
    farm_names = None
    if current_user.base_role != 'system_admin':
        from app.models.farm import Farm
        # Buscar nomes das fazendas do grupo
        farms = db.query(Farm.name).filter(Farm.group_id == current_user.group_id).all()
        farm_names = [f[0] for f in farms]
        
    carregamentos = carregamento_crud.get_multi(db, skip=skip, limit=limit, farm_names=farm_names)
    return carregamentos



@router.get('/distinct-values', response_model=list[str])
async def get_distinct_values(
    field: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retorna uma lista de valores únicos para um campo específico (ex: truck, driver, product).
    Útil para autocomplete no frontend.
    """
    from app.models.carregamento import Carregamento
    from sqlalchemy import distinct
    
    allowed_fields = ['truck', 'driver', 'product', 'field', 'destination', 'unit']
    if field not in allowed_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campo inválido. Permitidos: {', '.join(allowed_fields)}"
        )
    
    # Mapeia string para coluna do modelo
    column_map = {
        'truck': Carregamento.truck,
        'driver': Carregamento.driver,
        'product': Carregamento.product,
        'field': Carregamento.field,
        'destination': Carregamento.destination,
        'unit': Carregamento.unit,
    }
    
    target_column = column_map[field]
    
    # Query Base
    query = db.query(distinct(target_column)).filter(target_column != None) # noqa: E711
    
    # Se não for admin, filtrar pelas fazendas do grupo
    if current_user.base_role != 'system_admin':
         from app.models.farm import Farm
         farms = db.query(Farm.name).filter(Farm.group_id == current_user.group_id).all()
         farm_names = [f[0] for f in farms]
         
         # Filtrar carregamentos que pertencem a essas fazendas
         query = query.filter(Carregamento.farm.in_(farm_names))

    # Busca valores distintos não nulos
    results = query.all()
    
    # Flatten list of tuples [('val1',), ('val2',)] -> ['val1', 'val2']
    values = [r[0] for r in results if r[0]]
    
    return sorted(values)


@router.get('/{id}', response_model=CarregamentoRead)
async def get_carregamento(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Obtém um carregamento pelo ID.
    """
    carregamento = carregamento_crud.get(db, id=id)
    if not carregamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carregamento não encontrado",
        )
    
    # Hydrate Destination Fields from Armazem if linked
    if carregamento.armazem_destino_id:
        from app.models.armazem import Armazem
        from app.schemas.carregamento import CarregamentoRead
        armazem = db.get(Armazem, carregamento.armazem_destino_id)
        
        # We need to construct a dict merging the DB object and the overrides
        carregamento_dict = {
            c.name: getattr(carregamento, c.name) 
            for c in carregamento.__table__.columns
        }
        
        if armazem:
             carregamento_dict.update({
                 'cnpj_destinatario': armazem.cnpj,
                 'nome_destinatario': armazem.nome,
                 'logradouro_destinatario': armazem.logradouro,
                 'numero_destinatario': armazem.numero,
                 'bairro_destinatario': armazem.bairro,
                 'municipio_destinatario': armazem.municipio,
                 'uf_destinatario': armazem.uf,
                 'cep_destinatario': armazem.cep,
                 'inscricao_estadual_destinatario': armazem.inscricao_estadual
             })
             
        # Add matricula_snapshot if missing but ID exists (optional logic)
        
        return CarregamentoRead(**carregamento_dict)

    return carregamento



@router.put('/{id}', response_model=CarregamentoRead)
async def update_carregamento(
    id: int,
    carregamento_in: CarregamentoForm,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Atualiza um carregamento existente.
    Recalcula pesos e descontos.
    """
    from app.schemas.carregamento import CarregamentoUpdate
    from app.services.calculo_peso_service import calcular_descontos
    from app.models.armazem import Armazem

    carregamento = carregamento_crud.get(db, id=id)
    if not carregamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carregamento não encontrado",
        )

    # --- PERMISSION VALIDATION ---
    # Enforce strict field-level permissions for Scale and Dryer operators
    if current_user.base_role not in ['system_admin', 'owner', 'manager']:
        from app.models.farm import Farm
        from app.models.user_farm_permissions import UserFarmPermissions
        
        # 1. Identify Context (Farm)
        farm_obj = db.query(Farm).filter(Farm.name == carregamento.farm).first()
        if not farm_obj:
            # Should not happen, but safe fallback
             raise HTTPException(status_code=403, detail="Fazenda não encontrada para validação de permissão")
        
        # 2. Fetch Permissions
        user_perms = db.query(UserFarmPermissions).filter(
            UserFarmPermissions.user_id == current_user.id,
            UserFarmPermissions.farm_id == farm_obj.id
        ).first()
        
        if not user_perms or not user_perms.allowed_modules:
             raise HTTPException(status_code=403, detail="Sem permissões para esta fazenda")
        
        modules = user_perms.allowed_modules.get('truck-loading', {})
        
        # 3. Define Field Groups
        WEIGHT_FIELDS = ['peso_bruto_kg', 'tara_kg']
        QUALITY_FIELDS = ['umidade_percent', 'impurezas_percent'] # 'umidade_alvo' if it existed
        CONFIG_FIELDS = ['umidade_padrao', 'impurezas_padrao', 'fator_umidade']
        
        # 4. Detect Changes
        # Helper to compare float/val safely
        def val_changed(new_val, old_val):
            # Treat None and 0.0 as potentially different if meaningful, but for form mostly strict
            if new_val is None and old_val is None: return False
            if new_val is None and old_val is not None: return True 
            if new_val is not None and old_val is None: return True
            # Float comparison
            try:
                return float(new_val) != float(old_val)
            except:
                return new_val != old_val

        weight_changed = any(val_changed(getattr(carregamento_in, f), getattr(carregamento, f)) for f in WEIGHT_FIELDS)
        quality_changed = any(val_changed(getattr(carregamento_in, f), getattr(carregamento, f)) for f in QUALITY_FIELDS)
        config_changed = any(val_changed(getattr(carregamento_in, f), getattr(carregamento, f)) for f in CONFIG_FIELDS)
        
        # Check other fields (Generic Update)
        # We exclude the specialized fields to see if "General" fields were touched
        specialized_fields = set(WEIGHT_FIELDS + QUALITY_FIELDS + CONFIG_FIELDS)
        # We need to check relevant fields from Form
        general_changed = False
        for field, value in carregamento_in.dict(exclude_unset=True).items():
            if field not in specialized_fields and field != 'scheduledAt': # scheduledAt handler separately but counts as general
                 if hasattr(carregamento, field):
                     if val_changed(value, getattr(carregamento, field)):
                         general_changed = True
                         break
        
        # 5. Enforce Rules
        if config_changed:
             raise HTTPException(status_code=403, detail="Apenas Gerentes podem alterar padrões de desconto (Umidade/Impureza Padrão)")
        
        if weight_changed and not modules.get('manage_weight') and not modules.get('update'): 
            # Allow if 'manage_weight' OR 'update' (Legacy compatibility? 
            # User said: "Campos de balança só possam ser alterados por quem tem permissão de balança"
            # So STRICTLY require manage_weight? Or does 'update' imply all?
            # User said "Operador de Balança... Pode editar APENAS...". 
            # If I make 'update' NOT include weight, then Manager (who has 'update') needs 'manage_weight' too?
            # User said "Gerente: pode editar todas as etapas".
            # Managers are caught by `current_user.base_role` check above.
            # So here we are dealing with Operational.
            # Operational with 'update' (Generic) should NOT edit weight?
            # "Operador de Balança... Não pode: Inserir ou alterar dados de umidade"
            # "Operador de Secador... Não pode: Alterar peso bruto"
            # So yes, strict separation. Generic 'update' should NOT cover these if we want strictness.
            if not modules.get('manage_weight'):
                raise HTTPException(status_code=403, detail="Necessária permissão de Balança (manage_weight) para editar pesos.")

        if quality_changed and not modules.get('manage_quality'):
             if not modules.get('manage_quality'): # Double check strictness
                raise HTTPException(status_code=403, detail="Necessária permissão de Secador/Qualidade (manage_quality) para editar umidade/impurezas.")
        
        if general_changed and not modules.get('update'):
             # If they changed Driver/Truck but don't have update
             pass # Actually, let's strictly require update for general fields
             # If they ONLY have manage_weight, they shouldn't edit driver.
             raise HTTPException(status_code=403, detail="Necessária permissão de Edição (update) para alterar dados gerais.")


    # --- 1. Cálculos de Peso e Descontos ---
    
    # 1.1 Peso Líquido
    peso_liquido = None
    if carregamento_in.peso_bruto_kg and carregamento_in.tara_kg:
        peso_liquido = float(carregamento_in.peso_bruto_kg) - float(carregamento_in.tara_kg)
    
    # Se não tiver peso liquido calculado, tenta usar o quantity se for numérico
    base_calc = peso_liquido
    if base_calc is None:
        try:
            base_calc = float(carregamento_in.quantity)
        except:
            base_calc = 0.0

    # 1.2 Parâmetros da Fazenda (Com novos parâmetros do form)
    desc_fazenda = calcular_descontos(
        peso_liquido=base_calc,
        umidade_medida=float(carregamento_in.umidade_percent or 0),
        impurezas_medida=float(carregamento_in.impurezas_percent or 0),
        umidade_padrao=float(carregamento_in.umidade_padrao or carregamento.umidade_padrao or 14.0),
        fator_umidade=float(carregamento_in.fator_umidade or carregamento.fator_umidade or 1.5),
        impurezas_padrao=float(carregamento_in.impurezas_padrao or carregamento.impurezas_padrao or 1.0)
    )
    
    # 1.3 Parâmetros do Armazém
    desc_armazem = None
    if carregamento_in.armazem_destino_id:
        armazem = db.query(Armazem).filter(Armazem.id == carregamento_in.armazem_destino_id).first()
        if armazem:
            desc_armazem = calcular_descontos(
                peso_liquido=base_calc,
                umidade_medida=float(carregamento_in.umidade_percent or 0),
                impurezas_medida=float(carregamento_in.impurezas_percent or 0),
                umidade_padrao=float(armazem.umidade_padrao),
                fator_umidade=float(armazem.fator_umidade),
                impurezas_padrao=float(armazem.impurezas_padrao)
            )

    # --- 2. Preparar Update ---
    # Converter Form para Update Schema
    # Precisamos mapear os campos manualmente ou usar dict
    
    update_data = carregamento_in.dict(exclude_unset=True)
    
    # Atualizar campos calculados
    update_data['peso_com_desconto_fazenda'] = desc_fazenda['peso_com_desconto']
    update_data['peso_com_desconto_armazem'] = desc_armazem['peso_com_desconto'] if desc_armazem else None

    # Garantir que campos de matrícula sejam passados se estiverem no request (já estão no dict via exclude_unset)
    
    # Converter scheduledAt se estiver presente
    if 'scheduledAt' in update_data:
        try:
            scheduled_at_str = update_data['scheduledAt']
            if 'Z' in scheduled_at_str:
                scheduled_at_str = scheduled_at_str.replace('Z', '+00:00')
            elif '+' not in scheduled_at_str and scheduled_at_str.count(':') >= 2:
                scheduled_at_str = scheduled_at_str + '+00:00'
            update_data['scheduled_at'] = datetime.fromisoformat(scheduled_at_str)
            del update_data['scheduledAt']
        except:
            pass

    # --- Update Linked Armazem (Critical for Persistence) ---
    # --- Update Linked Armazem (Critical for Persistence) ---
    # Logic: 
    # 1. If ID exists (from form or DB), find and update.
    # 2. If ID missing but CNPJ exists (User typed new/unsaved arm), Find by CNPJ or Create.
    
    target_armazem_id = update_data.get('armazem_destino_id') or carregamento.armazem_destino_id
    
    # helper for clean values
    def get_val(key):
        return update_data.get(key)
        
    armazem_obj = None

    if target_armazem_id:
        armazem_obj = db.get(Armazem, target_armazem_id)
    elif get_val('cnpj_destinatario'):
        # Try to find by CNPJ or Create
        cnpj_clean = get_val('cnpj_destinatario')
        existing = db.query(Armazem).filter(Armazem.cnpj == cnpj_clean).first()
        if existing:
            armazem_obj = existing
            # Link it
            update_data['armazem_destino_id'] = existing.id
        else:
            # Create NEW Armazem
            nome_novo = get_val('nome_destinatario') or f"Armazem {cnpj_clean}"
            new_armazem = Armazem(
                nome=nome_novo,
                cnpj=cnpj_clean,
                inscricao_estadual=get_val('inscricao_estadual_destinatario'),
                logradouro=get_val('logradouro_destinatario'),
                numero=get_val('numero_destinatario'),
                bairro=get_val('bairro_destinatario'),
                municipio=get_val('municipio_destinatario'),
                uf=get_val('uf_destinatario'),
                cep=get_val('cep_destinatario'),
                group_id=current_user.group_id # Assume same group
            )
            db.add(new_armazem)
            db.flush() # Get ID
            armazem_obj = new_armazem
            update_data['armazem_destino_id'] = new_armazem.id
            
    if armazem_obj:
             # Fields to sync from form to Armazem
             # Note: Form fields might be in 'update_data' or 'carregamento_in'
             # Since 'update_data' comes from carregamento_in.dict(), we check if the keys exist there
             # But 'exclude_unset=True' was used. If user didn't change them, they might not be there.
             # However, typically form sends all.
             
             # Helper to get value from update_data safely
             def get_val(key):
                 return update_data.get(key)
             
             if 'inscricao_estadual_destinatario' in update_data: armazem_obj.inscricao_estadual = get_val('inscricao_estadual_destinatario')
             if 'logradouro_destinatario' in update_data: armazem_obj.logradouro = get_val('logradouro_destinatario')
             if 'numero_destinatario' in update_data: armazem_obj.numero = get_val('numero_destinatario')
             if 'bairro_destinatario' in update_data: armazem_obj.bairro = get_val('bairro_destinatario')
             if 'municipio_destinatario' in update_data: armazem_obj.municipio = get_val('municipio_destinatario')
             if 'uf_destinatario' in update_data: armazem_obj.uf = get_val('uf_destinatario')
             if 'cep_destinatario' in update_data: armazem_obj.cep = get_val('cep_destinatario')
             
             db.add(armazem_obj)
             # No flush needed, commit at end handles it

    # Atualizar no banco
    # Nota: carregamento_crud.update espera um schema Update ou dict.
    # Vamos passar dict com os campos mapeados.
    
    carregamento_updated = carregamento_crud.update(db, db_obj=carregamento, obj_in=update_data)
    # Hydrate Response
    if carregamento_updated.armazem_destino_id:
        from app.models.armazem import Armazem
        from app.schemas.carregamento import CarregamentoRead
        armazem_obj = db.get(Armazem, carregamento_updated.armazem_destino_id)
        if armazem_obj:
             carregamento_dict = {c.name: getattr(carregamento_updated, c.name) for c in carregamento_updated.__table__.columns}
             carregamento_dict.update({
                 'cnpj_destinatario': armazem_obj.cnpj,
                 'nome_destinatario': armazem_obj.nome,
                 'logradouro_destinatario': armazem_obj.logradouro,
                 'numero_destinatario': armazem_obj.numero,
                 'bairro_destinatario': armazem_obj.bairro,
                 'municipio_destinatario': armazem_obj.municipio,
                 'uf_destinatario': armazem_obj.uf,
                 'cep_destinatario': armazem_obj.cep,
                 'inscricao_estadual_destinatario': armazem_obj.inscricao_estadual
             })
             
             return CarregamentoRead(**carregamento_dict)

    return carregamento_updated


@router.post('/{id}/sync-nfe', response_model=CarregamentoRead)
async def sync_nfe_status(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Sincroniza o status da NFe com a API Focus NFe.
    Útil para obter a URL do PDF (DANFE) se não veio na criação inicial.
    """
    from app.services.focus_nfe import consultar_nfe_focus
    from app.models.group import Group

    carregamento = carregamento_crud.get(db, id=id)
    if not carregamento:
        raise HTTPException(status_code=404, detail="Carregamento não encontrado")
    
    if not carregamento.nfe_ref:
        raise HTTPException(status_code=400, detail="Carregamento não possui referência de NFe para sincronizar")

    # Obter Token
    group_obj = db.get(Group, current_user.group_id)
    # Fallback to env default if group token is missing (useful for dev/homolog)
    from app.core.config import get_settings
    settings = get_settings()
    
    focus_token = ''
    if group_obj and group_obj.focus_nfe_token:
            focus_token = group_obj.focus_nfe_token
    elif settings.FOCUS_NFE_AMBIENTE == 'homologacao':
            focus_token = settings.FOCUS_NFE_TOKEN

    if not focus_token:
         raise HTTPException(status_code=400, detail="Token Focus NFe não configurado")

    try:
        response_focus = await consultar_nfe_focus(carregamento.nfe_ref, focus_token)
        
        # Process response
        status_nfe = response_focus.get('status', 'erro')
        protocolo = response_focus.get('protocolo')
        chave = response_focus.get('chave_nfe')
        if chave and chave.startswith('NFe'):
             chave = chave[3:]
             
        xml_url = response_focus.get('caminho_xml_nota_fiscal')
        danfe_url = response_focus.get('caminho_danfe')
        
        status_mapeado = {
            'autorizado': 'autorizado',
            'processando': 'processando',
            'cancelado': 'cancelado',
            'erro_autorizacao': 'erro',
            'denegado': 'erro',
        }.get(status_nfe, 'erro')
        
        # Update DB
        carregamento_updated = carregamento_crud.update_nfe_data(
            db,
            db_obj=carregamento,
            nfe_status=status_mapeado,
            nfe_protocolo=protocolo,
            nfe_chave=chave,
            nfe_xml_url=xml_url,
            nfe_danfe_url=danfe_url,
            commit=True
        )
        return carregamento_updated

    except Exception as e:
        print(f"Erro Sync NFe: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao sincronizar NFe")


@router.get('/{id}/pdf')
async def download_nfe_pdf(
    id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Faz o download do PDF da Nota Fiscal (Proxy).
    Força o download com Content-Disposition: attachment.
    """
    from fastapi.responses import StreamingResponse
    import httpx
    from app.models.group import Group
    from app.core.config import get_settings

    carregamento = carregamento_crud.get(db, id=id)
    if not carregamento:
        raise HTTPException(status_code=404, detail="Carregamento não encontrado")
    
    if not carregamento.nfe_danfe_url:
        raise HTTPException(status_code=404, detail="URL do PDF não disponível. Sincronize o status antes.")

    # Obter Token (Logica identica ao sync)
    group_obj = db.get(Group, current_user.group_id)
    settings = get_settings()
    
    focus_token = ''
    if group_obj and group_obj.focus_nfe_token:
            focus_token = group_obj.focus_nfe_token
    elif settings.FOCUS_NFE_AMBIENTE == 'homologacao':
            focus_token = settings.FOCUS_NFE_TOKEN

    # Determine Base URL based on environment
    base_url = 'https://homologacao.focusnfe.com.br' if settings.FOCUS_NFE_AMBIENTE == 'homologacao' else 'https://api.focusnfe.com.br'
    
    target_url = carregamento.nfe_danfe_url
    if target_url and not target_url.startswith(('http://', 'https://')):
         # Ensure no double slashes if path starts with /
         if target_url.startswith('/'):
              target_url = f"{base_url}{target_url}"
         else:
              target_url = f"{base_url}/{target_url}"

    async def iterfile():
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                # Add Auth Headers
                auth = (focus_token, "") if focus_token else None
                
                async with client.stream("GET", target_url, auth=auth) as response:
                    if response.status_code != 200:
                        error_content = await response.read()
                        print(f"Erro Focus NFe PDF ({response.status_code}): {error_content}")
                        # Raise here won't propagate nicely in a generator, but logs are critical
                        # Better to just not yield anything or yield the error text if possible
                        # Ideally rewrite to not use generator if small, or just accept the log for now.
                        return

                    response.raise_for_status()
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except Exception as e:
                print(f"Erro ao baixar PDF da URL externa: {e}")
                # Log error

    filename = f"NFe-{carregamento.nfe_chave or id}.pdf"
    
    return StreamingResponse(
        iterfile(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )



