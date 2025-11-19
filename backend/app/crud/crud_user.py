from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


class CRUDUser:
    def get(self, db: Session, *, user_id: UUID | str) -> User | None:
        if isinstance(user_id, str):
            try:
                user_id = UUID(user_id)
            except ValueError:
                return None
        return db.get(User, user_id)

    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_user = User(
            name=obj_in.name,
            email=obj_in.email.lower(),
            hashed_password=get_password_hash(obj_in.password),
            role=obj_in.role,
            farm_id=obj_in.farm_id,
            phone=obj_in.phone,
        )
        db.add(db_user)
        db.flush()
        return db_user

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def ensure_system_admin(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        name: str = 'System Admin',
    ) -> User:
        user = self.get_by_email(db, email=email)
        if user:
            return user
        new_user = User(
            name=name,
            email=email.lower(),
            hashed_password=get_password_hash(password),
            role=UserRole.SYSTEM_ADMIN,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user


user = CRUDUser()

