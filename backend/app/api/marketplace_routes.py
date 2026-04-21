"""
Marketplace API Routes - आपनGaon Consumer Discovery & Orders
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas import (
    ConsumerCreateRequest,
    ConsumerResponse,
    NearbyFarmersRequest,
    OrderCreateRequest,
    OrderResponse,
    ReviewCreateRequest,
    ReviewResponse,
)
from app.services.marketplace_service import ConsumerService, MarketplaceService, OrderService, ReviewService

router = APIRouter(prefix="/api/v1/marketplace", tags=["Marketplace"])


# ============================================================================
# CONSUMER PROFILE ROUTES
# ============================================================================

@router.post("/consumers/profile", response_model=dict)
def create_consumer_profile(
    consumer_data: ConsumerCreateRequest,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Create consumer profile after registration"""
    
    result = ConsumerService.create_consumer_profile(db, user_id, consumer_data)
    return result


@router.get("/consumers/profile/{consumer_id}", response_model=ConsumerResponse)
def get_consumer_profile(
    consumer_id: str,
    db: Session = Depends(get_db)
):
    """Get consumer profile"""
    
    consumer = ConsumerService.get_consumer_profile(db, consumer_id)
    
    if not consumer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consumer not found"
        )
    
    return consumer


# ============================================================================
# MARKETPLACE DISCOVERY ROUTES (GEO-PROXIMITY)
# ============================================================================

@router.get("/nearby-farmers")
def get_nearby_farmers(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: int = Query(100, ge=10, le=500),
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("distance", regex="^(distance|rating|price)$"),
    db: Session = Depends(get_db)
):
    """
    Get nearby farmers within specified radius using geo-proximity.
    Returns listings ranked by distance, rating, or price.
    """
    
    listings = MarketplaceService.get_nearby_farmers(
        db,
        latitude,
        longitude,
        radius_km,
        category,
        limit,
        sort_by
    )
    
    return {
        "listings": listings,
        "total": len(listings),
        "radius_km": radius_km,
        "sort_by": sort_by
    }


@router.get("/listings")
def get_marketplace_listings(
    category: Optional[str] = None,
    is_organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get marketplace listings with filtering"""
    
    listings = MarketplaceService.get_marketplace_listings(
        db,
        category,
        is_organic,
        min_price,
        max_price,
        limit,
        offset
    )
    
    return {
        "listings": listings,
        "total": len(listings),
        "page_size": limit
    }


@router.get("/search")
def search_listings(
    q: str = Query(..., min_length=1),
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search listings by crop name"""
    
    listings = MarketplaceService.search_listings(
        db,
        q,
        latitude,
        longitude,
        limit
    )
    
    return {
        "search_query": q,
        "listings": listings,
        "total": len(listings)
    }


# ============================================================================
# ORDER MANAGEMENT ROUTES
# ============================================================================

@router.post("/orders", response_model=dict)
def create_order(
    consumer_id: str,
    order_data: OrderCreateRequest,
    db: Session = Depends(get_db)
):
    """Create order for marketplace listing"""
    
    result = OrderService.create_order(db, consumer_id, order_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Session = Depends(get_db)
):
    """Get order details"""
    
    order = OrderService.get_order(db, order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.post("/orders/{order_id}/confirm-payment")
def confirm_payment(
    order_id: str,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    db: Session = Depends(get_db)
):
    """Confirm payment for order (Razorpay callback)"""
    
    result = OrderService.confirm_payment(db, order_id, razorpay_order_id, razorpay_payment_id)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


# ============================================================================
# REVIEW & RATING ROUTES
# ============================================================================

@router.post("/reviews", response_model=dict)
def create_review(
    review_data: ReviewCreateRequest,
    db: Session = Depends(get_db)
):
    """Create review for completed order"""
    
    result = ReviewService.create_review(db, review_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.get("/farmers/{farmer_id}/reviews")
def get_farmer_reviews(
    farmer_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get reviews for a farmer"""
    
    reviews = ReviewService.get_farmer_reviews(db, farmer_id, limit)
    
    return {
        "farmer_id": farmer_id,
        "reviews": reviews,
        "total": len(reviews)
    }
