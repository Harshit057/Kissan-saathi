"""
Farmer API Routes - Profile & Crop Management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import (
    FarmerCreateRequest,
    FarmerUpdateRequest,
    FarmerResponse,
    CropListingCreateRequest,
    CropListingResponse,
    CropReadyRequest,
)
from app.services.farmer_service import FarmerService, CropService

router = APIRouter(prefix="/api/v1/farmers", tags=["Farmers"])


# ============================================================================
# FARMER PROFILE ROUTES
# ============================================================================

@router.post("/profile", response_model=dict)
def create_farmer_profile(
    farmer_data: FarmerCreateRequest,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Create farmer profile after registration"""
    
    result = FarmerService.create_farmer_profile(db, user_id, farmer_data)
    return result


@router.get("/profile/{farmer_id}", response_model=FarmerResponse)
def get_farmer_profile(
    farmer_id: str,
    db: Session = Depends(get_db)
):
    """Get farmer profile details"""
    
    farmer = FarmerService.get_farmer_profile(db, farmer_id)
    
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer not found"
        )
    
    return farmer


@router.put("/profile/{farmer_id}")
def update_farmer_profile(
    farmer_id: str,
    update_data: FarmerUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update farmer profile"""
    
    result = FarmerService.update_farmer_profile(db, farmer_id, update_data)
    return result


# ============================================================================
# CROP MANAGEMENT ROUTES
# ============================================================================

@router.post("/crops", response_model=dict)
def create_crop_listing(
    farmer_id: str,
    crop_data: CropListingCreateRequest,
    db: Session = Depends(get_db)
):
    """Create new crop listing"""
    
    result = CropService.create_crop_listing(db, farmer_id, crop_data)
    return result


@router.get("/crops/{crop_id}", response_model=CropListingResponse)
def get_crop_listing(
    crop_id: str,
    db: Session = Depends(get_db)
):
    """Get crop listing details"""
    
    crop = CropService.get_crop_listing(db, crop_id)
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found"
        )
    
    return crop


@router.get("/crops", response_model=List[CropListingResponse])
def get_farmer_crops(
    farmer_id: str,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get all crops for farmer (with optional status filter)"""
    
    crops = CropService.get_farmer_crops(db, farmer_id, status)
    return crops


@router.post("/crops/{crop_id}/ready")
def mark_crop_ready(
    crop_id: str,
    ready_data: CropReadyRequest,
    db: Session = Depends(get_db)
):
    """Mark crop as ready to sell (triggers आपनGaon listing)"""
    
    result = CropService.mark_crop_ready(db, crop_id, ready_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.post("/crops/{crop_id}/sold")
def mark_crop_sold(
    crop_id: str,
    db: Session = Depends(get_db)
):
    """Mark crop as sold (removes from आपनGaon listing)"""
    
    result = CropService.mark_crop_sold(db, crop_id)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result


@router.put("/crops/{crop_id}")
def update_crop_listing(
    crop_id: str,
    update_data: dict,
    db: Session = Depends(get_db)
):
    """Update crop listing details"""
    
    result = CropService.update_crop_listing(db, crop_id, update_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result
