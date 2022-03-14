"""pls wrk

Revision ID: 196d4d117216
Revises: 
Create Date: 2022-03-11 21:13:27.734935

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import fastapi_users_db_sqlalchemy

# revision identifiers, used by Alembic.
revision = '196d4d117216'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('Files',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('author_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('mime', sa.String(length=64), nullable=True),
    sa.Column('original_name', sa.String(length=256), nullable=True),
    sa.Column('measurement_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['user.id'], use_alter=True),
    sa.ForeignKeyConstraint(['measurement_id'], ['Measurements.id'], use_alter=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_Files_author_id'), 'Files', ['author_id'], unique=False)
    op.create_index(op.f('ix_Files_measurement_id'), 'Files', ['measurement_id'], unique=False)
    op.create_table('user',
    sa.Column('id', fastapi_users_db_sqlalchemy.guid.GUID(), nullable=False),
    sa.Column('email', sa.String(length=320), nullable=False),
    sa.Column('hashed_password', sa.String(length=72), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('is_superuser', sa.Boolean(), nullable=False),
    sa.Column('is_verified', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_table('Measurements',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('location_string', sa.String(length=255), nullable=True),
    sa.Column('location_time', sa.DateTime(), nullable=True),
    sa.Column('notes', sa.String(length=1024), nullable=True),
    sa.Column('description', sa.String(length=2048), nullable=True),
    sa.Column('title', sa.String(length=512), nullable=True),
    sa.Column('author_id', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('tags', sa.String(length=1024), nullable=True),
    sa.Column('photo_file', postgresql.UUID(as_uuid=True), nullable=True),
    sa.Column('recording_file', postgresql.UUID(as_uuid=True), nullable=True),
    sa.ForeignKeyConstraint(['author_id'], ['user.id'], ),
    sa.ForeignKeyConstraint(['photo_file'], ['Files.id'], ),
    sa.ForeignKeyConstraint(['recording_file'], ['Files.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_Measurements_author_id'), 'Measurements', ['author_id'], unique=False)
    op.create_index(op.f('ix_Measurements_id'), 'Measurements', ['id'], unique=False)
    op.create_table('accesstoken',
    sa.Column('token', sa.String(length=43), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('user_id', fastapi_users_db_sqlalchemy.guid.GUID(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='cascade'),
    sa.PrimaryKeyConstraint('token')
    )
    op.create_index(op.f('ix_accesstoken_created_at'), 'accesstoken', ['created_at'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_accesstoken_created_at'), table_name='accesstoken')
    op.drop_table('accesstoken')
    op.drop_index(op.f('ix_Measurements_id'), table_name='Measurements')
    op.drop_index(op.f('ix_Measurements_author_id'), table_name='Measurements')
    op.drop_table('Measurements')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
    op.drop_index(op.f('ix_Files_measurement_id'), table_name='Files')
    op.drop_index(op.f('ix_Files_author_id'), table_name='Files')
    op.drop_table('Files')
    # ### end Alembic commands ###