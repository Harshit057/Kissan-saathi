"""
Farmer Service - Farmer Profile & Crop Management
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from geoalchemy2.functions import ST_MakePoint
from app.models import Farmer, CropListing, User, CropStatus, SchemeEligibility, Scheme
from app.schemas import FarmerCreateRequest, FarmerUpdateRequest, CropListingCreateRequest, CropReadyRequest
from app.config import get_settings
from datetime import datetime

settings = get_settings()


class FarmerService:
    """Farmer Management Service"""
    
    @staticmethod
    def create_farmer_profile(db: Session, user_id: str, farmer_data: FarmerCreateRequest) -> dict:
        """Create farmer profile"""
        
        new_farmer = Farmer(
            user_id=user_id,
            state=farmer_data.state,
            district=farmer_data.district,
            village=farmer_data.village,
            land_size_hectares=farmer_data.land_size_hectares,
            soil_type=farmer_data.soil_type,
            crops_grown=farmer_data.crops_grown,
            is_organic_certified=farmer_data.is_organic_certified,
            bank_account_number=farmer_data.bank_account_number,
            bank_ifsc_code=farmer_data.bank_ifsc_code,
        )
        
        # Set geolocation if provided
        if farmer_data.latitude and farmer_data.longitude:
            new_farmer.location = ST_MakePoint(farmer_data.longitude, farmer_data.latitude)
        
        db.add(new_farmer)
        db.commit()
        db.refresh(new_farmer)
        
        return {"farmer_id": new_farmer.id}
    
    @staticmethod
    def get_farmer_profile(db: Session, farmer_id: str) -> Optional[Farmer]:
        """Get farmer profile by ID"""
        return db.query(Farmer).filter(Farmer.id == farmer_id).first()
    
    @staticmethod
    def get_farmer_by_user_id(db: Session, user_id: str) -> Optional[Farmer]:
        """Get farmer profile by user ID"""
        return db.query(Farmer).filter(Farmer.user_id == user_id).first()
    
    @staticmethod
    def update_farmer_profile(db: Session, farmer_id: str, update_data: FarmerUpdateRequest) -> dict:
        """Update farmer profile"""
        
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            return {"error": "Farmer not found"}
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(farmer, key, value)
        
        db.commit()
        db.refresh(farmer)
        
        return {"message": "Farmer profile updated"}


class CropService:
    """Crop Management Service"""
    
    @staticmethod
    def create_crop_listing(db: Session, farmer_id: str, crop_data: CropListingCreateRequest) -> dict:
        """Create crop listing"""
        
        new_crop = CropListing(
            farmer_id=farmer_id,
            crop_name=crop_data.crop_name,
            variety=crop_data.variety,
            quantity_kg=crop_data.quantity_kg,
            price_per_kg=crop_data.price_per_kg,
            sowing_date=crop_data.sowing_date,
            harvest_date=crop_data.harvest_date,
            is_organic=crop_data.is_organic,
            description=crop_data.description,
            images=crop_data.images,
            status=CropStatus.PLANNING,
        )
        
        db.add(new_crop)
        db.commit()
        db.refresh(new_crop)
        
        return {"crop_id": new_crop.id}
    
    @staticmethod
    def get_crop_listing(db: Session, crop_id: str) -> Optional[CropListing]:
        """Get crop listing by ID"""
        return db.query(CropListing).filter(CropListing.id == crop_id).first()
    
    @staticmethod
    def get_farmer_crops(db: Session, farmer_id: str, status: Optional[str] = None) -> List[CropListing]:
        """Get all crops for a farmer"""
        query = db.query(CropListing).filter(CropListing.farmer_id == farmer_id)
        
        if status:
            query = query.filter(CropListing.status == status)
        
        return query.all()
    
    @staticmethod
    def mark_crop_ready(db: Session, crop_id: str, ready_data: CropReadyRequest) -> dict:
        """Mark crop as ready to sell"""
        
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        if not crop:
            return {"error": "Crop not found"}
        
        # Update crop status
        crop.status = CropStatus.READY
        crop.harvest_date = datetime.now().date()
        
        if ready_data.quantity_kg:
            crop.quantity_kg = ready_data.quantity_kg
        if ready_data.price_per_kg:
            crop.price_per_kg = ready_data.price_per_kg
        
        db.commit()
        db.refresh(crop)
        
        # If enabled, trigger आपनGaon listing creation
        if ready_data.list_on_aapangaon:
            CropService.create_marketplace_listing(db, crop)
        
        return {
            "message": "Crop marked as ready",
            "crop_id": crop.id,
            "aapangaon_listed": ready_data.list_on_aapangaon
        }
    
    @staticmethod
    def create_marketplace_listing(db: Session, crop: CropListing) -> None:
        """Create आपनGaon marketplace listing from crop"""
        import uuid
        
        # Create marketplace listing ID
        marketplace_listing_id = str(uuid.uuid4())
        
        crop.aapangaon_listing_id = marketplace_listing_id
        crop.aapangaon_listed = True
        
        db.commit()
        db.refresh(crop)
        
        # TODO: Trigger notification to nearby consumers
    
    @staticmethod
    def update_crop_listing(db: Session, crop_id: str, update_data: dict) -> dict:
        """Update crop listing"""
        
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        if not crop:
            return {"error": "Crop not found"}
        
        for key, value in update_data.items():
            if value is not None:
                setattr(crop, key, value)
        
        db.commit()
        db.refresh(crop)
        
        return {"message": "Crop updated"}
    
    @staticmethod
    def mark_crop_sold(db: Session, crop_id: str) -> dict:
        """Mark crop as sold"""
        
        crop = db.query(CropListing).filter(CropListing.id == crop_id).first()
        if not crop:
            return {"error": "Crop not found"}
        
        crop.status = CropStatus.SOLD
        crop.aapangaon_listed = False
        
        db.commit()
        
        # TODO: Trigger SMS notification to farmer with payment details
        
        return {"message": "Crop marked as sold"}
