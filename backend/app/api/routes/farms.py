from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_system_admin, get_current_active_user
from app.crud import farm as farm_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmRead
from app.schemas.field import FieldCreate, FieldRead, FieldUpdate
from app.crud import farm as farm_crud
from app.crud import field as field_crud

router = APIRouter()


@router.get('', response_model=list[FarmRead])
def list_farms(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[FarmRead]:
    from app.models.permissions_enum import BaseRole
    
    if current_user.base_role == BaseRole.SYSTEM_ADMIN:
        farms = farm_crud.get_multi(db)
    else:
        # Filter by user's group
        from app.models.farm import Farm
        farms = db.query(Farm).filter(Farm.group_id == current_user.group_id).all()
        
    return farms


@router.post('', response_model=FarmRead, status_code=status.HTTP_201_CREATED)
def create_farm(
    payload: FarmCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FarmRead:
    # Check for duplicate name within the user's group
    from app.models.farm import Farm
    
    # Assuming group_id comes from the user if not strictly system admin overriding it
    # But usually creating a farm implies it belongs to the current user's group context
    group_id = current_user.group_id
    
    existing_farm = db.query(Farm).filter(
        Farm.name == payload.name,
        Farm.group_id == group_id
    ).first()
    
    if existing_farm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Uma fazenda com este nome já existe."
        )

    try:
        farm = farm_crud.create_with_owner(db, obj_in=payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return farm

@router.delete('/{farm_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Remove uma fazenda.
    """
    farm = farm_crud.get(db, id=farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Fazenda não encontrada")
        
    from app.models.permissions_enum import BaseRole
    if current_user.base_role != BaseRole.SYSTEM_ADMIN:
         if farm.group_id != current_user.group_id:
             raise HTTPException(status_code=403, detail="Sem permissão para esta fazenda")

    farm_crud.remove(db, id=farm_id)


@router.post('/{farm_id}/fields', response_model=FieldRead, status_code=status.HTTP_201_CREATED)
def create_field(
    farm_id: int,
    payload: FieldCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FieldRead:
    """
    Cria um novo talhão para a fazenda especificada.
    """
    farm = farm_crud.get(db, id=farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Fazenda não encontrada")
    
    # Check permission (is superuser OR farm belongs to user group)
    from app.models.permissions_enum import BaseRole
    if current_user.base_role != BaseRole.SYSTEM_ADMIN:
         if farm.group_id != current_user.group_id:
             raise HTTPException(status_code=403, detail="Sem permissão para esta fazenda")
    
    # Force farm_id in payload to match URL/Parent
    payload.farm_id = farm_id
    
    field = field_crud.create(db, obj_in=payload)
    return field


@router.get('/{farm_id}/fields', response_model=list[FieldRead])
def list_fields(
    farm_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> list[FieldRead]:
    """
    Lista todos os talhões de uma fazenda.
    """
    farm = farm_crud.get(db, id=farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Fazenda não encontrada")
        
    from app.models.permissions_enum import BaseRole
    if current_user.base_role != BaseRole.SYSTEM_ADMIN:
         if farm.group_id != current_user.group_id:
             raise HTTPException(status_code=403, detail="Sem permissão para esta fazenda")
    
    return farm.fields


@router.put('/{farm_id}/fields/{field_id}', response_model=FieldRead)
def update_field(
    farm_id: int,
    field_id: int,
    payload: FieldUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> FieldRead:
    """
    Atualiza um talhão existente.
    """
    farm = farm_crud.get(db, id=farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Fazenda não encontrada")
    
    from app.models.permissions_enum import BaseRole
    if current_user.base_role != BaseRole.SYSTEM_ADMIN:
         if farm.group_id != current_user.group_id:
             raise HTTPException(status_code=403, detail="Sem permissão para esta fazenda")

    field = field_crud.get(db, id=field_id)
    if not field or field.farm_id != farm_id:
        raise HTTPException(status_code=404, detail="Talhão não encontrado nesta fazenda")

    field = field_crud.update(db, db_obj=field, obj_in=payload)
    return field


@router.delete('/{farm_id}/fields/{field_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_field(
    farm_id: int,
    field_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Remove um talhão.
    """
    farm = farm_crud.get(db, id=farm_id)
    if not farm:
        raise HTTPException(status_code=404, detail="Fazenda não encontrada")
        
    from app.models.permissions_enum import BaseRole
    if current_user.base_role != BaseRole.SYSTEM_ADMIN:
         if farm.group_id != current_user.group_id:
             raise HTTPException(status_code=403, detail="Sem permissão para esta fazenda")

    field = field_crud.get(db, id=field_id)
    if not field or field.farm_id != farm_id:
        raise HTTPException(status_code=404, detail="Talhão não encontrado nesta fazenda")

    field_crud.remove(db, id=field_id)
