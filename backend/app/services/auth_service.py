"""
Authentication Service - User Registration & Login
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, create_refresh_token


class AuthService:
    """Authentication Service"""
    
    @staticmethod
    def register_user(db: Session, user_data: UserRegisterRequest) -> dict:
        """Register a new user (farmer or consumer)"""
        
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.phone == user_data.phone) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            return {"error": "User with this phone or email already exists"}
        
        # Create new user
        new_user = User(
            phone=user_data.phone,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            name=user_data.name,
            role=user_data.role,
            language_preference=user_data.language_preference,
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate tokens
        tokens = AuthService.generate_tokens(new_user.id)
        
        return {
            "user_id": new_user.id,
            "message": "User registered successfully",
            "tokens": tokens
        }
    
    @staticmethod
    def login_user(db: Session, login_data: UserLoginRequest) -> Optional[dict]:
        """Login user and return tokens"""
        
        # Find user by phone
        user = db.query(User).filter(User.phone == login_data.phone).first()
        
        if not user:
            return None
        
        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            return None
        
        # Generate tokens
        tokens = AuthService.generate_tokens(user.id)
        
        return {
            "user_id": user.id,
            "user_role": user.role,
            "tokens": tokens
        }
    
    @staticmethod
    def generate_tokens(user_id: str) -> dict:
        """Generate access and refresh tokens"""
        
        data = {"sub": user_id}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 30  # minutes
        }
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def verify_phone_otp(db: Session, phone: str, otp: str) -> bool:
        """Verify OTP for phone number (stub for integration with Twilio/Firebase)"""
        # In production, integrate with Twilio or Firebase to verify OTP
        # For now, return True for development
        return True
