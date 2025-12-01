
from datetime import datetime
import json

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
@router.post('/gerar-nfe', status_code=status.HTTP_201_CREATED)
async def gerar_nfe(
    carregamento_form: CarregamentoForm,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    
    from app.core.config import get_settings, clear_settings_cache
    from app.schemas.carregamento import CarregamentoCreate

    # Limpar cache para garantir que pega o token atualizado do .env
    clear_settings_cache()
    settings = get_settings()
    
    # DEBUG: Logs iniciais
    print("\n" + "="*60)
    print("FOCUS NFE DEBUG - INÍCIO")
    print("="*60)
    print(f"Ambiente configurado: {settings.FOCUS_NFE_AMBIENTE}")
    print(f"Token carregado: {'OK' if settings.FOCUS_NFE_TOKEN else 'VAZIO!!!'}")
    print(f"Primeiros 15 caracteres do token: {settings.FOCUS_NFE_TOKEN[:15] if settings.FOCUS_NFE_TOKEN else 'None'}")
    print(f"Tamanho total do token: {len(settings.FOCUS_NFE_TOKEN) if settings.FOCUS_NFE_TOKEN else 0} caracteres")
    print("="*60 + "\n")

    try:
        # Converter scheduledAt para datetime
        # Aceita tanto formato ISO (com timezone) quanto datetime-local (sem timezone)
        scheduled_at_str = carregamento_form.scheduledAt
        if 'Z' in scheduled_at_str:
            scheduled_at_str = scheduled_at_str.replace('Z', '+00:00')
        elif '+' not in scheduled_at_str and scheduled_at_str.count(':') >= 2:
            # Formato datetime-local sem timezone, adicionar timezone local
            scheduled_at_str = scheduled_at_str + '+00:00'
        scheduled_at = datetime.fromisoformat(scheduled_at_str)
    except (ValueError, AttributeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Formato de data inválido: {carregamento_form.scheduledAt}. Erro: {str(exc)}'
        ) from exc

    # Converter quantity de string para float
    try:
        quantity = float(carregamento_form.quantity)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Quantidade inválida: {carregamento_form.quantity}'
        ) from exc

    # Gerar referência única
    referencia = gerar_referencia(settings.FOCUS_NFE_AMBIENTE)

    # Criar registro no banco com status "pendente"
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
        nfe_status='pendente',
    )

    # Criar registro no banco com status "pendente" (sem commit ainda)
    db_carregamento = carregamento_crud.create(db, obj_in=carregamento_create, commit=False)

    try:
        # Forçar dados mágicos de homologação ANTES de montar JSON
        if settings.FOCUS_NFE_AMBIENTE == "homologacao":
            cnpj_emitente = "11111111000111"
            nome_emitente = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            cnpj_destinatario = "99999999000191"
            nome_destinatario = "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            descricao_item = "NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL"
            placa_limpa = ''.join(filter(str.isalnum, carregamento_form.truck.upper()))[:8]
            print(f"DEBUG: Dados mágicos de homologação aplicados")
            print(f"  CNPJ Emitente: {cnpj_emitente}")
            print(f"  CNPJ Destinatário: {cnpj_destinatario}")
            print(f"  Placa limpa: {placa_limpa}")
        else:
            # Em produção manter os valores reais (depois você preenchemos)
            cnpj_emitente = ''
            nome_emitente = carregamento_form.farm
            cnpj_destinatario = None
            nome_destinatario = carregamento_form.destination
            descricao_item = ''
            placa_limpa = carregamento_form.truck
        
        # Preparar dados para montar JSON da NFe
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
        }

        # Endereços (usar padrão para homologação)
        endereco_emitente = {
            'logradouro': 'RUA EXEMPLO',
            'numero': '123',
            'bairro': 'CENTRO',
            'municipio': 'SAO PAULO',
            'uf': 'SP',
            'cep': '01000000',
            'inscricao_estadual': 'ISENTO',
            'cnae': '0111301',
        }

        endereco_destinatario = {
            'logradouro': 'RUA EXEMPLO DEST',
            'numero': '456',
            'bairro': 'CENTRO',
            'municipio': 'SAO PAULO',
            'uf': 'SP',
            'cep': '01000000',
        }

        # Montar JSON da NFe (passar descricao_item se for homologação)
        nfe_data = montar_json_nfe(
            carregamento=carregamento_dict,
            referencia=referencia,
            cnpj_emitente=cnpj_emitente,
            nome_emitente=nome_emitente,
            endereco_emitente=endereco_emitente,
            cnpj_destinatario=cnpj_destinatario,
            nome_destinatario=nome_destinatario,
            endereco_destinatario=endereco_destinatario,
            descricao_item_homologacao=descricao_item if settings.FOCUS_NFE_AMBIENTE == "homologacao" else None,
        )
        
        # DEBUG: Mostrar JSON antes de enviar
        print("\n" + "="*60)
        print("JSON enviado para Focus NFe (primeiros 500 caracteres):")
        print("="*60)
        json_str = json.dumps(nfe_data, indent=2, ensure_ascii=False)
        print(json_str[:500] + ("..." if len(json_str) > 500 else ""))
        print("="*60 + "\n")

        # Atualizar status para "processando" (sem commit ainda)
        carregamento_crud.update_nfe_data(
            db,
            db_obj=db_carregamento,
            nfe_ref=referencia,
            nfe_status='processando',
            commit=False,
        )

        # Enviar para Focus NFe
        try:
            response_focus = await enviar_nfe_focus(nfe_data)
        except Exception as focus_error:
            # DEBUG: Mostrar erro completo
            print("\n" + "="*60)
            print("ERRO COMPLETO DA FOCUS NFE:")
            print("="*60)
            print(f"Tipo do erro: {type(focus_error).__name__}")
            print(f"Mensagem: {str(focus_error)}")
            
            # Tentar extrair mais detalhes se for erro HTTP
            if hasattr(focus_error, 'response'):
                print(f"Status HTTP: {focus_error.response.status_code}")
                try:
                    error_json = focus_error.response.json()
                    print("Resposta JSON:")
                    print(json.dumps(error_json, indent=2, ensure_ascii=False))
                except:
                    print("Resposta texto:")
                    print(focus_error.response.text[:1000])
            print("="*60 + "\n")
            
            # Fazer rollback se der erro na Focus
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f'Erro ao enviar NFe para Focus: {str(focus_error)}'
            ) from focus_error

        # Processar resposta da Focus NFe
        status_nfe = response_focus.get('status', 'erro')
        protocolo = response_focus.get('protocolo')
        chave = response_focus.get('chave_nfe')
        xml_url = response_focus.get('caminho_xml_nota_fiscal')
        danfe_url = response_focus.get('caminho_danfe')

        # Mapear status da Focus para nosso status
        status_mapeado = {
            'autorizado': 'autorizado',
            'processando': 'processando',
            'cancelado': 'cancelado',
            'erro_autorizacao': 'erro',
            'denegado': 'erro',
        }.get(status_nfe, 'erro')

        # Atualizar registro com dados da NFe (sem commit ainda)
        db_carregamento = carregamento_crud.update_nfe_data(
            db,
            db_obj=db_carregamento,
            nfe_status=status_mapeado,
            nfe_protocolo=protocolo,
            nfe_chave=chave,
            nfe_xml_url=xml_url,
            nfe_danfe_url=danfe_url,
            commit=False,
        )

        # Commit final se tudo deu certo
        db.commit()
        db.refresh(db_carregamento)

        # Retornar apenas os campos necessários para o frontend
        return {
            'id': db_carregamento.id,
            'nfe_ref': db_carregamento.nfe_ref,
            'nfe_status': db_carregamento.nfe_status,
            'nfe_xml_url': db_carregamento.nfe_xml_url,
            'nfe_danfe_url': db_carregamento.nfe_danfe_url,
        }

    except HTTPException:
        # Re-raise HTTP exceptions (já faz rollback se necessário)
        raise
    except Exception as exc:
        # Em caso de qualquer outro erro, fazer rollback
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro interno ao processar NFe: {str(exc)}'
        ) from exc

