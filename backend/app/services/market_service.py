"""
Market Data Service - Mandi Prices, Seasonality & Crop Advisory
"""

import httpx
import redis
import json
from typing import List, Optional, Dict, Any
from app.config import get_settings
from datetime import datetime, timedelta

settings = get_settings()

# Redis client for caching
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)


class MandiPriceService:
    """Mandi Price Data Service (eNAM API Integration)"""
    
    ENAM_API_BASE = "https://api.enam.gov.in/web"
    AGMARKNET_API_BASE = "https://agmarknet.dac.gov.in/api"
    
    @staticmethod
    async def get_mandi_prices(
        crop_name: str,
        state: Optional[str] = None,
        market_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch live mandi prices from eNAM API.
        Results are cached for MANDI_PRICE_CACHE_TTL_HOURS
        """
        
        cache_key = f"mandi_prices:{crop_name.lower()}:{state or 'all'}:{market_name or 'all'}"
        
        # Check cache
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        try:
            # In production, integrate with actual eNAM API
            # For now, return sample data
            prices = MandiPriceService._get_sample_prices(crop_name, state, market_name)
            
            # Cache for specified TTL
            ttl_seconds = settings.MANDI_PRICE_CACHE_TTL_HOURS * 3600
            redis_client.setex(cache_key, ttl_seconds, json.dumps(prices))
            
            return prices
            
        except Exception as e:
            print(f"Error fetching mandi prices: {e}")
            return []
    
    @staticmethod
    def _get_sample_prices(
        crop_name: str,
        state: Optional[str] = None,
        market_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Sample mandi price data for development"""
        
        sample_data = {
            "wheat": [
                {
                    "crop_name": "Wheat",
                    "variety": "PBW 723",
                    "market_name": "Delhi Safal Mandi",
                    "market_city": "New Delhi",
                    "state": "Delhi",
                    "price_per_kg": 24.5,
                    "min_price": 23.0,
                    "max_price": 26.0,
                    "quantity_arrived_tonnes": 1250,
                    "updated_at": datetime.now().isoformat(),
                },
                {
                    "crop_name": "Wheat",
                    "variety": "HS 507",
                    "market_name": "Mandi Paota",
                    "market_city": "Haryana",
                    "state": "Haryana",
                    "price_per_kg": 23.8,
                    "min_price": 22.5,
                    "max_price": 25.2,
                    "quantity_arrived_tonnes": 890,
                    "updated_at": datetime.now().isoformat(),
                }
            ],
            "rice": [
                {
                    "crop_name": "Rice",
                    "variety": "Basmati",
                    "market_name": "Punjab Mandi",
                    "market_city": "Ludhiana",
                    "state": "Punjab",
                    "price_per_kg": 45.0,
                    "min_price": 42.0,
                    "max_price": 48.0,
                    "quantity_arrived_tonnes": 560,
                    "updated_at": datetime.now().isoformat(),
                }
            ],
            "tomato": [
                {
                    "crop_name": "Tomato",
                    "variety": "Hybrid",
                    "market_name": "Bangalore Market",
                    "market_city": "Bangalore",
                    "state": "Karnataka",
                    "price_per_kg": 12.5,
                    "min_price": 10.0,
                    "max_price": 15.0,
                    "quantity_arrived_tonnes": 340,
                    "updated_at": datetime.now().isoformat(),
                }
            ]
        }
        
        return sample_data.get(crop_name.lower(), [])
    
    @staticmethod
    def get_price_trend(crop_name: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get historical price trend for a crop"""
        
        cache_key = f"price_trend:{crop_name.lower()}:{days}"
        
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # In production, fetch from time-series database
        # For demo, return simulated trend
        trend = []
        base_price = 25.0
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i)).date()
            price = base_price + (i * 0.3) + (i % 3 - 1) * 2  # Simulate price movement
            trend.append({
                "date": str(date),
                "price_per_kg": round(price, 2),
                "market_average": round(price, 2)
            })
        
        redis_client.setex(cache_key, 86400, json.dumps(trend))  # Cache for 1 day
        return trend


class CropAdvisoryService:
    """Crop Advisory & Seasonality Service (RAG-based)"""
    
    # In-memory database of crops (in production, use Qdrant for RAG retrieval)
    CROP_DATA = {
        "wheat": {
            "seasons": ["rabi"],
            "sowing_months": ["October", "November"],
            "harvest_months": ["March", "April"],
            "water_requirement_mm": "450-650",
            "soil_types": ["loamy", "clay loam", "alluvial"],
            "varieties": ["PBW 723", "HS 507", "HD 2967"],
            "expected_yield_tonnes_per_hectare": "4-6",
            "pest_management": [
                "Use neem-based pesticides for armyworm",
                "Implement crop rotation to prevent diseases",
                "Spray fungicide for rust management"
            ],
            "irrigation_schedule": [
                "First irrigation: 21-25 days after sowing",
                "Second irrigation: 45-50 days after sowing",
                "Third irrigation: 65-70 days after sowing"
            ]
        },
        "rice": {
            "seasons": ["kharif"],
            "sowing_months": ["June", "July"],
            "harvest_months": ["September", "October"],
            "water_requirement_mm": "1000-2000",
            "soil_types": ["clay", "clay loam"],
            "varieties": ["Basmati", "Sona", "IR-64"],
            "expected_yield_tonnes_per_hectare": "5-7",
            "pest_management": [
                "Field sanitation to prevent diseases",
                "Use biological pest control",
                "Monitor for sheath blight"
            ],
            "irrigation_schedule": [
                "Submergence in field: 2.5-5 cm",
                "Maintain water level throughout season",
                "Drain field 2 weeks before harvest"
            ]
        },
        "tomato": {
            "seasons": ["all"],
            "sowing_months": ["January", "July"],
            "harvest_months": ["April", "October"],
            "water_requirement_mm": "400-500",
            "soil_types": ["loamy", "sandy loam"],
            "varieties": ["Hybrid", "Poinsett", "Roma"],
            "expected_yield_tonnes_per_hectare": "20-30",
            "pest_management": [
                "Use drip irrigation to prevent fungal diseases",
                "Spray neem oil for whitefly management",
                "Prune affected leaves immediately"
            ],
            "irrigation_schedule": [
                "Daily light irrigation in summer",
                "Irrigation every 2-3 days in winters",
                "Ensure soil moisture is 60-70% of field capacity"
            ]
        }
    }
    
    @staticmethod
    def get_crop_advisory(
        crop_name: str,
        state: str,
        district: str,
        season: Optional[str] = None,
        soil_type: Optional[str] = None,
        land_size_hectares: Optional[float] = None
    ) -> Dict[str, Any]:
        """Get comprehensive crop advisory"""
        
        crop_data = CropAdvisoryService.CROP_DATA.get(crop_name.lower())
        
        if not crop_data:
            return {"error": f"Crop '{crop_name}' not found in advisory database"}
        
        advisory = {
            "crop_name": crop_name,
            "state": state,
            "district": district,
            "seasons": crop_data["seasons"],
            "recommended_varieties": crop_data["varieties"][:3],
            "sowing_window": {
                "start": crop_data["sowing_months"][0],
                "end": crop_data["sowing_months"][-1]
            },
            "harvest_window": {
                "start": crop_data["harvest_months"][0],
                "end": crop_data["harvest_months"][-1]
            },
            "water_requirement_mm": crop_data["water_requirement_mm"],
            "suitable_soil_types": crop_data["soil_types"],
            "irrigation_schedule": crop_data["irrigation_schedule"],
            "expected_yield_tonnes_per_hectare": crop_data["expected_yield_tonnes_per_hectare"],
            "pest_management_tips": crop_data["pest_management"],
        }
        
        # Add estimated production if land size provided
        if land_size_hectares:
            yield_range = crop_data["expected_yield_tonnes_per_hectare"].split("-")
            min_yield = float(yield_range[0]) * land_size_hectares
            max_yield = float(yield_range[1]) * land_size_hectares
            advisory["estimated_production_tonnes"] = f"{min_yield:.1f}-{max_yield:.1f}"
        
        return advisory
    
    @staticmethod
    def get_seasonal_crops(state: str, season: str) -> List[Dict[str, str]]:
        """Get crops recommended for a specific season in a state"""
        
        seasonal_crops = []
        
        for crop_name, crop_data in CropAdvisoryService.CROP_DATA.items():
            if season.lower() in [s.lower() for s in crop_data["seasons"]]:
                seasonal_crops.append({
                    "crop_name": crop_name,
                    "sowing_months": ", ".join(crop_data["sowing_months"]),
                    "harvest_months": ", ".join(crop_data["harvest_months"]),
                    "varieties": ", ".join(crop_data["varieties"][:3]),
                    "expected_yield": crop_data["expected_yield_tonnes_per_hectare"]
                })
        
        return seasonal_crops


class MarketDemandService:
    """Market Demand & Pricing Intelligence"""
    
    @staticmethod
    def get_market_demand(crop_name: str) -> Dict[str, Any]:
        """Get market demand information for a crop"""
        
        # In production, integrate with market intelligence data
        demand_data = {
            "wheat": {
                "demand_level": "high",
                "price_trend": "stable",
                "market_capacity": "~10 million tonnes annually",
                "export_potential": "2-3 million tonnes",
                "competition": "high"
            },
            "rice": {
                "demand_level": "very high",
                "price_trend": "increasing",
                "market_capacity": "~12 million tonnes annually",
                "export_potential": "1-2 million tonnes",
                "competition": "very high"
            },
            "tomato": {
                "demand_level": "high",
                "price_trend": "fluctuating",
                "market_capacity": "~2 million tonnes annually",
                "export_potential": "seasonal",
                "competition": "medium"
            }
        }
        
        return demand_data.get(crop_name.lower(), {
            "demand_level": "unknown",
            "price_trend": "unknown",
            "market_capacity": "no data",
            "export_potential": "no data",
            "competition": "unknown"
        })
