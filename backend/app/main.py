from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


app.include_router(api_router, prefix=settings.API_V1_STR)



