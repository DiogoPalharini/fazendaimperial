from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user_farm_permissions import UserFarmPermissions
from app.schemas.user_farm_permissions import UserFarmPermissionsCreate, UserFarmPermissionsUpdate

class CRUDUserFarmPermissions(CRUDBase[UserFarmPermissions, UserFarmPermissionsCreate, UserFarmPermissionsUpdate]):
    def get_by_user_and_farm(self, db: Session, *, user_id: int, farm_id: int) -> Optional[UserFarmPermissions]:
        return db.query(UserFarmPermissions).filter(
            UserFarmPermissions.user_id == user_id,
            UserFarmPermissions.farm_id == farm_id
        ).first()

user_farm_permissions = CRUDUserFarmPermissions(UserFarmPermissions)
