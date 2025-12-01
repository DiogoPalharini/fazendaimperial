from fastapi import APIRouter

from . import auth, modules, groups, carregamentos
# from . import farms  # TODO: Atualizar para novo modelo

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(groups.router, prefix='/groups', tags=['groups'])
# api_router.include_router(farms.router, prefix='/farms', tags=['farms'])  # Temporariamente desabilitado
api_router.include_router(modules.router, prefix='/modules', tags=['modules'])
api_router.include_router(carregamentos.router, prefix='/carregamentos', tags=['carregamentos'])

__all__ = ['api_router']



