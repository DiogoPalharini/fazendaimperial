from datetime import timedelta
from typing import List, Any

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


@router.get('/me/modules', response_model=Any)
def get_user_allowed_modules(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """Retorna os módulos permitidos para o usuário com suas permissões granulares"""
    # Buscar grupo do usuário
    group = db.query(Group).filter(Group.id == current_user.group_id).first()
    if not group:
        return {}
    
    # Buscar todas as fazendas do grupo
    farms = db.query(Farm.group_id == group.id).all() # Correction: filter(Farm.group_id ...).all()
    farms = db.query(Farm).filter(Farm.group_id == group.id).all()
    
    # Buscar permissões do usuário
    from app.crud.crud_user_farm_permissions import user_farm_permissions as user_farm_permissions_crud
    
    # Dicionário final: { module_key: { read: bool, create: bool ... } }
    merged_permissions = {}

    for farm in farms:
        # Check explicit permissions
        permission = user_farm_permissions_crud.get_by_user_and_farm(db, user_id=current_user.id, farm_id=farm.id)
        
        # Determine permissions for this farm
        farm_perms = {}
        
        if permission and permission.allowed_modules:
             # Use explicit permissions
             farm_perms = permission.allowed_modules
        elif current_user.base_role in ['owner', 'system_admin', 'manager']:
             # Se for Manager/Owner e não tiver permissão explícita, assume acesso TOTAL aos módulos habilitados da fazenda
             if farm.modules and isinstance(farm.modules, dict):
                enabled_modules = []
                if 'enabled' in farm.modules and isinstance(farm.modules['enabled'], list):
                    enabled_modules = farm.modules['enabled']
                elif isinstance(farm.modules, dict): 
                     # Handle legacy flat structure or whatever
                     enabled_modules = [k for k,v in farm.modules.items() if v]

                for mod in enabled_modules:
                    # Give full power
                    farm_perms[mod] = {
                        'read': True, 'create': True, 'update': True, 'delete': True, 
                        'dashboard': True, 'manage_weight': True, 'manage_quality': True
                    }

        # Force strictness for OPERATIONAL roles:
        if current_user.base_role == 'operational' and not permission:
            farm_perms = {}

        # Merge into global (OR logic)
        for mod, perms in farm_perms.items():
            if not isinstance(perms, dict): continue

            if mod not in merged_permissions:
                merged_permissions[mod] = perms.copy()
            else:
                # Merge booleans
                for k, v in perms.items():
                    if v is True:
                        merged_permissions[mod][k] = True
    
    return merged_permissions



