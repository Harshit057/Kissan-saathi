"""
FastAPI Main Application - KisanSaathi & आपनGaon Backend
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from app.config import get_settings
from app.database import engine
from app.models import Base
from app.api import auth_routes, farmer_routes, marketplace_routes, schemes_market_ai_routes

# Configuration
settings = get_settings()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for KisanSaathi (Farmer Platform) & आपनGaon (Consumer Marketplace)",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✓ Database tables created/verified")
except Exception as e:
    logger.warning(f"⚠️ Database initialization warning: {str(e)}")
    logger.info("Continuing without database - using mock data where possible")

# ============================================================================
# MIDDLEWARE CONFIGURATION
# ============================================================================

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# ============================================================================
# ERROR HANDLING
# ============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


# ============================================================================
# HEALTH CHECK & INFO ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME
    }


@app.get("/api/v1")
def api_info():
    """API information"""
    return {
        "api_name": settings.APP_NAME,
        "version": settings.VERSION,
        "available_endpoints": {
            "authentication": "/api/v1/auth",
            "farmers": "/api/v1/farmers",
            "marketplace": "/api/v1/marketplace",
            "schemes": "/api/v1/schemes",
            "market": "/api/v1/market",
            "ai_assistant": "/api/v1/ai"
        },
        "documentation": "/docs"
    }


# ============================================================================
# ROUTE INCLUSION
# ============================================================================

# Authentication routes
app.include_router(auth_routes.router)

# Farmer routes
app.include_router(farmer_routes.router)

# Marketplace routes
app.include_router(marketplace_routes.router)

# Schemes, Market, and AI routes
app.include_router(schemes_market_ai_routes.schemes_router)
app.include_router(schemes_market_ai_routes.market_router)
app.include_router(schemes_market_ai_routes.ai_router)


# ============================================================================
# STARTUP & SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Database: {settings.DATABASE_URL}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info(f"Shutting down {settings.APP_NAME}")


# ============================================================================
# VERSION ENDPOINT
# ============================================================================

@app.get("/api/version")
def get_version():
    """Get API version"""
    return {"version": settings.VERSION}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
