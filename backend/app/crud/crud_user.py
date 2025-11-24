from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.models.permissions_enum import BaseRole
from app.schemas.user import UserCreate


class CRUDUser:
    def get(self, db: Session, *, user_id: int | str) -> User | None:
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                return None
        return db.get(User, user_id)

    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_user = User(
            group_id=obj_in.group_id,
            name=obj_in.name,
            cpf=obj_in.cpf,
            email=obj_in.email.lower(),
            password_hash=get_password_hash(obj_in.password),
            base_role=obj_in.base_role,
        )
        db.add(db_user)
        db.flush()
        return db_user

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def ensure_system_admin(
        self,
        db: Session,
        *,
        email: str,
        password: str,
        name: str = 'System Admin',
        group_id: int | None = None,
    ) -> User:
        user = self.get_by_email(db, email=email)
        if user:
            return user
        # System admin pode não ter grupo (group_id pode ser None temporariamente)
        # Mas o modelo exige group_id, então precisamos criar um grupo ou ajustar
        # Por enquanto, vamos exigir group_id
        if group_id is None:
            raise ValueError("group_id is required for system admin")
        new_user = User(
            group_id=group_id,
            name=name,
            cpf='00000000000',  # CPF temporário para system admin
            email=email.lower(),
            password_hash=get_password_hash(password),
            base_role=BaseRole.SYSTEM_ADMIN,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user


user = CRUDUser()

