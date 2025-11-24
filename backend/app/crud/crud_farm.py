from __future__ import annotations

import re
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.modules import MODULE_KEYS
from app.core.security import get_password_hash
from app.models.farm import Farm, FarmStatus
from app.models.farm_module import FarmModule
from app.models.user import User
from app.models.permissions_enum import BaseRole
from app.schemas.farm import FarmCreate


class CRUDFarm:
    def get_multi(self, db: Session) -> Sequence[Farm]:
        return (
            db.execute(
                select(Farm)
                .options(joinedload(Farm.owner), joinedload(Farm.feature_modules), joinedload(Farm.users))
                .order_by(Farm.created_at.desc())
            )
            .scalars()
            .all()
        )

    def create_with_owner(self, db: Session, *, obj_in: FarmCreate) -> Farm:
        modules = list(dict.fromkeys(obj_in.modules))
        invalid = [module for module in modules if module not in MODULE_KEYS]
        if invalid:
            raise ValueError(f'Modules not recognized: {", ".join(invalid)}')

        farm_code = obj_in.code or self._slugify(obj_in.name)

        if db.query(Farm).filter(Farm.code == farm_code).first():
            raise ValueError('Farm code already exists')

        if db.query(User).filter(User.email == obj_in.owner.email.lower()).first():
            raise ValueError('Owner email already exists')

        db_farm = Farm(
            name=obj_in.name,
            code=farm_code.upper(),
            city_state=obj_in.city_state,
            hectares=obj_in.hectares,
            status=obj_in.status or FarmStatus.ACTIVE,
        )
        db.add(db_farm)
        db.flush()

        owner = User(
            name=obj_in.owner.name,
            email=obj_in.owner.email.lower(),
            hashed_password=get_password_hash(obj_in.owner.password),
            base_role=BaseRole.OWNER,
            farm_id=db_farm.id,
            phone=obj_in.owner.phone,
        )
        db.add(owner)
        db.flush()

        db_farm.owner_id = owner.id
        db_farm.feature_modules = [FarmModule(farm_id=db_farm.id, module_key=module) for module in modules]

        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Failed to create farm') from exc

        db.refresh(db_farm)
        return db_farm

    def _slugify(self, value: str) -> str:
        slug = re.sub(r'[^A-Za-z0-9]+', '-', value).strip('-')
        return slug[:32] or 'FARM'


farm = CRUDFarm()

