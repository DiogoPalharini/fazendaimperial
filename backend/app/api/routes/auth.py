from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.crud import user as user_crud
from app.db.session import get_db
from app.schemas.auth import LoginRequest, Token

router = APIRouter()


@router.post('/login', response_model=Token)
def login_for_access_token(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = user_crud.authenticate(db, email=payload.username, password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect email or password')
    settings = get_settings()
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=str(user.id), expires_delta=expires)
    return Token(access_token=token)



