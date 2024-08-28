"""root_nodes table

Revision ID: f174946860d6
Revises: 6c969c1cb484
Create Date: 2024-08-22 23:15:10.651178
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision: str = 'f174946860d6'
down_revision: Union[str, None] = '6c969c1cb484'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'root_nodes',
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
    op.drop_table('root_nodes')
