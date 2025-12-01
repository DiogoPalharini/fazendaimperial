"""create_carregamentos_table

Revision ID: a8f1b50c055f
Revises: e854894c36d0
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8f1b50c055f'
down_revision: Union[str, Sequence[str], None] = 'e854894c36d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'carregamentos',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('truck', sa.String(length=10), nullable=False),
        sa.Column('driver', sa.String(length=120), nullable=False),
        sa.Column('farm', sa.String(length=160), nullable=False),
        sa.Column('field', sa.String(length=120), nullable=False),
        sa.Column('product', sa.String(length=80), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=10), nullable=False),
        sa.Column('destination', sa.String(length=160), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('nfe_ref', sa.String(length=255), nullable=True),
        sa.Column('nfe_status', sa.String(length=50), nullable=True),
        sa.Column('nfe_protocolo', sa.String(length=255), nullable=True),
        sa.Column('nfe_chave', sa.String(length=44), nullable=True),
        sa.Column('nfe_xml_url', sa.String(length=500), nullable=True),
        sa.Column('nfe_danfe_url', sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('carregamentos')

