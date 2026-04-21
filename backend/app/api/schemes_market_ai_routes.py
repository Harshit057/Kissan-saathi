"""
Schemes, Market Data & AI Assistant API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import SchemeResponse, CropAdvisoryRequest
from app.services.scheme_service import SchemeService
from app.services.market_service import MandiPriceService, CropAdvisoryService, MarketDemandService
from app.services.ai_service import AIAssistantService, RAGService
from app.schemas import ChatRequest, ChatResponse

# Routes for different domains
schemes_router = APIRouter(prefix="/api/v1/schemes", tags=["Government Schemes"])
market_router = APIRouter(prefix="/api/v1/market", tags=["Market Data"])
ai_router = APIRouter(prefix="/api/v1/ai", tags=["AI Assistant"])


# ============================================================================
# GOVERNMENT SCHEMES ROUTES
# ============================================================================

@schemes_router.get("/discover")
def discover_schemes(
    farmer_id: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Discover applicable government schemes for farmer"""
    
    schemes = SchemeService.discover_schemes(db, farmer_id, state, district, limit)
    
    return {
        "farmer_id": farmer_id,
        "schemes": schemes,
        "total": len(schemes)
    }


@schemes_router.post("/check-eligibility")
def check_eligibility(
    farmer_id: str,
    scheme_id: str,
    db: Session = Depends(get_db)
):
    """Check farmer eligibility for a scheme"""
    
    result = SchemeService.check_eligibility(db, farmer_id, scheme_id)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@schemes_router.get("/farmer-schemes/{farmer_id}")
def get_farmer_schemes(
    farmer_id: str,
    db: Session = Depends(get_db)
):
    """Get all schemes for farmer (discovered & applied)"""
    
    schemes = SchemeService.get_farmer_schemes(db, farmer_id)
    
    return {
        "farmer_id": farmer_id,
        "schemes": schemes,
        "total": len(schemes)
    }


@schemes_router.post("/apply/{farmer_id}/{scheme_id}")
def apply_scheme(
    farmer_id: str,
    scheme_id: str,
    db: Session = Depends(get_db)
):
    """Mark scheme as applied by farmer"""
    
    result = SchemeService.mark_scheme_applied(db, farmer_id, scheme_id)
    return result


# ============================================================================
# MARKET DATA ROUTES
# ============================================================================

@market_router.get("/mandi-prices")
async def get_mandi_prices(
    crop_name: str,
    state: Optional[str] = None,
    market_name: Optional[str] = None,
):
    """Get live mandi prices from eNAM"""
    
    prices = await MandiPriceService.get_mandi_prices(crop_name, state, market_name)
    
    return {
        "crop_name": crop_name,
        "prices": prices,
        "total": len(prices),
        "data_source": "eNAM / AGMARKNET"
    }


@market_router.get("/price-trend")
def get_price_trend(
    crop_name: str,
    days: int = Query(30, ge=7, le=365)
):
    """Get historical price trend for crop"""
    
    trend = MandiPriceService.get_price_trend(crop_name, days)
    
    return {
        "crop_name": crop_name,
        "trend": trend,
        "days": days,
        "total_data_points": len(trend)
    }


@market_router.post("/crop-advisory")
def get_crop_advisory(
    crop_data: CropAdvisoryRequest
):
    """Get comprehensive crop advisory"""
    
    advisory = CropAdvisoryService.get_crop_advisory(
        crop_data.crop_name,
        crop_data.state,
        crop_data.district,
        crop_data.season,
        crop_data.soil_type,
        crop_data.land_size_hectares
    )
    
    if "error" in advisory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=advisory["error"]
        )
    
    return advisory


@market_router.get("/seasonal-crops")
def get_seasonal_crops(
    state: str,
    season: str
):
    """Get crops recommended for specific season"""
    
    crops = CropAdvisoryService.get_seasonal_crops(state, season)
    
    return {
        "state": state,
        "season": season,
        "crops": crops,
        "total": len(crops)
    }


@market_router.get("/demand/{crop_name}")
def get_market_demand(crop_name: str):
    """Get market demand information"""
    
    demand = MarketDemandService.get_market_demand(crop_name)
    
    return {
        "crop_name": crop_name,
        "market_demand": demand
    }


# ============================================================================
# AI ASSISTANT ROUTES
# ============================================================================

@ai_router.post("/chat")
def chat(
    request: ChatRequest,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Chat with AI assistant (RAG-powered).
    Supports multilingual queries and voice input.
    """
    
    # Get or create session
    if not request.session_id:
        session_id = AIAssistantService.start_conversation(db, user_id)
    else:
        session_id = request.session_id
    
    # Process query
    response = AIAssistantService.process_chat_query(
        db,
        request.message,
        session_id,
        request.language
    )
    
    if "error" in response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response["error"]
        )
    
    return response


@ai_router.get("/chat-history/{session_id}")
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get chat history for session"""
    
    conversation = AIAssistantService.get_conversation_history(db, session_id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return {
        "session_id": session_id,
        "messages": conversation.messages,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at
    }


@ai_router.post("/voice-chat")
async def voice_chat(
    request: ChatRequest,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Voice chat with AI assistant.
    Uploads audio file and returns voice response.
    """
    
    # TODO: Implement voice transcription and synthesis
    
    return {
        "message": "Voice chat not yet implemented",
        "status": "coming soon"
    }


@ai_router.get("/suggestions")
def get_suggestions(
    topic: str,
    language: str = "en"
):
    """Get suggestion prompts for AI assistant"""
    
    suggestions = {
        "crop": [
            "How do I grow wheat in my region?",
            "What's the best harvest time for tomatoes?",
            "Tell me about pest management for rice"
        ],
        "scheme": [
            "What government schemes am I eligible for?",
            "How do I apply for PM-KISAN?",
            "Tell me about crop insurance schemes"
        ],
        "market": [
            "What's the current market price for wheat?",
            "How can I get better prices for my crops?",
            "What crops are in high demand?"
        ]
    }
    
    return {
        "topic": topic,
        "language": language,
        "suggestions": suggestions.get(topic, [])
    }
