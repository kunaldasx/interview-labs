"""add_domain_id_to_candidates

Revision ID: d4e5f6g7h8i9
Revises: c3d4e5f6g7h8
Create Date: 2026-02-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4e5f6g7h8i9"
down_revision: Union[str, None] = "c3d4e5f6g7h8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("domain_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_candidates_domain_id",
        "candidates",
        "domains",
        ["domain_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_candidates_domain_id", "candidates", type_="foreignkey")
    op.drop_column("candidates", "domain_id")
