from fastapi import APIRouter

from . import auth, farms, modules

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(farms.router, prefix='/farms', tags=['farms'])
api_router.include_router(modules.router, prefix='/modules', tags=['modules'])

__all__ = ['api_router']



