# Frontend-Backend Integration Guide

## Current Status

### ✅ Completed
- [x] API client setup (axios with token interceptors)
- [x] API service functions for all endpoints
- [x] Auth store with login/logout
- [x] Login page (phone + password flow)
- [x] Farmer store for profile & crops management
- [x] Marketplace store for consumer data
- [x] Environment configuration template

### ⏳ In Progress
- [ ] Update backend auth endpoints to support password-based login
- [ ] Build farmer dashboard with real data
- [ ] Implement crop management pages
- [ ] Build marketplace discovery page
- [ ] Implement order management
- [ ] Add AI chat interface

### 🚀 Next Steps

## Setup Instructions

### 1. Environment Setup

**Frontend (.env.local)**
```bash
cp .env.example .env.local

# Edit .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Backend (.env)**
```bash
cd backend
cp .env.example .env

# Edit .env with:
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/kisaan_saathi
REDIS_HOST=localhost
REDIS_PORT=6379
SECRET_KEY=your-secret-key-change-in-production
OPENAI_API_KEY=your-key
BHASHINI_API_KEY=your-key
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-key
```

### 2. Start Services

**Backend (Terminal 1)**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend (Terminal 2)**
```bash
pnpm run dev
# or
npm run dev
```

**Database (Terminal 3 - if using local PostgreSQL)**
```bash
createdb kisaan_saathi
psql kisaan_saathi -c "CREATE EXTENSION postgis;"
```

### 3. Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend Login: http://localhost:3000/login

## Critical Backend Updates Needed

### 1. Update Auth Routes

The current backend expects phone+password login but also has OTP verification. Choose one approach:

**Option A: Keep Current OTP Approach (Less Secure)**
- Frontend needs to request OTP first
- Verify OTP to get tokens
- Requires SMS provider (Twilio, Firebase)

**Option B: Use Phone+Password (Current Frontend)**
- Users register with password
- Login with phone+password
- Simpler for development/testing

**Current Implementation: Option B (Phone+Password)**

The frontend now expects:
```
POST /auth/register
{
  "phone": "9876543210",
  "password": "password123",
  "name": "John",
  "role": "farmer"
}

POST /auth/login
{
  "phone": "9876543210",
  "password": "password123"
}

GET /auth/me
# Returns current user details
```

### 2. Missing/Incomplete Endpoints

#### Health Check
```python
# app/api/health.py
@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "KisaanSathi backend is running"}
```

#### Get Current User by Token
```python
# Update auth_routes.py
@router.get("/me", response_model=UserResponse)
def get_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user from JWT token"""
    return current_user
```

#### Consumer Orders Endpoint
```python
# app/api/marketplace_routes.py - Add
@router.get("/orders", response_model=list)
def get_consumer_orders(
    consumer_id: str,
    db: Session = Depends(get_db)
):
    """Get all orders for a consumer"""
    orders = db.query(Order).filter(Order.consumer_id == consumer_id).all()
    return orders
```

### 3. Add Middleware for User Dependency

```python
# app/main.py

from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.auth import decode_token
from app.models import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Extract user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
```

## Data Flow Example

### 1. User Registration
```
Frontend (Login Page) 
→ Fills phone, password, name, role
→ POST /auth/register
→ Backend validates, creates user in DB
→ Returns access_token, refresh_token
→ Frontend stores token in localStorage & zustand
→ Redirects to /onboarding or /dashboard
```

### 2. Farmer Creates Crop
```
Frontend (Crops Page)
→ Fills crop details, uploads image
→ POST /farmers/crops (with farmer_id from auth state)
→ Backend validates, stores in DB
→ Returns created crop_id, status=PLANNING
→ Frontend updates farmer store with new crop
```

### 3. Farmer Marks Crop Ready
```
Frontend (Crop Detail Page)
→ User clicks "Mark Ready"
→ POST /farmers/crops/{crop_id}/ready
→ Backend updates status=READY
→ Backend auto-creates marketplace listing
→ Sets aapangaon_listed=true
→ Frontend navigates to marketplace view
```

### 4. Consumer Searches Nearby Farmers
```
Frontend (Marketplace Page)
→ Gets user location (geolocation API)
→ GET /marketplace/nearby-farmers?latitude=28.7&longitude=77.1&radius_km=100
→ Backend uses PostGIS to calculate distances
→ Returns ranked listings by distance/rating
→ Frontend displays on map/list
```

### 5. Consumer Places Order
```
Frontend (Listing Detail Page)
→ User enters quantity, selects payment method
→ POST /marketplace/orders
→ Backend creates order, returns razorpay_order_id
→ Frontend displays payment modal (Razorpay)
→ User completes payment
→ Frontend calls POST /marketplace/orders/{id}/confirm-payment
→ Backend updates order status to CONFIRMED
→ Both farmer and consumer get notifications
```

## Frontend Components to Build

### Farmer Features
1. **Dashboard** (`/dashboard`)
   - Stats (active crops, schemes, prices)
   - Weather forecast
   - Mandi prices ticker
   - Quick actions

2. **Crops Management** (`/crops`)
   - List crops with status
   - Create new crop
   - Edit crop details
   - Mark ready/sold

3. **Crop Detail** (`/crops/{id}`)
   - Full crop information
   - Status timeline
   - Mark ready button
   - Sales history (if sold)

4. **AI Chat** (`/chat`)
   - Chat interface with bot
   - Voice input/output
   - Context-aware responses
   - Crop & scheme advice

5. **Government Schemes** (`/schemes`)
   - Browse available schemes
   - Eligibility checker
   - Application tracking
   - Document upload

6. **Market Prices** (`/market`)
   - Live mandi prices
   - Price trends (charts)
   - Price alerts setup
   - Market demand

7. **Profile** (`/profile`)
   - Edit profile details
   - Bank details
   - Certification info
   - Notification preferences

### Consumer Features
1. **Marketplace** (`/listings`)
   - Search by crop name
   - Filter by distance/price/organic
   - Map view of nearby farmers
   - Crop details + farmer rating

2. **Nearby Farmers** (`/marketplace/nearby-farmers`)
   - Map with geo-proximity search
   - List view with sorting
   - Farmer profiles

3. **Orders** (`/orders`)
   - Order history
   - Order status tracking
   - Delivery tracking
   - Invoice download

4. **Reviews** (`/profile`)
   - Write reviews  
   - View rating history
   - Verified purchase badge

## Testing the Integration

### 1. Test Registration Flow
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "test123456",
    "name": "Test Farmer",
    "role": "farmer"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "test123456"
  }'
```

### 3. Test Protected Route
```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Test Create Crop
```bash
curl -X POST http://localhost:8000/api/v1/farmers/crops \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "Wheat",
    "variety": "PBW 723",
    "quantity_kg": 500,
    "price_per_kg": 25.5,
    "is_organic": true
  }'
```

## Common Issues & Solutions

### 1. CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Backend's CORS is misconfigured
```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Token Not Persistent
**Error**: User logged out after page refresh

**Solution**: Check localStorage and Zustand persist config
```typescript
// lib/axios.ts
let token: string | null = null;
if (typeof window !== 'undefined') {
  token = localStorage.getItem('ks_token');
}
```

### 3. Database Connection Error
**Error**: `psycopg2.OperationalError`

**Solution**: 
```bash
# Check PostgreSQL
psql -U postgres -c "SELECT 1"

# Check DATABASE_URL in .env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/kisaan_saathi

# Create database if missing
createdb kisaan_saathi
psql kisaan_saathi -c "CREATE EXTENSION postgis;"
```

### 4. API Response Format Mismatch
**Error**: Frontend expects different response format

**Solution**: Always return data in the expected format from backend. Use Pydantic schemas for validation.

## Next Priority Tasks

### High Priority
1. [ ] Fix backend auth endpoints to work with password login
2. [ ] Add health check endpoint
3. [ ] Fix user dependency injection
4. [ ] Build farmer dashboard page
5. [ ] Build crop management UI
6. [ ] Test full farmer flow (register → create crop → mark ready)

### Medium Priority
1. [ ] Build marketplace discovery page
2. [ ] Implement order creation flow
3. [ ] Add AI chat interface
4. [ ] Build scheme discovery page
5. [ ] Add payment integration (Razorpay)

### Low Priority
1. [ ] Advanced features (voice input, notifications)
2. [ ] Analytics dashboard
3. [ ] Admin features
4. [ ] Performance optimization

## Code Examples

### Creating a New Page with API Integration

```typescript
// app/crops/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFarmerStore } from '@/store/farmer';
import { Loader2 } from 'lucide-react';

export default function CropsPage() {
  const { user } = useAuthStore();
  const { crops, isLoading, error, fetchCrops } = useFarmerStore();

  useEffect(() => {
    if (user?.id) {
      fetchCrops(user.id);
    }
  }, [user?.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1>My Crops</h1>
      {crops.map((crop) => (
        <div key={crop.id} className="border rounded p-4">
          <h3>{crop.crop_name}</h3>
          <p>{crop.quantity_kg}kg @ ₹{crop.price_per_kg}</p>
          <p>Status: {crop.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### Using Marketplace Store

```typescript
// app/marketplace/page.tsx
const { searchNearbyFarmers, nearbyFarmers } = useMarketplaceStore();

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      searchNearbyFarmers(
        position.coords.latitude,
        position.coords.longitude,
        100  // 100km radius
      );
    });
  }
}, []);
```

---

**Status**: 🟡 In Progress  
**Last Updated**: April 20, 2026  
**Next Review**: When frontend-backend integration is 80% complete
