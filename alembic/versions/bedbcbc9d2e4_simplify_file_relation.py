"""Simplify file relation

Revision ID: bedbcbc9d2e4
Revises: 9a1667c55c2e
Create Date: 2022-03-12 19:18:06.159098

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'bedbcbc9d2e4'
down_revision = '9a1667c55c2e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('Measurements_photo_file_fkey', 'Measurements', type_='foreignkey')
    op.drop_constraint('Measurements_recording_file_fkey', 'Measurements', type_='foreignkey')
    op.drop_column('Measurements', 'recording_file')
    op.drop_column('Measurements', 'photo_file')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('Measurements', sa.Column('photo_file', postgresql.UUID(), autoincrement=False, nullable=True))
    op.add_column('Measurements', sa.Column('recording_file', postgresql.UUID(), autoincrement=False, nullable=True))
    op.create_foreign_key('Measurements_recording_file_fkey', 'Measurements', 'Files', ['recording_file'], ['id'])
    op.create_foreign_key('Measurements_photo_file_fkey', 'Measurements', 'Files', ['photo_file'], ['id'])
    # ### end Alembic commands ###
