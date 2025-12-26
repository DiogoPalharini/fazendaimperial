from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_current_system_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.crud import user as user_crud
from app.crud.crud_user_farm_permissions import user_farm_permissions as user_farm_permissions_crud
from app.models.user_farm_permissions import UserFarmPermissions
from app.schemas.user_farm_permissions import UserFarmPermissionsCreate, UserFarmPermissionsUpdate, UserFarmPermissionsRead

router = APIRouter()

# --- User Management (Group Context) ---

@router.get('', response_model=List[UserRead])
def get_group_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[UserRead]:
    """List all users in the current user's group"""
    # Unless system_admin, can only see own group members
    group_id = current_user.group_id
    if current_user.base_role == 'system_admin':
        # TODO: admin might want to pass group_id param, for now listing all users involves complexity, 
        # let's restrict to group logic similar to non-admins or implement separate admin endpoint.
        pass
    
    users = db.query(User).filter(User.group_id == group_id).all()
    return users

@router.post('', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_group_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> UserRead:
    """Create a new user within the current user's group"""
    # Enforce Permissions: Only MANAGER, OWNER, or ADMIN can create users
    if current_user.base_role not in ['manager', 'owner', 'system_admin']:
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    # Force group_id to match current user's group (unless admin overriding via some mechanism, but here we enforce context)
    if current_user.base_role != 'system_admin':
        user_in.group_id = current_user.group_id
        
    user = user_crud.create(db, obj_in=user_in)
    return user

# --- Permission Management ---

@router.get('/{user_id}/permissions/{farm_id}', response_model=UserFarmPermissionsRead)
def get_user_farm_permissions(
    user_id: int,
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get permissions for a specific user on a specific farm"""
    # check access
    target_user = user_crud.get(db, id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.base_role != 'system_admin' and target_user.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user")

    permission = user_farm_permissions_crud.get_by_user_and_farm(db, user_id=user_id, farm_id=farm_id)
    
    if not permission:
        # Return empty default if not exists, but maintaining schema
        return UserFarmPermissionsRead(
            id=0, # Virtual ID
            user_id=user_id,
            farm_id=farm_id,
            allowed_modules={} 
        )
    return permission

@router.put('/{user_id}/permissions/{farm_id}', response_model=UserFarmPermissionsRead)
def update_user_farm_permissions(
    user_id: int,
    farm_id: int,
    permission_in: UserFarmPermissionsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update (or Create) permissions for a user on a farm"""
    if current_user.base_role not in ['manager', 'owner', 'system_admin']:
         raise HTTPException(status_code=403, detail="Not authorized to manage permissions")
    
    target_user = user_crud.get(db, id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.base_role != 'system_admin' and target_user.group_id != current_user.group_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    existing_permission = user_farm_permissions_crud.get_by_user_and_farm(db, user_id=user_id, farm_id=farm_id)
    
    if existing_permission:
        updated_perm = user_farm_permissions_crud.update(db, db_obj=existing_permission, obj_in=permission_in)
        return updated_perm
    else:
        # Create new
        perm_create = UserFarmPermissionsCreate(
            user_id=user_id,
            farm_id=farm_id,
            allowed_modules=permission_in.allowed_modules
        )
        new_perm = user_farm_permissions_crud.create(db, obj_in=perm_create)
        return new_perm
