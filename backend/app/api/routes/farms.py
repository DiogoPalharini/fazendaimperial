from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_system_admin
from app.crud import farm as farm_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmRead

router = APIRouter()


@router.get('', response_model=list[FarmRead])
def list_farms(
    _: User = Depends(get_current_system_admin),
    db: Session = Depends(get_db),
) -> list[FarmRead]:
    farms = farm_crud.get_multi(db)
    response: list[FarmRead] = [
        FarmRead(
            id=farm.id,
            name=farm.name,
            code=farm.code,
            city_state=farm.city_state,
            hectares=farm.hectares,
            status=farm.status,
            created_at=farm.created_at,
            updated_at=farm.updated_at,
            modules=farm.module_keys,
            total_users=farm.total_users_count,
            owner=None
            if not farm.owner
            else {
                'id': farm.owner.id,
                'name': farm.owner.name,
                'email': farm.owner.email,
                'phone': farm.owner.phone,
            },
        )
        for farm in farms
    ]
    return response


@router.post('', response_model=FarmRead, status_code=status.HTTP_201_CREATED)
def create_farm(
    payload: FarmCreate,
    _: User = Depends(get_current_system_admin),
    db: Session = Depends(get_db),
) -> FarmRead:
    try:
        farm = farm_crud.create_with_owner(db, obj_in=payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return FarmRead(
        id=farm.id,
        name=farm.name,
        code=farm.code,
        city_state=farm.city_state,
        hectares=farm.hectares,
        status=farm.status,
        created_at=farm.created_at,
        updated_at=farm.updated_at,
        modules=farm.module_keys,
        total_users=farm.total_users_count,
        owner=None
        if not farm.owner
        else {
            'id': farm.owner.id,
            'name': farm.owner.name,
            'email': farm.owner.email,
            'phone': farm.owner.phone,
        },
    )

