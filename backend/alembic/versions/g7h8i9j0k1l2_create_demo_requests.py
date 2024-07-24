"""create_demo_requests

Revision ID: g7h8i9j0k1l2
Revises: f6g7h8i9j0k1
Create Date: 2026-02-26 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "g7h8i9j0k1l2"
down_revision: Union[str, None] = "f6g7h8i9j0k1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE demorequeststatus AS ENUM ('pending', 'contacted', 'closed'); "
        "EXCEPTION WHEN duplicate_object THEN NULL; "
        "END $$"
    )
    op.execute("""
        CREATE TABLE demo_requests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255),
            phone VARCHAR(50),
            message TEXT,
            status demorequeststatus NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX ix_demo_requests_email ON demo_requests (email)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS demo_requests")
    op.execute("DROP TYPE IF EXISTS demorequeststatus")
