"""add_placement_officer_role

Revision ID: f6g7h8i9j0k1
Revises: e5f6g7h8i9j0
Create Date: 2026-02-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "f6g7h8i9j0k1"
down_revision: Union[str, None] = "e5f6g7h8i9j0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'PLACEMENT_OFFICER'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values; no-op
    pass
