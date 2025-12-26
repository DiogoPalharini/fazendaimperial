from fastapi import APIRouter

from . import auth, modules, groups, users, carregamentos, producao, armazens, destinatarios
from . import farms

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(groups.router, prefix='/groups', tags=['groups'])
api_router.include_router(users.router, prefix='/users', tags=['users'])
api_router.include_router(farms.router, prefix='/farms', tags=['farms'])
api_router.include_router(modules.router, prefix='/modules', tags=['modules'])
api_router.include_router(carregamentos.router, prefix='/carregamentos', tags=['carregamentos'])
api_router.include_router(producao.router, prefix='/producao', tags=['producao'])
api_router.include_router(armazens.router, prefix='/armazens', tags=['armazens'])
api_router.include_router(destinatarios.router, prefix='/destinatarios', tags=['destinatarios'])

__all__ = ['api_router']



