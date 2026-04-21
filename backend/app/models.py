"""
SQLAlchemy Database Models for KisanSaathi & आपनGaon
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey, Enum, Date, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
import uuid

Base = declarative_base()


class UserRole(str, enum.Enum):
    """User role enumeration"""
    FARMER = "farmer"
    CONSUMER = "consumer"
    ADMIN = "admin"


class CropStatus(str, enum.Enum):
    """Crop status enumeration"""
    PLANNING = "planning"
    GROWING = "growing"
    READY = "ready"
    SOLD = "sold"
    FAILED = "failed"


class OrderStatus(str, enum.Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration"""
    UPI = "upi"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    COD = "cod"


# ============================================================================
# AUTHENTICATION & USER MODELS
# ============================================================================

class User(Base):
    """Base User Model (Farmers & Consumers)"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(120), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    language_preference = Column(String(10), default="en")
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    farmer_profile = relationship("Farmer", back_populates="user", uselist=False)
    consumer_profile = relationship("Consumer", back_populates="user", uselist=False)
    conversations = relationship("AIConversation", back_populates="user")


# ============================================================================
# FARMER-SIDE MODELS
# ============================================================================

class Farmer(Base):
    """Farmer Profile Model"""
    __tablename__ = "farmers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    state = Column(String(50), nullable=False, index=True)
    district = Column(String(50), nullable=False, index=True)
    village = Column(String(100), nullable=False)
    
    # Geolocation (latitude/longitude for compatibility with SQLite & PostgreSQL)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    land_size_hectares = Column(Float, nullable=True)
    soil_type = Column(String(50), nullable=True)  # loamy, sandy, clay, etc.
    crops_grown = Column(JSON, default=list)  # ["wheat", "rice", "cotton"]
    
    # Certification
    is_organic_certified = Column(Boolean, default=False)
    certifying_body = Column(String(100), nullable=True)
    certification_document_url = Column(String(255), nullable=True)
    
    # Metadata
    bank_account_number = Column(String(20), nullable=True)
    bank_ifsc_code = Column(String(11), nullable=True)
    aadhar_number = Column(String(12), nullable=True)  # Hashed
    
    profile_photo_url = Column(String(255), nullable=True)
    rating = Column(Float, default=4.5)  # Average rating
    total_reviews = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    crops = relationship("CropListing", back_populates="farmer", cascade="all, delete-orphan")
    orders_as_seller = relationship("Order", back_populates="farmer", foreign_keys="Order.farmer_id")


class CropListing(Base):
    """Crop Listing Model (KisanSaathi & आपनGaon Inventory)"""
    __tablename__ = "crop_listings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmers.id"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    variety = Column(String(100), nullable=True)
    
    # Quantity & Pricing
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    
    # Timeline
    sowing_date = Column(Date, nullable=True)
    harvest_date = Column(Date, nullable=True)
    
    # Status
    status = Column(Enum(CropStatus), default=CropStatus.PLANNING, index=True)
    is_organic = Column(Boolean, default=False)
    
    # Marketplace Integration
    aapangaon_listed = Column(Boolean, default=False, index=True)
    aapangaon_listing_id = Column(String(36), nullable=True)
    
    # Images
    images = Column(JSON, default=list)  # S3 URLs
    
    # Metadata
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    farmer = relationship("Farmer", back_populates="crops")
    orders = relationship("Order", back_populates="crop_listing")


# ============================================================================
# CONSUMER-SIDE MODELS
# ============================================================================

class Consumer(Base):
    """Consumer Profile Model"""
    __tablename__ = "consumers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    city = Column(String(50), nullable=False, index=True)
    pincode = Column(String(10), nullable=False, index=True)
    
    # Geolocation (latitude/longitude for compatibility with SQLite & PostgreSQL)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Preferences
    preferred_categories = Column(JSON, default=list)  # ["vegetables", "grains"]
    subscription_preferences = Column(JSON, default=dict)
    
    address = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="consumer_profile")
    orders = relationship("Order", back_populates="consumer")


# ============================================================================
# ORDER & TRANSACTION MODELS
# ============================================================================

class Order(Base):
    """Order Model (आपनGaon Transactions)"""
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    consumer_id = Column(String(36), ForeignKey("consumers.id"), nullable=False, index=True)
    farmer_id = Column(String(36), ForeignKey("farmers.id"), nullable=False, index=True)
    crop_listing_id = Column(String(36), ForeignKey("crop_listings.id"), nullable=False)
    
    # Order Details
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Status
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    
    # Payment
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    razorpay_order_id = Column(String(50), nullable=True)
    razorpay_payment_id = Column(String(50), nullable=True)
    payment_status = Column(String(20), default="pending")
    paid_at = Column(DateTime, nullable=True)
    
    # Delivery
    delivery_address = Column(Text, nullable=True)
    shiprocket_shipment_id = Column(String(50), nullable=True)
    tracking_number = Column(String(50), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Timeline
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    consumer = relationship("Consumer", back_populates="orders")
    farmer = relationship("Farmer", back_populates="orders_as_seller")
    crop_listing = relationship("CropListing", back_populates="orders")


class Review(Base):
    """Review & Rating Model"""
    __tablename__ = "reviews"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, unique=True)
    consumer_id = Column(String(36), ForeignKey("consumers.id"), nullable=False)
    farmer_id = Column(String(36), ForeignKey("farmers.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)  # 1-5 stars
    review_text = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ============================================================================
# GOVERNMENT SCHEMES MODEL
# ============================================================================

class Scheme(Base):
    """Government Agricultural Scheme Model"""
    __tablename__ = "schemes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True, index=True)
    ministry = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    # Eligibility
    eligibility_criteria = Column(JSON, default=list)  # Structured criteria
    benefit_amount = Column(Float, nullable=True)
    
    # Coverage
    applicable_states = Column(JSON, default=list)  # ["all"] or list of states
    applicable_districts = Column(JSON, default=dict)  # state -> [districts]
    
    # Contact & Links
    application_url = Column(String(255), nullable=True)
    helpline_number = Column(String(15), nullable=True)
    
    # Documents
    document_urls = Column(JSON, default=list)
    
    # Metadata
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    source = Column(String(100))  # "PM-KISAN", "PMFBY", etc.
    
    created_at = Column(DateTime, default=func.now())


class SchemeEligibility(Base):
    """Track Farmer's Scheme Eligibility & Applications"""
    __tablename__ = "scheme_eligibility"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String(36), ForeignKey("farmers.id"), nullable=False, index=True)
    scheme_id = Column(String(36), ForeignKey("schemes.id"), nullable=False, index=True)
    
    is_eligible = Column(Boolean, nullable=True)
    eligibility_checked_at = Column(DateTime, nullable=True)
    
    is_applied = Column(Boolean, default=False)
    applied_at = Column(DateTime, nullable=True)
    application_status = Column(String(50), nullable=True)  # "pending", "approved", "rejected"
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


# ============================================================================
# AI ASSISTANT & RAG MODELS
# ============================================================================

class AIConversation(Base):
    """AI Conversation History for RAG Chatbot"""
    __tablename__ = "ai_conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(36), default=lambda: str(uuid.uuid4()), index=True)
    
    # Messages (stored as JSON array of {role, content, language, timestamp})
    messages = Column(JSON, default=list)
    
    # RAG Context
    context_chunks = Column(JSON, default=list)  # Retrieved knowledge base chunks
    
    # Metadata
    topic = Column(String(100), nullable=True)  # "crop_advisor", "schemes", "market", etc.
    language = Column(String(10), default="en")
    is_voice = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")


class KnowledgeBaseDocument(Base):
    """Knowledge Base Documents for RAG Pipeline"""
    __tablename__ = "knowledge_base_documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)  # "scheme", "icar", "agromet", "price", etc.
    
    # Categorization
    category = Column(String(50), nullable=False)  # "crop_management", "scheme", "weather", etc.
    related_crops = Column(JSON, default=list)
    related_states = Column(JSON, default=list)
    languages = Column(JSON, default=["en", "hi"])
    
    # RAG Metadata
    embedding = Column(String(36), nullable=True)  # Vector ID in Qdrant
    chunk_count = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class KnowledgeBaseChunk(Base):
    """Individual Chunks of Knowledge Base Documents (for RAG Retrieval)"""
    __tablename__ = "knowledge_base_chunks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("knowledge_base_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    
    # Embedding Vector Info (stored in Qdrant, ID stored here)
    vector_id = Column(String(36), nullable=True)
    embedding_model = Column(String(100), default="indic-SBERT")
    
    created_at = Column(DateTime, default=func.now())


# ============================================================================
# NOTIFICATION & AUDIT MODELS
# ============================================================================

class Notification(Base):
    """Notification Model (SMS, Push, Email)"""
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    notification_type = Column(String(50), nullable=False)  # "order_placed", "new_crop_available", etc.
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, default=dict)
    
    # Delivery channels
    is_sms = Column(Boolean, default=False)
    is_push = Column(Boolean, default=False)
    is_email = Column(Boolean, default=False)
    
    # Status
    sms_sent_at = Column(DateTime, nullable=True)
    push_sent_at = Column(DateTime, nullable=True)
    email_sent_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=func.now())


class AuditLog(Base):
    """Audit Log for Compliance & Debugging"""
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(36))
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(45))
    user_agent = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), index=True)
