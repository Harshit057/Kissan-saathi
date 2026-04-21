"""
Scheme Service - Government Scheme Discovery & Eligibility
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Scheme, Farmer, SchemeEligibility, User
from app.config import get_settings

settings = get_settings()


class SchemeService:
    """Government Schemes Management & Discovery"""
    
    @staticmethod
    def create_scheme(db: Session, scheme_data: dict) -> dict:
        """Create government scheme entry (admin only)"""
        
        new_scheme = Scheme(
            name=scheme_data["name"],
            ministry=scheme_data["ministry"],
            description=scheme_data["description"],
            eligibility_criteria=scheme_data.get("eligibility_criteria", []),
            benefit_amount=scheme_data.get("benefit_amount"),
            applicable_states=scheme_data.get("applicable_states", ["all"]),
            applicable_districts=scheme_data.get("applicable_districts", {}),
            application_url=scheme_data.get("application_url"),
            helpline_number=scheme_data.get("helpline_number"),
            document_urls=scheme_data.get("document_urls", []),
            source=scheme_data.get("source", "government"),
        )
        
        db.add(new_scheme)
        db.commit()
        db.refresh(new_scheme)
        
        return {"scheme_id": new_scheme.id}
    
    @staticmethod
    def get_scheme(db: Session, scheme_id: str) -> Optional[Scheme]:
        """Get scheme details"""
        return db.query(Scheme).filter(
            and_(
                Scheme.id == scheme_id,
                Scheme.is_active == True
            )
        ).first()
    
    @staticmethod
    def discover_schemes(
        db: Session,
        farmer_id: str,
        state: Optional[str] = None,
        district: Optional[str] = None,
        limit: int = 50
    ) -> List[dict]:
        """
        Discover applicable government schemes for farmer.
        Filters by state and district.
        """
        
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            return []
        
        # Use farmer's state/district if not provided
        state = state or farmer.state
        district = district or farmer.district
        
        # Query applicable schemes
        query = db.query(Scheme).filter(Scheme.is_active == True)
        
        # Filter by state
        query = query.filter(
            db.or_(
                Scheme.applicable_states.contains(["all"]),
                Scheme.applicable_states.contains([state])
            )
        )
        
        results = query.limit(limit).all()
        
        schemes = []
        for scheme in results:
            schemes.append({
                "scheme_id": scheme.id,
                "name": scheme.name,
                "ministry": scheme.ministry,
                "description": scheme.description,
                "benefit_amount": scheme.benefit_amount,
                "applicable_states": scheme.applicable_states,
                "application_url": scheme.application_url,
                "helpline_number": scheme.helpline_number,
                "source": scheme.source,
                "document_urls": scheme.document_urls,
            })
        
        return schemes
    
    @staticmethod
    def check_eligibility(db: Session, farmer_id: str, scheme_id: str) -> dict:
        """
        Check if farmer is eligible for a scheme.
        Based on state, district, land size, and crop type.
        """
        
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            return {"error": "Farmer not found"}
        
        scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if not scheme:
            return {"error": "Scheme not found"}
        
        # Check if eligibility already cached
        existing_check = db.query(SchemeEligibility).filter(
            and_(
                SchemeEligibility.farmer_id == farmer_id,
                SchemeEligibility.scheme_id == scheme_id
            )
        ).first()
        
        if existing_check and existing_check.eligibility_checked_at:
            return {
                "scheme_id": scheme_id,
                "scheme_name": scheme.name,
                "is_eligible": existing_check.is_eligible,
                "eligibility_checked_at": existing_check.eligibility_checked_at,
            }
        
        # Perform eligibility check
        is_eligible = True
        reasons = []
        
        # Check state
        if "all" not in scheme.applicable_states and farmer.state not in scheme.applicable_states:
            is_eligible = False
            reasons.append(f"Not applicable in {farmer.state}")
        
        # Check district (if specified)
        if is_eligible and scheme.applicable_districts:
            applicable_districts = scheme.applicable_districts.get(farmer.state, [])
            if applicable_districts and farmer.district not in applicable_districts:
                is_eligible = False
                reasons.append(f"Not applicable in {farmer.district}")
        
        # Check eligibility criteria (simplified)
        # In production, implement complex eligibility rules
        if is_eligible and scheme.eligibility_criteria:
            # Example: Check land size for schemes with land-based criteria
            for criterion in scheme.eligibility_criteria:
                if criterion.get("type") == "land_size":
                    max_land = criterion.get("max_hectares")
                    if farmer.land_size_hectares and farmer.land_size_hectares > max_land:
                        is_eligible = False
                        reasons.append(f"Land size exceeds maximum ({max_land} hectares)")
        
        # Store eligibility check
        if not existing_check:
            existing_check = SchemeEligibility(
                farmer_id=farmer_id,
                scheme_id=scheme_id,
            )
            db.add(existing_check)
        
        existing_check.is_eligible = is_eligible
        existing_check.eligibility_checked_at = func.now()
        
        db.commit()
        
        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme.name,
            "is_eligible": is_eligible,
            "reasons": reasons if not is_eligible else [],
            "application_url": scheme.application_url,
            "helpline_number": scheme.helpline_number,
        }
    
    @staticmethod
    def mark_scheme_applied(db: Session, farmer_id: str, scheme_id: str) -> dict:
        """Mark scheme as applied by farmer"""
        
        eligibility = db.query(SchemeEligibility).filter(
            and_(
                SchemeEligibility.farmer_id == farmer_id,
                SchemeEligibility.scheme_id == scheme_id
            )
        ).first()
        
        if not eligibility:
            eligibility = SchemeEligibility(
                farmer_id=farmer_id,
                scheme_id=scheme_id,
            )
            db.add(eligibility)
        
        eligibility.is_applied = True
        eligibility.applied_at = func.now()
        eligibility.application_status = "submitted"
        
        db.commit()
        
        return {"message": "Scheme application recorded"}
    
    @staticmethod
    def get_farmer_schemes(db: Session, farmer_id: str) -> List[dict]:
        """Get all schemes for farmer (discovered and applied)"""
        
        farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
        if not farmer:
            return []
        
        # Get all schemes and eligibility status
        schemes = db.query(
            Scheme,
            SchemeEligibility
        ).outerjoin(
            SchemeEligibility,
            and_(
                SchemeEligibility.scheme_id == Scheme.id,
                SchemeEligibility.farmer_id == farmer_id
            )
        ).filter(
            Scheme.is_active == True
        ).all()
        
        result = []
        for scheme, eligibility in schemes:
            result.append({
                "scheme_id": scheme.id,
                "name": scheme.name,
                "ministry": scheme.ministry,
                "description": scheme.description,
                "benefit_amount": scheme.benefit_amount,
                "is_eligible": eligibility.is_eligible if eligibility else None,
                "is_applied": eligibility.is_applied if eligibility else False,
                "application_status": eligibility.application_status if eligibility else None,
                "application_url": scheme.application_url,
                "helpline_number": scheme.helpline_number,
            })
        
        return result


from sqlalchemy.sql import func
