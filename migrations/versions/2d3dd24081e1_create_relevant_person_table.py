"""relevant_person table

Revision ID: 2d3dd24081e1
Revises: f174946860d6
Create Date: 2024-08-22 23:25:48.210242
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = '2d3dd24081e1'
down_revision: Union[str, None] = 'f174946860d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'relevant_person',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column(
            'tree_id',
            sa.String(8),
            sa.ForeignKey('tree.id', ondelete='CASCADE'),
            unique=True,
            nullable=False,
        ),
        sa.Column(
            'inserted_in',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table('relevant_person')
