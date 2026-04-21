"""
Pydantic Schemas for Request/Response Validation
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum


# ============================================================================
# AUTHENTICATION SCHEMAS
# ============================================================================

class UserRole(str, Enum):
    FARMER = "farmer"
    CONSUMER = "consumer"


class UserRegisterRequest(BaseModel):
    """User Registration Request"""
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    role: UserRole
    language_preference: str = "en"


class UserLoginRequest(BaseModel):
    """User Login Request"""
    phone: str
    password: str


class TokenResponse(BaseModel):
    """JWT Token Response"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User Response"""
    id: str
    phone: str
    email: Optional[str] = None
    name: str
    role: str
    language_preference: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# FARMER SCHEMAS
# ============================================================================

class FarmerCreateRequest(BaseModel):
    """Farmer Profile Creation Request"""
    state: str
    district: str
    village: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    land_size_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    crops_grown: List[str] = []
    is_organic_certified: bool = False
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None


class FarmerResponse(BaseModel):
    """Farmer Profile Response"""
    id: str
    user_id: str
    state: str
    district: str
    village: str
    land_size_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    crops_grown: List[str]
    is_organic_certified: bool
    rating: float
    total_reviews: int
    profile_photo_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class FarmerUpdateRequest(BaseModel):
    """Farmer Profile Update Request"""
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    land_size_hectares: Optional[float] = None
    soil_type: Optional[str] = None
    crops_grown: Optional[List[str]] = None


# ============================================================================
# CROP LISTING SCHEMAS
# ============================================================================

class CropListingCreateRequest(BaseModel):
    """Crop Listing Creation Request"""
    crop_name: str
    variety: Optional[str] = None
    quantity_kg: float = Field(..., gt=0)
    price_per_kg: float = Field(..., gt=0)
    sowing_date: Optional[date] = None
    harvest_date: Optional[date] = None
    is_organic: bool = False
    description: Optional[str] = None
    images: List[str] = []


class CropListingResponse(BaseModel):
    """Crop Listing Response"""
    id: str
    farmer_id: str
    crop_name: str
    variety: Optional[str] = None
    quantity_kg: float
    price_per_kg: float
    sowing_date: Optional[date] = None
    harvest_date: Optional[date] = None
    status: str
    is_organic: bool
    aapangaon_listed: bool
    images: List[str]
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CropReadyRequest(BaseModel):
    """Mark Crop as Ready to Sell"""
    quantity_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    list_on_aapangaon: bool = True


class CropListingUpdateRequest(BaseModel):
    """Update Crop Listing"""
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    quantity_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    status: Optional[str] = None
    is_organic: Optional[bool] = None


# ============================================================================
# CONSUMER SCHEMAS
# ============================================================================

class ConsumerCreateRequest(BaseModel):
    """Consumer Profile Creation Request"""
    city: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    preferred_categories: List[str] = []


class ConsumerResponse(BaseModel):
    """Consumer Profile Response"""
    id: str
    user_id: str
    city: str
    pincode: str
    address: Optional[str] = None
    preferred_categories: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# ORDER & PAYMENT SCHEMAS
# ============================================================================

class OrderCreateRequest(BaseModel):
    """Create Order Request"""
    crop_listing_id: str
    quantity_kg: float = Field(..., gt=0)
    payment_method: str  # "upi", "credit_card", "debit_card", "cod"
    delivery_address: Optional[str] = None


class OrderResponse(BaseModel):
    """Order Response"""
    id: str
    consumer_id: str
    farmer_id: str
    crop_listing_id: str
    quantity_kg: float
    price_per_kg: float
    total_price: float
    status: str
    payment_method: str
    payment_status: str
    razorpay_order_id: Optional[str] = None
    delivery_address: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class RazorpayPaymentRequest(BaseModel):
    """Razorpay Payment Verification Request"""
    order_id: str
    payment_id: str
    signature: str


class ReviewCreateRequest(BaseModel):
    """Create Review Request"""
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None


class ReviewResponse(BaseModel):
    """Review Response"""
    id: str
    order_id: str
    consumer_id: str
    farmer_id: str
    rating: int
    review_text: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# MARKETPLACE DISCOVERY SCHEMAS
# ============================================================================

class MarketplaceListingResponse(BaseModel):
    """Marketplace Listing with Farmer Info (आपनGaon Discovery)"""
    id: str
    crop_name: str
    variety: Optional[str] = None
    quantity_kg: float
    price_per_kg: float
    is_organic: bool
    images: List[str]
    
    # Farmer info
    farmer_name: str
    village: str
    farmer_rating: float
    farmer_reviews: int
    is_organic_certified: bool
    distance_km: Optional[float] = None
    
    created_at: datetime
    
    class Config:
        from_attributes = True


class NearbyFarmersRequest(BaseModel):
    """Search Nearby Farmers Request"""
    latitude: float
    longitude: float
    category: Optional[str] = None
    radius_km: int = 100
    limit: int = 20
    sort_by: str = "distance"  # "distance", "rating", "price"


# ============================================================================
# GOVERNMENT SCHEME SCHEMAS
# ============================================================================

class SchemeResponse(BaseModel):
    """Government Scheme Response"""
    id: str
    name: str
    ministry: str
    description: str
    benefit_amount: Optional[float] = None
    applied_states: List[str]
    application_url: Optional[str] = None
    helpline_number: Optional[str] = None
    source: str
    is_active: bool
    
    class Config:
        from_attributes = True


class SchemeEligibilityCheckRequest(BaseModel):
    """Check Scheme Eligibility Request"""
    farmer_id: str


class SchemeEligibilityResponse(BaseModel):
    """Scheme Eligibility Response"""
    scheme_id: str
    scheme_name: str
    is_eligible: Optional[bool] = None
    reason: Optional[str] = None
    eligibility_checked_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# MANDI PRICE & MARKET DATA SCHEMAS
# ============================================================================

class MandiPriceResponse(BaseModel):
    """Mandi Price Data Response"""
    id: str
    crop_name: str
    variety: Optional[str] = None
    market_name: str
    market_city: str
    state: str
    price_per_kg: float
    min_price: float
    max_price: float
    quantity_arrived_tonnes: float
    updated_at: datetime


class CropAdvisoryRequest(BaseModel):
    """Crop Advisory Request"""
    state: str
    district: str
    season: str  # "kharif", "rabi", "summer"
    soil_type: Optional[str] = None
    land_size_hectares: Optional[float] = None


class CropAdvisory(BaseModel):
    """Crop Advisory Response"""
    recommended_crops: List[Dict[str, Any]]
    sowing_window: Dict[str, str]
    water_requirement: str
    expected_yield: str
    pest_management_tips: List[str]
    market_demand: str


# ============================================================================
# AI ASSISTANT SCHEMAS
# ============================================================================

class ChatMessage(BaseModel):
    """Chat Message"""
    role: str  # "user" or "assistant"
    content: str
    language: str = "en"
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat Request"""
    message: str
    language: str = "en"
    session_id: Optional[str] = None
    is_voice: bool = False
    voice_file_url: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat Response"""
    message: str
    language: str
    session_id: str
    context_chunks: List[Dict[str, str]] = []
    suggestions: List[str] = []
    
    class Config:
        from_attributes = True


class VoiceChatRequest(BaseModel):
    """Voice Chat Request"""
    language: str
    detected_dialect: Optional[str] = None


# ============================================================================
# BEGINNER ONBOARDING SCHEMAS
# ============================================================================

class OnboardingStep(BaseModel):
    """Beginner Onboarding Step"""
    step_number: int
    title: str
    description: str
    content: str
    video_url: Optional[str] = None
    resources: List[str] = []


class FarmerJourneyStep(BaseModel):
    """Farmer's Crop Journey Step"""
    phase: str  # "planning", "preparation", "sowing", "growing", "harvesting", "selling"
    tasks: List[Dict[str, str]]
    timeline: str
    resources: List[str] = []
    alerts: List[str] = []


# ============================================================================
# NOTIFICATION SCHEMAS
# ============================================================================

class PushNotificationRequest(BaseModel):
    """Push Notification Request"""
    user_id: str
    title: str
    message: str
    notification_type: str
    data: Optional[Dict[str, Any]] = None


class PreferenceUpdateRequest(BaseModel):
    """Update Notification Preferences"""
    enable_sms: Optional[bool] = None
    enable_push: Optional[bool] = None
    enable_email: Optional[bool] = None
    crop_alerts: Optional[bool] = None
    scheme_alerts: Optional[bool] = None
    market_alerts: Optional[bool] = None


# ============================================================================
# PAGINATION & COMMON SCHEMAS
# ============================================================================

class PaginatedResponse(BaseModel):
    """Paginated Response"""
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class ErrorResponse(BaseModel):
    """Error Response"""
    error: str
    detail: Optional[str] = None
    status_code: int


class SuccessResponse(BaseModel):
    """Success Response"""
    message: str
    data: Optional[Any] = None
