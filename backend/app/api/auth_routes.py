"""
Authentication API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=dict)
def register(
    user_data: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """Register new user (farmer or consumer)"""
    
    result = AuthService.register_user(db, user_data)
    
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    # Flatten response: move tokens to root level
    tokens = result.get("tokens", {})
    return {
        "user_id": result.get("user_id"),
        "message": result.get("message"),
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "token_type": tokens.get("token_type"),
        "expires_in": tokens.get("expires_in")
    }


@router.post("/login", response_model=dict)
def login(
    login_data: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """Login user and return JWT tokens"""
    
    result = AuthService.login_user(db, login_data)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password"
        )
    
    # Flatten response: move tokens to root level
    tokens = result.get("tokens", {})
    return {
        "user_id": result.get("user_id"),
        "user_role": result.get("user_role"),
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token"),
        "token_type": tokens.get("token_type"),
        "expires_in": tokens.get("expires_in")
    }


@router.post("/refresh-token", response_model=dict)
def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    
    from app.auth import decode_token, create_access_token
    
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    new_access_token = create_access_token({"sub": payload["sub"]})
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/verify-otp")
def verify_otp(phone: str, otp: str, db: Session = Depends(get_db)):
    """Verify OTP for phone number"""
    
    is_valid = AuthService.verify_phone_otp(db, phone, otp)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    return {"message": "OTP verified successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    
    from app.auth import decode_token
    
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    
    token = auth_header[7:]  # Remove "Bearer " prefix
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("sub")
    user = AuthService.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user
