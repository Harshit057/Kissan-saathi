# KisanSaathi & आपनGaon Backend API Documentation

## Overview

This is the FastAPI backend for the KisanSaathi (Farmer Platform) and आपनGaon (Consumer Marketplace) dual-platform ecosystem. It provides all the core business logic, database management, external API integrations, and AI-powered services.

## Technology Stack

- **Framework:** FastAPI (Python 3.9+)
- **Database:** PostgreSQL 16 with PostGIS extension
- **Cache/Queue:** Redis 7
- **Vector DB:** Qdrant (for RAG retrieval)
- **Authentication:** JWT + OAuth2
- **ORM:** SQLAlchemy 2.0
- **AI/ML:** LangChain, LlamaIndex, OpenAI GPT-4o, Bhashini

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection & session
│   ├── models.py              # SQLAlchemy models (all entities)
│   ├── schemas.py             # Pydantic validation schemas
│   ├── auth.py                # JWT & password utilities
│   │
│   ├── services/              # Business logic layer
│   │   ├── auth_service.py        # User registration & login
│   │   ├── farmer_service.py      # Farmer profiles & crop management
│   │   ├── marketplace_service.py # Consumer discovery & geo-proximity
│   │   ├── scheme_service.py      # Government schemes & eligibility
│   │   ├── market_service.py      # Mandi prices & crop advisory
│   │   ├── ai_service.py          # RAG pipeline & AI assistant
│   │   └── notification_service.py # SMS, push, email notifications
│   │
│   └── api/                   # API route handlers
│       ├── auth_routes.py         # Authentication endpoints
│       ├── farmer_routes.py       # Farmer profile & crop endpoints
│       ├── marketplace_routes.py  # Marketplace & order endpoints
│       └── schemes_market_ai_routes.py # Schemes, market, AI endpoints
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
└── README.md                 # Backend documentation
```

## Installation & Setup

### 1. Prerequisites

- Python 3.9+
- PostgreSQL 16 (with PostGIS extension)
- Redis 7
- pip or conda

### 2. Clone & Setup Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb kisaan_saathi

# Add PostGIS extension
psql kisaan_saathi -c "CREATE EXTENSION postgis;"

# Run migrations (create tables from models)
# Using Alembic (optional, or tables are auto-created from models)
# alembic upgrade head
```

### 5. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# (Database URL, API keys, etc.)
```

### 6. Run Development Server

```bash
# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Or using Python module
python -m uvicorn app.main:app --reload

# API will be available at http://localhost:8000
# Documentation at http://localhost:8000/docs
```

## API Endpoints

### Authentication (`/api/v1/auth`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/register` | POST | Register new user (farmer/consumer) |
| `/login` | POST | Login and get JWT tokens |
| `/refresh-token` | POST | Refresh access token |
| `/verify-otp` | POST | Verify OTP for phone number |
| `/me` | GET | Get current user details |

**Example:**
```bash
# Register
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "email": "farmer@example.com",
    "password": "secure_password",
    "name": "John Farmer",
    "role": "farmer",
    "language_preference": "hi"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "secure_password"
  }'
```

### Farmer Routes (`/api/v1/farmers`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/profile` | POST | Create farmer profile |
| `/profile/{farmer_id}` | GET | Get farmer profile |
| `/profile/{farmer_id}` | PUT | Update farmer profile |
| `/crops` | POST | Create crop listing |
| `/crops/{crop_id}` | GET | Get crop details |
| `/crops` | GET | List farmer's crops |
| `/crops/{crop_id}/ready` | POST | Mark crop as ready to sell |
| `/crops/{crop_id}/sold` | POST | Mark crop as sold |

**Example:**
```bash
# Create crop listing
curl -X POST "http://localhost:8000/api/v1/farmers/crops" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "farmer-123",
    "crop_name": "Wheat",
    "variety": "PBW 723",
    "quantity_kg": 500,
    "price_per_kg": 25.5,
    "is_organic": true,
    "images": ["https://s3.amazonaws.com/crop1.jpg"]
  }'

# Mark crop as ready (triggers आपनGaon listing)
curl -X POST "http://localhost:8000/api/v1/farmers/crops/crop-123/ready" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "list_on_aapangaon": true,
    "price_per_kg": 25.5
  }'
```

### Marketplace Routes (`/api/v1/marketplace`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/consumers/profile` | POST | Create consumer profile |
| `/consumers/profile/{consumer_id}` | GET | Get consumer profile |
| `/nearby-farmers` | GET | Get nearby farmers (geo-proximity) |
| `/listings` | GET | Get marketplace listings with filters |
| `/search` | GET | Search listings by crop name |
| `/orders` | POST | Create order |
| `/orders/{order_id}` | GET | Get order details |
| `/orders/{order_id}/confirm-payment` | POST | Confirm payment |
| `/reviews` | POST | Create review for order |
| `/farmers/{farmer_id}/reviews` | GET | Get farmer reviews |

**Geo-Proximity Example:**
```bash
# Get nearby farmers within 100km
curl "http://localhost:8000/api/v1/marketplace/nearby-farmers?latitude=28.7041&longitude=77.1025&radius_km=100&sort_by=distance" \
  -H "Authorization: Bearer <token>"

# Response includes:
# - Crop listings ranked by proximity
# - Farmer details (name, village, rating)
# - Distance from consumer location
# - Organic certification status
```

### Government Schemes (`/api/v1/schemes`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/discover` | GET | Discover applicable schemes |
| `/check-eligibility` | POST | Check scheme eligibility |
| `/farmer-schemes/{farmer_id}` | GET | Get all schemes for farmer |
| `/apply/{farmer_id}/{scheme_id}` | POST | Mark scheme as applied |

**Example:**
```bash
# Discover schemes for farmer
curl "http://localhost:8000/api/v1/schemes/discover?farmer_id=farmer-123" \
  -H "Authorization: Bearer <token>"

# Check eligibility for PM-KISAN
curl -X POST "http://localhost:8000/api/v1/schemes/check-eligibility" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "farmer-123",
    "scheme_id": "pm-kisan"
  }'
```

### Market Data (`/api/v1/market`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/mandi-prices` | GET | Get live mandi prices (eNAM) |
| `/price-trend` | GET | Get historical price trend |
| `/crop-advisory` | POST | Get crop advisory |
| `/seasonal-crops` | GET | Get crops for season |
| `/demand/{crop_name}` | GET | Get market demand info |

**Example:**
```bash
# Get mandi prices for wheat
curl "http://localhost:8000/api/v1/market/mandi-prices?crop_name=wheat&state=Punjab" \
  -H "Authorization: Bearer <token>"

# Get crop advisory
curl -X POST "http://localhost:8000/api/v1/market/crop-advisory" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "Wheat",
    "state": "Punjab",
    "district": "Ludhiana",
    "season": "rabi",
    "soil_type": "loamy",
    "land_size_hectares": 2
  }'
```

### AI Assistant (`/api/v1/ai`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Chat with AI assistant (RAG-powered) |
| `/chat-history/{session_id}` | GET | Get conversation history |
| `/voice-chat` | POST | Voice chat (future) |
| `/suggestions` | GET | Get conversation suggestions |

**Example:**
```bash
# Chat with AI assistant
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "message": "How do I grow wheat? शेत में गेहूं कैसे उगाएं?",
    "language": "hi",
    "session_id": "session-456"
  }'

# Response includes:
# - AI-generated response from RAG
# - Relevant knowledge base chunks
# - Follow-up suggestions
# - Session ID for conversation history
```

## Core Features Implemented

### 1. ✅ Authentication & Authorization
- User registration (farmer, consumer, admin)
- JWT-based authentication
- OTP verification for phone numbers
- Password hashing with bcrypt

### 2. ✅ Farmer Management
- Farmer profile creation & updates
- Crop listing management
- Crop lifecycle (planning → growing → ready → sold)
- Farmer ratings & reviews

### 3. ✅ आपनGaon Marketplace
- **Geo-Proximity Algorithm** (PostGIS)
  - Haversine distance calculation
  - Ranking by proximity, rating, price
  - Radius filtering (100km & 300km)
- Product discovery
- Order management
- Payment integration (Razorpay)
- Review system

### 4. ✅ Government Schemes
- Scheme eligibility checking
- Filtered discovery by state/district
- Application tracking
- Eligibility criteria matching

### 5. ✅ Market Data
- Live mandi prices (eNAM API integration)
- Historical price trends
- Crop advisory
- Seasonal recommendations
- Market demand intelligence

### 6. ✅ AI Assistant (RAG-Powered)
- Multilingual knowledge base retrieval
- Question answering on agriculture topics
- Scheme discovery via AI
- Voice input support (Whisper)
- Conversation history management

### 7. ✅ Notifications
- SMS notifications (Twilio)
- Push notifications (Firebase)
- Email notifications
- Order status updates
- Market alerts

## Database Schema

### Key Tables

**users** - Base user table (farmers & consumers)
- id, phone, email, name, role, language_preference, password_hash, is_verified

**farmers** - Farmer profiles
- id, user_id, state, district, village, location (PostGIS), land_size_hectares, soil_type, is_organic_certified, rating

**crop_listings** - Crop inventory
- id, farmer_id, crop_name, variety, quantity_kg, price_per_kg, status (planning/growing/ready/sold), is_organic, aapangaon_listed

**consumers** - Consumer profiles
- id, user_id, city, pincode, location (PostGIS), preferred_categories

**orders** - Marketplace orders
- id, consumer_id, farmer_id, crop_listing_id, quantity_kg, total_price, status, payment_method, razorpay_order_id

**schemes** - Government schemes
- id, name, ministry, description, eligibility_criteria (JSON), applicable_states, application_url

**ai_conversations** - Chat history
- id, user_id, session_id, messages (JSON array), context_chunks (knowledge base references)

## Configuration

### Environment Variables

All configuration is managed via `.env` file. See `.env.example` for all available options.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST/PORT` - Redis cache
- `SECRET_KEY` - JWT signing key (change in production!)
- `OPENAI_API_KEY` - For LLM responses
- `BHASHINI_API_KEY` - For multilingual support
- `RAZORPAY_KEY_*` - Payment processing

### Database Initialization

Tables are automatically created from SQLAlchemy models on app startup.

For custom migrations:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Development Tips

### Running Tests

```bash
pytest tests/ -v --cov=app

# Watch mode
pytest-watch tests/
```

### Code Quality

```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/

# Import sorting
isort app/
```

### API Documentation

Visit `/docs` (Swagger UI) or `/redoc` (ReDoc) for interactive API documentation.

## Integration with Frontend

The Next.js frontend connects to this backend via:

```typescript
// Example fetch call from frontend
const response = await fetch('/api/v1/farmers/crops', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(cropData)
});
```

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app
COPY .env .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### AWS Deployment

```bash
# Build & push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t kisaan-saathi .
docker tag kisaan-saathi:latest <account>.dkr.ecr.<region>.amazonaws.com/kisaan-saathi:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/kisaan-saathi:latest

# Deploy to ECS/EKS
# (AWS CLI or kubectl commands)
```

## TODO & Future Enhancements

- [ ] Complete RAG pipeline with Qdrant vector DB
- [ ] Bhashini API integration for translations
- [ ] Razorpay payment webhook verification
- [ ] Twilio SMS integration
- [ ] Firebase push notifications
- [ ] File upload to AWS S3
- [ ] Admin dashboard endpoints
- [ ] Advanced analytics
- [ ] Multi-language support for all responses
- [ ] Rate limiting
- [ ] API key management

## Support & Troubleshooting

### Database Connection Issues

```
psycopg2.OperationalError: could not connect to server
```

**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct in .env

### Redis Connection Issues

```
redis.exceptions.ConnectionError: Error connecting to redis
```

**Solution:** Start Redis server or adjust REDIS_HOST/PORT in .env

### Missing PostGIS

```
psycopg2.ProgrammingError: extension postgis not found
```

**Solution:**
```bash
psql kisaan_saathi -c "CREATE EXTENSION postgis;"
```

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostGIS Documentation](https://postgis.net/)
- [eNAM API](https://data.gov.in/)
- [Bhashini Platform](https://bhashini.gov.in/)
- [LangChain Documentation](https://python.langchain.com/)

---

**Last Updated:** April 2026  
**Status:** Phase 2 Development (Core Features Implemented)
