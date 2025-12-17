from datetime import datetime
import json
import traceback # Added for debugging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.crud import carregamento as carregamento_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.carregamento import CarregamentoForm, CarregamentoRead
from app.services.focus_nfe import (
    enviar_nfe_focus,
    gerar_referencia,
    montar_json_nfe,
)

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
    
    # 2.2 Parâmetros da Fazenda (Padrão)
    # TODO: Buscar de configurações globais se existir, por enquanto hardcoded conforme pedido
    desc_fazenda = calcular_descontos(
        peso_liquido=peso_liquido or quantity, # Fallback para quantity se não tiver peso liquido
        umidade_medida=float(carregamento_form.umidade_percent or 0),
        impurezas_medida=float(carregamento_form.impurezas_percent or 0),
        umidade_padrao=14.0,
        fator_umidade=1.5,
        impurezas_padrao=1.0
    )
    
    # 2.3 Parâmetros do Armazém
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
        
        # Comparativo Empresa
        umidade_empresa_percent=carregamento_form.umidade_empresa_percent,
        impurezas_empresa_percent=carregamento_form.impurezas_empresa_percent,
        peso_com_desconto_empresa=carregamento_form.peso_com_desconto_empresa
    )

    # Salva inicialmente (sem commit se for EXTERNAL para poder rollback em caso de erro na API)
    # Se for INTERNAL, já podemos commitar
    should_commit = (carregamento_form.type == 'interno')
    db_carregamento = carregamento_crud.create(db, obj_in=carregamento_create, commit=should_commit)

    # --- 4. Fluxo INTERNO (Sem NFe) ---
    if carregamento_form.type == 'interno':
        return db_carregamento

    # --- 5. Fluxo EXTERNO (Com NFe) ---
    # Se chegou aqui, type == 'remessa' ou 'venda'
    
    # Gerar referência única
    referencia = gerar_referencia(settings.FOCUS_NFE_AMBIENTE)
    
    # Atualizar referência no objeto (ainda na memória/transação)
    db_carregamento.nfe_ref = referencia

    try:
        # Lógica de Homologação vs Produção
        if settings.FOCUS_NFE_AMBIENTE == "homologacao":
            cnpj_emitente = "63661106000156"
            nome_emitente = "INTERLINK AGRORURAL SOFTWARE LTDA"
            cnpj_destinatario = "63661106000156"
            nome_destinatario = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            descricao_item = "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            placa_limpa = ''.join(filter(str.isalnum, carregamento_form.truck.upper()))[:8]
        else:
            cnpj_emitente = ''
            nome_emitente = carregamento_form.farm
            cnpj_destinatario = None
            nome_destinatario = carregamento_form.destination
            descricao_item = ''
            placa_limpa = carregamento_form.truck
        
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
    """
    carregamentos = carregamento_crud.get_multi(db, skip=skip, limit=limit)
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
    
    # Busca valores distintos não nulos
    results = db.query(distinct(target_column)).filter(target_column != None).all() # noqa: E711
    
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

    # 1.2 Parâmetros da Fazenda (Padrão)
    desc_fazenda = calcular_descontos(
        peso_liquido=base_calc,
        umidade_medida=float(carregamento_in.umidade_percent or 0),
        impurezas_medida=float(carregamento_in.impurezas_percent or 0),
        umidade_padrao=14.0,
        fator_umidade=1.5,
        impurezas_padrao=1.0
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
    update_data['peso_liquido_kg'] = peso_liquido
    update_data['peso_com_desconto_fazenda'] = desc_fazenda['peso_com_desconto']
    update_data['peso_com_desconto_armazem'] = desc_armazem['peso_com_desconto'] if desc_armazem else None
    
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

    # Atualizar no banco
    # Nota: carregamento_crud.update espera um schema Update ou dict.
    # Vamos passar dict com os campos mapeados.
    
    carregamento_updated = carregamento_crud.update(db, db_obj=carregamento, obj_in=update_data)
    return carregamento_updated



