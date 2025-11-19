from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class TokenPayload(BaseModel):
    sub: str | None = None


class LoginRequest(BaseModel):
    username: EmailStr
    password: str = Field(min_length=4, max_length=128)



