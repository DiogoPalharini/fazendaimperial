from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.routes import api_router
from app.core.config import get_settings
from app.crud import user as user_crud
from app.db.session import SessionLocal

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version='0.1.0',
    openapi_url=f'{settings.API_V1_STR}/openapi.json',
)

# CORS configuration
cors_origins = settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else ["http://localhost:5173", "http://localhost:3000"]
print(f"🔧 CORS Origins configurados: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def ensure_admin_user() -> None:
    # TODO: Implementar criação de system admin com grupo
    # Por enquanto desabilitado pois requer group_id
    # if not settings.FIRST_SYSTEM_ADMIN_EMAIL or not settings.FIRST_SYSTEM_ADMIN_PASSWORD:
    #     return
    #
    # db: Session = SessionLocal()
    # try:
    #     user_crud.ensure_system_admin(
    #         db,
    #         email=settings.FIRST_SYSTEM_ADMIN_EMAIL,
    #         password=settings.FIRST_SYSTEM_ADMIN_PASSWORD,
    #         group_id=1,  # Precisa criar grupo primeiro
    #     )
    # finally:
    #     db.close()
    pass


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para mostrar erros de validação de forma mais clara"""
    errors = []
    for error in exc.errors():
        field = '.'.join(str(loc) for loc in error['loc'] if loc != 'body')
        errors.append({
            'field': field,
            'message': error['msg'],
            'type': error['type']
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            'detail': 'Erro de validação',
            'errors': errors
        }
    )

app.include_router(api_router, prefix=settings.API_V1_STR)



