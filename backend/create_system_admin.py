"""
Script temporário para criar um usuário system_admin.
Execute este script e depois delete-o.

Uso:
    python create_system_admin.py
"""
import sys
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.group import Group
from app.models.user import User
from app.models.permissions_enum import BaseRole


def create_system_admin():
    """Cria um usuário system_admin"""
    db: Session = SessionLocal()
    
    try:
        # Solicitar dados do usuário
        print("=" * 50)
        print("Criação de Usuário System Admin")
        print("=" * 50)
        
        name = input("Nome completo: ").strip()
        if not name:
            print("❌ Nome é obrigatório!")
            return
        
        email = input("Email: ").strip()
        if not email:
            print("❌ Email é obrigatório!")
            return
        
        # Verificar se o email já existe
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ Email {email} já está em uso!")
            return
        
        cpf = input("CPF (apenas números): ").strip()
        if not cpf:
            print("❌ CPF é obrigatório!")
            return
        
        # Validar CPF (básico - apenas verificar se tem 11 dígitos)
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        if len(cpf_clean) != 11:
            print("❌ CPF deve ter 11 dígitos!")
            return
        
        password = input("Senha: ").strip()
        if not password:
            print("❌ Senha é obrigatória!")
            return
        
        if len(password) < 6:
            print("❌ Senha deve ter pelo menos 6 caracteres!")
            return
        
        # Criar ou obter grupo para system_admin
        # System admins podem não ter grupo específico, então criamos um grupo especial
        admin_group = db.query(Group).filter(Group.name == "System Administrators").first()
        
        if not admin_group:
            print("Criando grupo 'System Administrators'...")
            admin_group = Group(
                name="System Administrators",
                owner_id=None  # System admins não têm owner
            )
            db.add(admin_group)
            db.flush()  # Para obter o ID do grupo
            print("✅ Grupo criado!")
        
        # Criar usuário system_admin
        print("\nCriando usuário system_admin...")
        user = User(
            group_id=admin_group.id,
            name=name,
            cpf=cpf_clean,
            email=email,
            password_hash=get_password_hash(password),
            base_role=BaseRole.SYSTEM_ADMIN,
            active=True
        )
        
        db.add(user)
        db.commit()
        
        print("=" * 50)
        print("✅ Usuário system_admin criado com sucesso!")
        print("=" * 50)
        print(f"ID: {user.id}")
        print(f"Nome: {user.name}")
        print(f"Email: {user.email}")
        print(f"CPF: {user.cpf}")
        print(f"Role: {user.base_role.value}")
        print("=" * 50)
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar usuário: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    try:
        create_system_admin()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

