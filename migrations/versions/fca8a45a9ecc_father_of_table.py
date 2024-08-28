"""father_of table

Revision ID: fca8a45a9ecc
Revises: 2d3dd24081e1
Create Date: 2024-08-27 23:49:10.173726
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = 'fca8a45a9ecc'
down_revision: Union[str, None] = '2d3dd24081e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'father_of',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column(
            'father_id',
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
        'father_of_uniq', 'father_of', ['father_id', 'son_id']
    )


def downgrade() -> None:
    op.drop_table('father_of')
