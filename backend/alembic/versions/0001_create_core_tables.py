"""create core tables

Revision ID: 0001_create_core_tables
Revises:
Create Date: 2025-11-19
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_create_core_tables'
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    user_roles = postgresql.ENUM('system_admin', 'farm_owner', 'manager', 'employee', name='user_roles')
    farm_status = postgresql.ENUM('active', 'inactive', name='farm_status')
    user_roles.create(op.get_bind(), checkfirst=True)
    farm_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'users',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=32)),
        sa.Column('role', sa.Enum('system_admin', 'farm_owner', 'manager', 'employee', name='user_roles'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('farm_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'farms',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=160), nullable=False),
        sa.Column('code', sa.String(length=32), nullable=False, unique=True, index=True),
        sa.Column('city_state', sa.String(length=160), nullable=False),
        sa.Column('hectares', sa.Integer(), server_default='0', nullable=False),
        sa.Column('status', sa.Enum('active', 'inactive', name='farm_status'), nullable=False, server_default='active'),
        sa.Column('owner_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_foreign_key(
        'users_farm_id_fkey',
        source_table='users',
        referent_table='farms',
        local_cols=['farm_id'],
        remote_cols=['id'],
        ondelete='SET NULL',
    )

    op.create_table(
        'farm_modules',
        sa.Column('farm_id', sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey('farms.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('module_key', sa.String(length=64), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('farm_modules')
    op.drop_constraint('users_farm_id_fkey', 'users', type_='foreignkey')
    op.drop_table('farms')
    op.drop_table('users')
    postgresql.ENUM(name='farm_status').drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name='user_roles').drop(op.get_bind(), checkfirst=True)

