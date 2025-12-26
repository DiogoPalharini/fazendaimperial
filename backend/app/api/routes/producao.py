from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.carregamento import Carregamento
from app.models.user import User

router = APIRouter()

@router.get('/resumo')
def get_producao_resumo(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Retorna o resumo da produção:
    - Total Colhido (Mockado ou somado de talhões se existisse tabela)
    - Total Carregado (Soma de peso_com_desconto_fazenda dos carregamentos)
    - Saldo (Colhido - Carregado)
    """
    
    # 1. Total Colhido (Mockado por enquanto, pois não temos tabela de colheita detalhada acessível aqui ainda)
    # Em um cenário real, somaríamos a produção dos talhões.
    # Vamos assumir um valor fixo ou buscar de algum lugar se o usuário tiver definido.
    # Para o MVP, vamos retornar um valor alto fixo ou 0 se não tiver nada.
    total_colhido = 0.0
    
    # 2. Total Carregado
    # Soma do peso considerado pela fazenda (peso_com_desconto_fazenda)
    # Se for nulo, usa quantity (legado) ou 0
    
    val_desconto = db.query(func.sum(Carregamento.peso_com_desconto_fazenda)).scalar()
    total_carregado = float(val_desconto) if val_desconto is not None else 0.0
    
    # Se o peso com desconto for 0 (dados antigos), tentar somar quantity
    if total_carregado == 0:
         val_mtd = db.query(func.sum(Carregamento.quantity)).scalar()
         total_carregado = float(val_mtd) if val_mtd is not None else 0.0

    # 3. Saldo
    saldo = total_colhido - total_carregado
    
    return {
        "total_colhido": total_colhido,
        "total_carregado": total_carregado,
        "saldo": saldo
    }
