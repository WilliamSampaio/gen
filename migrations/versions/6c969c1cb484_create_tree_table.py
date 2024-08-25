"""tree table

Revision ID: 6c969c1cb484
Revises:
Create Date: 2024-08-20 01:03:18.769076
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = '6c969c1cb484'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'tree',
        sa.Column('id', sa.String(8), primary_key=True),
        sa.Column('name', sa.String(100)),
        sa.Column('born_in', sa.Date()),
        sa.Column('died_in', sa.Date()),
        sa.Column('gender', sa.CHAR()),
        sa.Column('father_id', sa.String(8), sa.ForeignKey('tree.id')),
        sa.Column('mother_id', sa.String(8), sa.ForeignKey('tree.id')),
        sa.Column(
            'inserted_in',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table('tree')
