from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import get_settings
from app.core.security import create_access_token
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.user import User
from app.models.group import Group
from app.models.farm import Farm
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserRead

router = APIRouter()


@router.post('/login', response_model=Token)
def login_for_access_token(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = user_crud.authenticate(db, email=payload.username, password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect email or password')
    settings = get_settings()
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=str(user.id), expires_delta=expires)
    return Token(access_token=token)


@router.get('/me', response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_active_user)) -> UserRead:
    return UserRead(
        id=current_user.id,
        group_id=current_user.group_id,
        name=current_user.name,
        cpf=current_user.cpf,
        email=current_user.email,
        base_role=current_user.base_role,
        active=current_user.active,
        created_at=current_user.created_at,
    )


@router.get('/me/modules', response_model=List[str])
def get_user_allowed_modules(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> List[str]:
    """Retorna os módulos permitidos para o usuário baseado nas fazendas do grupo"""
    # Buscar grupo do usuário
    group = db.query(Group).filter(Group.id == current_user.group_id).first()
    if not group:
        return []
    
    # Buscar todas as fazendas do grupo
    farms = db.query(Farm).filter(Farm.group_id == group.id).all()
    
    # Extrair módulos únicos de todas as fazendas
    allowed_modules = set()
    for farm in farms:
        if farm.modules and isinstance(farm.modules, dict):
            if 'enabled' in farm.modules and isinstance(farm.modules['enabled'], list):
                allowed_modules.update(farm.modules['enabled'])
    
    return sorted(list(allowed_modules))



