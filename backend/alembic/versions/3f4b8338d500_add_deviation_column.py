"""Add deviation column

Revision ID: 3f4b8338d500
Revises: 0c6ac977b5b8
Create Date: 2022-07-02 21:29:17.983732

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f4b8338d500'
down_revision = '0c6ac977b5b8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('Measurements', sa.Column('deviation', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('Measurements', 'deviation')
    # ### end Alembic commands ###
