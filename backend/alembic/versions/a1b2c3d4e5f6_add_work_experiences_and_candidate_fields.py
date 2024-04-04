"""add_work_experiences_and_candidate_fields

Revision ID: a1b2c3d4e5f6
Revises: 0799d16a1182
Create Date: 2026-02-12 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "0799d16a1182"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to candidates table
    op.add_column("candidates", sa.Column("address", sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True))
    op.add_column("candidates", sa.Column("date_of_birth", sa.Date(), nullable=True))

    # Create work_experiences table
    op.create_table(
        "work_experiences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("company_name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("job_title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("start_date", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column("end_date", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column("is_current", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("location", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_work_experiences_candidate_id"), "work_experiences", ["candidate_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_work_experiences_candidate_id"), table_name="work_experiences")
    op.drop_table("work_experiences")
    op.drop_column("candidates", "date_of_birth")
    op.drop_column("candidates", "address")
