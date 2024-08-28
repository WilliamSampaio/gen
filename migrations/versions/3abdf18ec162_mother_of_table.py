"""mother_of table

Revision ID: 3abdf18ec162
Revises: fca8a45a9ecc
Create Date: 2024-08-27 23:49:24.652926
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = '3abdf18ec162'
down_revision: Union[str, None] = 'fca8a45a9ecc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'mother_of',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column(
            'mother_id',
            sa.String(8),
            sa.ForeignKey('tree.id', ondelete='CASCADE'),
        ),
        sa.Column(
            'son_id',
            sa.String(8),
            sa.ForeignKey('tree.id', ondelete='CASCADE'),
        ),
        sa.Column(
            'inserted_in',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(),
        ),
    )
    op.create_unique_constraint(
        'mother_of_uniq', 'mother_of', ['mother_id', 'son_id']
    )


def downgrade() -> None:
    op.drop_table('mother_of')
