"""
Marketplace Service - आपनGaon Consumer Marketplace & Geo-Proximity
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from geoalchemy2.functions import ST_MakePoint, ST_Distance
from geoalchemy2.types import Geography
from app.models import Consumer, Farmer, CropListing, Order, CropStatus, Review, OrderStatus
from app.schemas import ConsumerCreateRequest, OrderCreateRequest, ReviewCreateRequest
from app.config import get_settings

settings = get_settings()


class ConsumerService:
    """Consumer Profile Management"""
    
    @staticmethod
    def create_consumer_profile(db: Session, user_id: str, consumer_data: ConsumerCreateRequest) -> dict:
        """Create consumer profile"""
        
        new_consumer = Consumer(
            user_id=user_id,
            city=consumer_data.city,
            pincode=consumer_data.pincode,
            address=consumer_data.address,
            preferred_categories=consumer_data.preferred_categories,
        )
        
        # Set geolocation if provided
        if consumer_data.latitude and consumer_data.longitude:
            new_consumer.location = ST_MakePoint(consumer_data.longitude, consumer_data.latitude)
        
        db.add(new_consumer)
        db.commit()
        db.refresh(new_consumer)
        
        return {"consumer_id": new_consumer.id}
    
    @staticmethod
    def get_consumer_profile(db: Session, consumer_id: str) -> Optional[Consumer]:
        """Get consumer profile"""
        return db.query(Consumer).filter(Consumer.id == consumer_id).first()
    
    @staticmethod
    def get_consumer_by_user_id(db: Session, user_id: str) -> Optional[Consumer]:
        """Get consumer by user ID"""
        return db.query(Consumer).filter(Consumer.user_id == user_id).first()


class MarketplaceService:
    """आपनGaon Marketplace Discovery & Geo-Proximity Matching"""
    
    @staticmethod
    def get_nearby_farmers(
        db: Session,
        latitude: float,
        longitude: float,
        radius_km: int = 100,
        category: Optional[str] = None,
        limit: int = 20,
        sort_by: str = "distance"
    ) -> List[dict]:
        """
        Get nearby farmers within specified radius using PostGIS.
        Haversine formula is used by PostGIS ST_Distance.
        """
        
        consumer_location = ST_MakePoint(longitude, latitude)
        
        # Base query: Get ready crops from nearby farmers
        query = db.query(
            CropListing.id.label("listing_id"),
            CropListing.crop_name,
            CropListing.variety,
            CropListing.quantity_kg,
            CropListing.price_per_kg,
            CropListing.is_organic,
            CropListing.images,
            CropListing.created_at,
            Farmer.id.label("farmer_id"),
            Farmer.village,
            Farmer.district,
            Farmer.state,
            Farmer.rating.label("farmer_rating"),
            Farmer.total_reviews,
            Farmer.is_organic_certified,
            func.round(
                ST_Distance(
                    Farmer.location,
                    consumer_location,
                    true  # use spheroid (more accurate)
                ) / 1000,  # Convert meters to kilometers
                2
            ).label("distance_km")
        ).join(
            Farmer, CropListing.farmer_id == Farmer.id
        ).filter(
            and_(
                CropListing.status == CropStatus.READY,
                CropListing.aapangaon_listed == True,
                ST_Distance(Farmer.location, consumer_location) <= (radius_km * 1000)  # meters
            )
        )
        
        # Filter by crop category if provided
        if category:
            query = query.filter(CropListing.crop_name.ilike(f"%{category}%"))
        
        # Sort
        if sort_by == "distance":
            query = query.order_by("distance_km")
        elif sort_by == "rating":
            query = query.order_by(Farmer.rating.desc())
        elif sort_by == "price":
            query = query.order_by(CropListing.price_per_kg)
        
        results = query.limit(limit).all()
        
        # Convert to list of dicts
        listings = []
        for row in results:
            listings.append({
                "listing_id": row.listing_id,
                "crop_name": row.crop_name,
                "variety": row.variety,
                "quantity_kg": row.quantity_kg,
                "price_per_kg": row.price_per_kg,
                "is_organic": row.is_organic,
                "images": row.images,
                "farmer_id": row.farmer_id,
                "farmer_village": row.village,
                "farmer_district": row.district,
                "farmer_state": row.state,
                "farmer_rating": float(row.farmer_rating),
                "farmer_reviews": row.total_reviews,
                "is_organic_certified": row.is_organic_certified,
                "distance_km": float(row.distance_km),
                "created_at": row.created_at,
            })
        
        return listings
    
    @staticmethod
    def get_marketplace_listings(
        db: Session,
        category: Optional[str] = None,
        is_organic: Optional[bool] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[dict]:
        """Get marketplace listings with pagination"""
        
        query = db.query(
            CropListing,
            Farmer
        ).join(
            Farmer, CropListing.farmer_id == Farmer.id
        ).filter(
            and_(
                CropListing.status == CropStatus.READY,
                CropListing.aapangaon_listed == True
            )
        )
        
        # Apply filters
        if category:
            query = query.filter(CropListing.crop_name.ilike(f"%{category}%"))
        if is_organic is not None:
            query = query.filter(CropListing.is_organic == is_organic)
        if min_price:
            query = query.filter(CropListing.price_per_kg >= min_price)
        if max_price:
            query = query.filter(CropListing.price_per_kg <= max_price)
        
        query = query.order_by(CropListing.created_at.desc())
        
        listings = []
        for crop, farmer in query.limit(limit).offset(offset).all():
            listings.append({
                "listing_id": crop.id,
                "crop_name": crop.crop_name,
                "variety": crop.variety,
                "quantity_kg": crop.quantity_kg,
                "price_per_kg": crop.price_per_kg,
                "is_organic": crop.is_organic,
                "images": crop.images,
                "farmer_name": farmer.user.name if farmer.user else "Unknown",
                "farmer_id": farmer.id,
                "farmer_village": farmer.village,
                "farmer_rating": farmer.rating,
                "farmer_reviews": farmer.total_reviews,
                "is_organic_certified": farmer.is_organic_certified,
                "created_at": crop.created_at,
            })
        
        return listings
    
    @staticmethod
    def search_listings(
        db: Session,
        search_query: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        limit: int = 20
    ) -> List[dict]:
        """Search listings by crop name"""
        
        query = db.query(
            CropListing,
            Farmer
        ).join(
            Farmer, CropListing.farmer_id == Farmer.id
        ).filter(
            and_(
                CropListing.status == CropStatus.READY,
                CropListing.aapangaon_listed == True,
                CropListing.crop_name.ilike(f"%{search_query}%")
            )
        )
        
        # If location provided, calculate distance
        if latitude and longitude:
            consumer_location = ST_MakePoint(longitude, latitude)
            
            query = query.add_columns(
                func.round(
                    ST_Distance(Farmer.location, consumer_location) / 1000,
                    2
                ).label("distance_km")
            ).filter(
                ST_Distance(Farmer.location, consumer_location) <= (300 * 1000)  # 300 km radius
            ).order_by("distance_km")
        else:
            query = query.order_by(CropListing.created_at.desc())
        
        results = query.limit(limit).all()
        
        listings = []
        for result in results:
            if latitude and longitude:
                crop, farmer, distance = result
                dist_km = float(distance)
            else:
                crop, farmer = result
                dist_km = None
            
            listings.append({
                "listing_id": crop.id,
                "crop_name": crop.crop_name,
                "variety": crop.variety,
                "quantity_kg": crop.quantity_kg,
                "price_per_kg": crop.price_per_kg,
                "is_organic": crop.is_organic,
                "images": crop.images,
                "farmer_name": farmer.user.name if farmer.user else "Unknown",
                "farmer_id": farmer.id,
                "farmer_village": farmer.village,
                "farmer_rating": farmer.rating,
                "is_organic_certified": farmer.is_organic_certified,
                "distance_km": dist_km,
                "created_at": crop.created_at,
            })
        
        return listings


class OrderService:
    """Order & Transaction Management"""
    
    @staticmethod
    def create_order(db: Session, consumer_id: str, order_data: OrderCreateRequest) -> dict:
        """Create order for marketplace listing"""
        
        # Get crop listing
        crop = db.query(CropListing).filter(CropListing.id == order_data.crop_listing_id).first()
        if not crop:
            return {"error": "Crop listing not found"}
        
        # Check quantity available
        if crop.quantity_kg < order_data.quantity_kg:
            return {"error": "Insufficient quantity available"}
        
        # Create order
        total_price = crop.price_per_kg * order_data.quantity_kg
        
        new_order = Order(
            consumer_id=consumer_id,
            farmer_id=crop.farmer_id,
            crop_listing_id=crop.id,
            quantity_kg=order_data.quantity_kg,
            price_per_kg=crop.price_per_kg,
            total_price=total_price,
            payment_method=order_data.payment_method,
            delivery_address=order_data.delivery_address,
            status=OrderStatus.PENDING,
        )
        
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        return {
            "order_id": new_order.id,
            "total_price": total_price,
            "razorpay_order_id": None  # Generated during payment
        }
    
    @staticmethod
    def get_order(db: Session, order_id: str) -> Optional[Order]:
        """Get order details"""
        return db.query(Order).filter(Order.id == order_id).first()
    
    @staticmethod
    def confirm_payment(db: Session, order_id: str, razorpay_order_id: str, razorpay_payment_id: str) -> dict:
        """Confirm payment for order"""
        
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return {"error": "Order not found"}
        
        order.razorpay_order_id = razorpay_order_id
        order.razorpay_payment_id = razorpay_payment_id
        order.payment_status = "confirmed"
        order.status = OrderStatus.CONFIRMED
        order.paid_at = func.now()
        
        db.commit()
        
        # TODO: Trigger SMS to farmer and consumer
        
        return {"message": "Payment confirmed"}


class ReviewService:
    """Review & Rating Management"""
    
    @staticmethod
    def create_review(db: Session, review_data: ReviewCreateRequest) -> dict:
        """Create review for order"""
        
        # Get order
        order = db.query(Order).filter(Order.id == review_data.order_id).first()
        if not order:
            return {"error": "Order not found"}
        
        # Create review
        new_review = Review(
            order_id=order.id,
            consumer_id=order.consumer_id,
            farmer_id=order.farmer_id,
            rating=review_data.rating,
            review_text=review_data.review_text,
        )
        
        db.add(new_review)
        
        # Update farmer rating
        farmer = db.query(Farmer).filter(Farmer.id == order.farmer_id).first()
        farmer.total_reviews += 1
        
        # Recalculate average rating
        all_reviews = db.query(Review).filter(Review.farmer_id == farmer.id).all()
        if all_reviews:
            avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
            farmer.rating = avg_rating
        
        db.commit()
        
        return {"message": "Review created", "review_id": new_review.id}
    
    @staticmethod
    def get_farmer_reviews(db: Session, farmer_id: str, limit: int = 10) -> List[dict]:
        """Get reviews for farmer"""
        
        reviews = db.query(Review).filter(
            Review.farmer_id == farmer_id
        ).order_by(Review.created_at.desc()).limit(limit).all()
        
        return [
            {
                "rating": r.rating,
                "review_text": r.review_text,
                "created_at": r.created_at,
            }
            for r in reviews
        ]
