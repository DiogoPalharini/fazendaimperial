from fastapi import APIRouter, Depends, HTTPException, Query
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.cnpj_service import CNPJService

router = APIRouter()

@router.get("/busca")
async def buscar_cnpj(
    cnpj: str = Query(..., min_length=14, max_length=18, description="CNPJ do destinatário", regex=r'^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$'),
    current_user: User = Depends(get_current_active_user),
):
    """
    Busca dados de um CNPJ na receita federal (via API externa).
    
    Returns:
        JSON com dados cadastrais e de endereço.
    """
    # 1. Limpeza
    clean_cnpj = ''.join(filter(str.isdigit, cnpj))
    if len(clean_cnpj) != 14:
         raise HTTPException(status_code=400, detail="CNPJ inválido (deve ter 14 dígitos)")

    # 2. Busca (Poderia buscar no banco local aqui tb, mas MVP busca externo)
    data = await CNPJService.fetch_cnpj_data(clean_cnpj)
    
    if not data:
        raise HTTPException(status_code=404, detail="CNPJ não encontrado na base pública")
        
    return data
