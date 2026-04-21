"""
Notification Service - SMS, Push Notifications, Email
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import redis
import json
from app.models import Notification, User
from app.config import get_settings
from datetime import datetime

settings = get_settings()

# Redis client for notification queuing
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)


class NotificationService:
    """Notification Management Service"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        channels: Optional[List[str]] = None
    ) -> str:
        """Create notification and queue for delivery"""
        
        # Default channels
        if channels is None:
            channels = ["sms", "push"]
        
        # Create notification record
        new_notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {},
            is_sms="sms" in channels,
            is_push="push" in channels,
            is_email="email" in channels,
        )
        
        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)
        
        # Queue for delivery
        NotificationService.queue_notification(new_notification.id, channels)
        
        return new_notification.id
    
    @staticmethod
    def queue_notification(notification_id: str, channels: List[str]) -> None:
        """Queue notification for async delivery"""
        
        for channel in channels:
            queue_key = f"notifications:queue:{channel}"
            redis_client.lpush(queue_key, notification_id)
    
    @staticmethod
    def send_sms(phone_number: str, message: str) -> bool:
        """
        Send SMS notification using Twilio.
        In production, integrate with Twilio API.
        """
        
        try:
            # TODO: Integrate with Twilio API
            # from twilio.rest import Client
            # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            # client.messages.create(
            #     body=message,
            #     from_=settings.TWILIO_PHONE_NUMBER,
            #     to=phone_number
            # )
            
            print(f"SMS sent to {phone_number}: {message}")
            return True
            
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    @staticmethod
    def send_push_notification(
        device_token: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send push notification via Firebase Cloud Messaging.
        In production, integrate with Firebase Admin SDK.
        """
        
        try:
            # TODO: Integrate with Firebase Admin SDK
            # import firebase_admin
            # from firebase_admin import messaging
            # 
            # notification_payload = messaging.Notification(title=title, body=message)
            # message = messaging.Message(
            #     notification=notification_payload,
            #     data=data,
            #     token=device_token,
            # )
            # messaging.send(message)
            
            print(f"Push notification sent to {device_token}: {title} - {message}")
            return True
            
        except Exception as e:
            print(f"Error sending push notification: {e}")
            return False
    
    @staticmethod
    def send_email(email: str, subject: str, body: str) -> bool:
        """Send email notification"""
        
        try:
            # TODO: Integrate with email service (SendGrid, AWS SES, etc.)
            print(f"Email sent to {email}: {subject}")
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False


class OrderNotificationService:
    """Notifications for Order Events"""
    
    @staticmethod
    def notify_order_created(db: Session, order_id: str) -> None:
        """Notify consumer and farmer when order is created"""
        
        # TODO: Fetch order details and send notifications
        pass
    
    @staticmethod
    def notify_order_confirmed(db: Session, order_id: str) -> None:
        """Notify when payment is confirmed"""
        pass
    
    @staticmethod
    def notify_crop_ready(db: Session, crop_id: str) -> None:
        """Notify nearby consumers when crop is marked ready"""
        
        # TODO: Get nearby consumers and send notifications
        pass
    
    @staticmethod
    def notify_delivery_status(db: Session, order_id: str, status: str) -> None:
        """Notify consumer about delivery status"""
        
        pass


class SchemeNotificationService:
    """Notifications for Government Schemes"""
    
    @staticmethod
    def notify_new_scheme(db: Session, scheme_id: str) -> None:
        """Notify farmers about new scheme"""
        
        # TODO: Identify eligible farmers and send notifications
        pass
    
    @staticmethod
    def notify_scheme_eligibility(db: Session, farmer_id: str, scheme_id: str) -> None:
        """Notify farmer of scheme eligibility"""
        
        # TODO: Send eligibility confirmation
        pass


class AlertService:
    """Weather & Market Alerts"""
    
    @staticmethod
    def send_weather_alert(db: Session, farmer_id: str, alert_type: str, message: str) -> None:
        """Send weather-based alert to farmer"""
        
        # TODO: Get farmer details and send alert
        pass
    
    @staticmethod
    def send_market_alert(db: Session, farmer_id: str, crop_name: str, price: float) -> None:
        """Send market price alert to farmer"""
        
        # TODO: Alert farmer of favorable prices
        pass
