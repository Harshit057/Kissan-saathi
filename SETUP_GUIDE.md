# KisanSaathi & आपनGaon - Complete Setup & Development Guide

## 📋 Project Overview

**KisanSaathi & आपनGaon** is a dual-platform digital ecosystem for Indian agriculture:

- **KisanSaathi** - Farmer-facing platform for crop planning, scheme discovery, and market access
- **आपनGaon** - Consumer marketplace connecting city residents directly to nearby farmers

## 🏗️ Architecture

```
Frontend (Next.js 14)          Backend (FastAPI)              Databases
├─ KisanSaathi (Farmer)  →  ├─ Auth Service          ├─ PostgreSQL + PostGIS
├─ आपनGaon (Consumer)   →  ├─ Farmer Service        ├─ Redis Cache
└─ Shared Components     →  ├─ Marketplace Service  ├─ Qdrant (RAG)
                         →  ├─ Scheme Service
                         →  ├─ Market Data Service
                         →  ├─ AI Service (RAG)
                         →  └─ Notification Service
```

## 🚀 Quick Start (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM available
- Port 3000 (frontend), 8000 (backend), 5432 (PostgreSQL), 6379 (Redis) available

### Option 1: Using Docker Compose (Easiest)

```bash
# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Qdrant: http://localhost:6333

### Option 2: Manual Setup (Local Development)

#### Step 1: Install Dependencies

```bash
# Frontend
npm install
# or
pnpm install

# Backend
cd backend
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

#### Step 2: Setup Services

**PostgreSQL (with PostGIS):**
```bash
# Create database
createdb kisaan_saathi

# Add PostGIS extension
psql kisaan_saathi -c "CREATE EXTENSION postgis;"

# Verify
psql kisaan_saathi -c "SELECT postgis_version();"
```

**Redis:**
```bash
# On macOS with Homebrew
brew install redis
redis-server

# On Windows (using WSL or Docker)
docker run -d -p 6379:6379 redis:7-alpine

# On Linux
sudo apt-get install redis-server
redis-server
```

**Qdrant:**
```bash
# Using Docker
docker run -d -p 6333:6333 \
  -v qdrant_storage:/qdrant/storage:z \
  qdrant/qdrant:latest
```

#### Step 3: Configure Environment

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Edit backend/.env with your settings
```

#### Step 4: Run Services

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
# From root directory
npm run dev
# or
pnpm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📊 Backend Features Implemented

### ✅ Phase 1 - Foundation (Completed)
- [x] Project structure & setup
- [x] Database schema (PostgreSQL + PostGIS)
- [x] Authentication (JWT, OTP)
- [x] User registration & login
- [x] Farmer profile management
- [x] Crop management system

### ✅ Phase 2 - Core Features (In Progress)
- [x] Farmer service (crop listings, status tracking)
- [x] Consumer profiles
- [x] Geo-proximity algorithm (PostGIS)
- [x] वMarketplace discovery
- [x] Order management
- [x] Review system
- [x] Government scheme integration
- [x] Mandi price API integration (eNAM)
- [x] Crop advisory service
- [x] RAG-based AI assistant
- [x] Notification service

### 📅 Phase 3 - Advanced Features (Planned)
- [ ] Full Bhashini integration (22 languages)
- [ ] Voice input/output
- [ ] Subscription box feature
- [ ] Delivery tracking
- [ ] SMS/Push notifications
- [ ] PWA offline mode
- [ ] Advanced analytics

## 🔑 Key API Endpoints

### Authentication
```bash
POST   /api/v1/auth/register          # Register user
POST   /api/v1/auth/login             # Login
GET    /api/v1/auth/me                # Get current user
```

### Farmer Platform (KisanSaathi)
```bash
POST   /api/v1/farmers/profile        # Create profile
GET    /api/v1/farmers/profile/{id}   # Get profile
POST   /api/v1/farmers/crops          # Create crop
POST   /api/v1/farmers/crops/{id}/ready  # Mark ready (→ lists on आपनGaon)
```

### Marketplace (आपनGaon)
```bash
GET    /api/v1/marketplace/nearby-farmers  # Geo-proximity search
GET    /api/v1/marketplace/listings        # Browse listings
POST   /api/v1/marketplace/orders          # Create order
GET    /api/v1/marketplace/reviews         # Get reviews
```

### Schemes
```bash
GET    /api/v1/schemes/discover       # Find applicable schemes
POST   /api/v1/schemes/check-eligibility  # Check eligibility
```

### Market Data
```bash
GET    /api/v1/market/mandi-prices    # Live prices (eNAM)
POST   /api/v1/market/crop-advisory   # Crop recommendations
GET    /api/v1/market/seasonal-crops  # Season-specific crops
```

### AI Assistant
```bash
POST   /api/v1/ai/chat                # Chat with AI
GET    /api/v1/ai/chat-history/{session_id}  # Get history
```

## 📁 Project Structure

```
kisaan-saathi/
├── app/                              # Next.js Frontend
│   ├── layout.tsx                   # Root layout
│   ├── (app)/                       # App routes
│   │   ├── dashboard/               # Farmer dashboard
│   │   ├── chat/                    # AI assistant
│   │   ├── crop-advisor/            # Crop recommendations
│   │   ├── crops/                   # Crop management
│   │   ├── schemes/                 # Government schemes
│   │   ├── market/                  # Mandi & selling guide
│   │   ├── listings/                # आपनGaon listings (consumer)
│   │   └── orders/                  # Order tracking
│   ├── login/                       # Authentication
│   ├── onboarding/                  # Farmer onboarding
│   └── components/                  # Reusable components
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point
│   │   ├── models.py                # SQLAlchemy models
│   │   ├── schemas.py               # Pydantic schemas
│   │   ├── database.py              # DB connection
│   │   ├── config.py                # Configuration
│   │   ├── auth.py                  # JWT utilities
│   │   ├── services/                # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── farmer_service.py
│   │   │   ├── marketplace_service.py
│   │   │   ├── scheme_service.py
│   │   │   ├── market_service.py
│   │   │   ├── ai_service.py
│   │   │   └── notification_service.py
│   │   └── api/                     # API routes
│   │       ├── auth_routes.py
│   │       ├── farmer_routes.py
│   │       ├── marketplace_routes.py
│   │       └── schemes_market_ai_routes.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── public/                           # Static assets
├── components/                       # Shared components
├── lib/                              # Utilities
├── hooks/                            # React hooks
├── store/                            # State management
├── styles/                           # Global styles
├── README.md                         # Main README
├── docker-compose.yml               # Docker services
├── package.json                     # Dependencies
└── tailwind.config.ts              # Tailwind config
```

## 🗄️ Database Schema

### Core Entities

**users** - All users (farmers & consumers)
```sql
- id (UUID primary key)
- phone (unique)
- email (unique)
- password_hash
- name
- role (farmer/consumer)
- language_preference
- is_verified
```

**farmers** - Farmer profiles
```sql
- id (UUID)
- user_id (FK to users)
- state, district, village
- location (PostGIS POINT)
- land_size_hectares
- soil_type
- crops_grown (JSON array)
- is_organic_certified
- rating (avg of reviews)
```

**crop_listings** - Crop inventory
```sql
- id (UUID)
- farmer_id (FK)
- crop_name, variety
- quantity_kg, price_per_kg
- status (planning/growing/ready/sold)
- is_organic
- aapangaon_listed (boolean)
- aapangaon_listing_id
```

**consumers** - Consumer profiles
```sql
- id (UUID)
- user_id (FK to users)
- city, pincode
- location (PostGIS POINT)
- preferred_categories (JSON array)
```

**orders** - Marketplace orders
```sql
- id (UUID)
- consumer_id, farmer_id (FK)
- crop_listing_id (FK)
- quantity_kg, price_per_kg, total_price
- status (pending/confirmed/shipped/delivered)
- payment_method (upi/card/cod)
- razorpay_order_id, razorpay_payment_id
```

**schemes** - Government schemes
```sql
- id (UUID)
- name, ministry
- description
- eligibility_criteria (JSON)
- applicable_states (JSON array)
- benefit_amount
- application_url
```

**ai_conversations** - Chat history
```sql
- id (UUID)
- user_id, session_id (FK)
- messages (JSON array)
- context_chunks (RAG references)
```

## 🔐 Authentication Flow

1. **User Registration:**
   ```
   User enters phone → Backend hashes password → Creates user record
   ```

2. **Login:**
   ```
   User enters phone + password → Backend verifies → Issues JWT tokens (access + refresh)
   ```

3. **Authenticated Requests:**
   ```
   Client sends: Authorization: Bearer <access_token>
   Backend validates: Decodes JWT → Extracts user_id → Fetches user
   ```

## 🗺️ Geo-Proximity Algorithm (Key Feature)

**How It Works:**

1. **Store Locations:**
   - Farmer village → Lat/Long (using India Post PIN database)
   - Consumer city/pincode → Lat/Long

2. **Distance Calculation:**
   - Use PostGIS `ST_Distance()` with Haversine formula
   - Distance in meters between two points

3. **Ranking:**
   ```sql
   SELECT crops.*, farmers.*, 
          ST_Distance(farmers.location, consumer_location) as distance_m
   FROM crop_listings crops
   JOIN farmers ON crops.farmer_id = farmers.id
   WHERE ST_Distance(farmers.location, consumer_location) <= (100 * 1000)  -- 100km
   ORDER BY distance_m, farmers.rating DESC
   ```

4. **Radius Categories:**
   - **Nearby Farmers** (0-100km): Green priority
   - **Regional Organic** (100-300km): Secondary options

## 🤖 AI Assistant (RAG Pipeline)

**How It Works:**

1. **Knowledge Base:**
   - Government schemes
   - Crop cultivation manuals (ICAR)
   - Weather advisories (IMD)
   - Mandi prices

2. **Query Processing:**
   ```
   User Query (any language)
   → Language Detection (Bhashini)
   → Translation to English
   → Semantic Search (MuRIL embeddings)
   → Retrieve Top-5 relevant chunks from Qdrant
   → LLM Generation (GPT-4o)
   → Translate back to user's language
   → Return with sources
   ```

3. **Languages Supported (Phase 3):**
   - Hindi, English, Tamil, Telugu, Kannada, Malayalam
   - Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese
   - Plus regional dialects (Bhojpuri, Haryanvi, Awadhi, etc.)

## 📱 Frontend Features by Role

### Farmer (KisanSaathi):
- ✅ Dashboard with crop calendar
- ✅ Crop planning wizard
- ✅ AI chat with voice input (Bhashini/Whisper)
- ✅ Government scheme finder
- ✅ Mandi price tracker
- ✅ Mark crop ready → auto-list on आपनGaon
- ✅ Beginner onboarding (10-step guide)

### Consumer (आपनGaon):
- ✅ Browse nearby farmers (geo-mapped)
- ✅ Search & filter listings
- ✅ Place orders
- ✅ Track delivery
- ✅ Leave reviews & ratings
- ✅ Subscription box feature

## 🛠️ Development Workflow

### Start with Docker:
```bash
docker-compose up -d
# All services auto-start
```

### Backend Development:
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Run tests
pytest tests/ -v

# API Docs: http://localhost:8000/docs
```

### Frontend Development:
```bash
npm run dev
# Navigate to http://localhost:3000
```

### Database Migrations:
```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "Add new feature"
alembic upgrade head
```

## 📊 Testing

```bash
# Run all tests
pytest backend/tests/ -v

# Coverage report
pytest --cov=backend/app backend/tests/

# Run specific test file
pytest backend/tests/test_auth.py -v
```

## 🚀 Deployment

### Production Checklist:
- [ ] Change SECRET_KEY in .env
- [ ] Set DEBUG=false
- [ ] Use strong database password
- [ ] Configure CORS_ORIGINS properly
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure monitoring (Sentry)
- [ ] Setup SSL/TLS certificates
- [ ] Configure CDN (Cloudflare)
- [ ] Setup backup strategy
- [ ] Load testing with Locust

### AWS Deployment Example:
```bash
# Build Docker image
docker build -t kisaan-saathi-backend backend/

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-south-1.amazonaws.com
docker tag kisaan-saathi-backend:latest <account>.dkr.ecr.ap-south-1.amazonaws.com/kisaan-saathi:latest
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/kisaan-saathi:latest

# Deploy to ECS/EKS
# (Use AWS CloudFormation, Terraform, or kubectl)
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and commit: `git commit -m 'Add amazing feature'`
3. Push: `git push origin feature/amazing-feature`
4. Create a Pull Request

## 📚 Documentation

- [Main README](./README.md)
- [Backend README](./backend/BACKEND_README.md)
- [API Documentation](http://localhost:8000/docs)

## 🐛 Troubleshooting

### Port Already in Use:
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

### Database Connection Error:
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Reset connection
dropdb kisaan_saathi
createdb kisaan_saathi
psql kisaan_saathi -c "CREATE EXTENSION postgis;"
```

### Redis Connection Error:
```bash
# Check Redis is running
redis-cli ping
# Output: PONG
```

## 📞 Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@kisaan-saathi.org

## 📄 License

MIT License - See LICENSE file

---

**Last Updated:** April 2026  
**Status:** Phase 2 Development (Core Features Ready)  
**Next Steps:** Phase 3 Advanced Features + Testing & Launch Prep
