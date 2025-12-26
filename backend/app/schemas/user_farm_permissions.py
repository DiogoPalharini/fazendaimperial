from pydantic import BaseModel
from typing import Dict, Optional

class ModulePermission(BaseModel):
    read: bool = True
    create: bool = False
    update: bool = False
    delete: bool = False
    dashboard: bool = False
    manage_weight: bool = False
    manage_quality: bool = False

    class Config:
        extra = 'allow'

class UserFarmPermissionsBase(BaseModel):
    allowed_modules: Optional[Dict[str, ModulePermission]] = None

class UserFarmPermissionsCreate(UserFarmPermissionsBase):
    user_id: int
    farm_id: int

class UserFarmPermissionsUpdate(UserFarmPermissionsBase):
    pass

class UserFarmPermissionsRead(UserFarmPermissionsBase):
    id: int
    user_id: int
    farm_id: int

    class Config:
        from_attributes = True
