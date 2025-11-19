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

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )


@app.on_event('startup')
def ensure_admin_user() -> None:
    if not settings.FIRST_SYSTEM_ADMIN_EMAIL or not settings.FIRST_SYSTEM_ADMIN_PASSWORD:
        return

    db: Session = SessionLocal()
    try:
        user_crud.ensure_system_admin(
            db,
            email=settings.FIRST_SYSTEM_ADMIN_EMAIL,
            password=settings.FIRST_SYSTEM_ADMIN_PASSWORD,
        )
    finally:
        db.close()


app.include_router(api_router, prefix=settings.API_V1_STR)



