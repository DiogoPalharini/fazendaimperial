from fastapi import APIRouter

from app.core.modules import MODULE_DEFINITIONS, as_json
from app.schemas.module import ModuleRead

router = APIRouter()


@router.get('', response_model=list[ModuleRead])
def list_modules() -> list[ModuleRead]:
    return [ModuleRead(**as_json(module)) for module in MODULE_DEFINITIONS]

