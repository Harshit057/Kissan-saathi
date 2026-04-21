"""
Database Connection & Session Management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, StaticPool
from app.config import get_settings

settings = get_settings()

# Use StaticPool for SQLite, NullPool for PostgreSQL
is_sqlite = settings.DATABASE_URL.startswith('sqlite')

# Create engine with connection pooling
if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=NullPool if settings.DEBUG else None,
        pool_size=settings.SQLALCHEMY_POOL_SIZE,
        max_overflow=settings.SQLALCHEMY_MAX_OVERFLOW,
        pool_pre_ping=settings.SQLALCHEMY_POOL_PRE_PING,
        echo=settings.DEBUG,
    )

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
