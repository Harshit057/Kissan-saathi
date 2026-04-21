# Frontend-Backend Integration: Quick Reference

## 🚀 Get Started in 5 Minutes

### Windows
```bash
start-dev.bat
```

### Mac/Linux
```bash
bash start-dev.sh
```

This will:
1. ✅ Setup backend virtual environment
2. ✅ Install all dependencies
3. ✅ Setup database configuration
4. ✅ Start backend server (port 8000)
5. ✅ Start frontend dev server (port 3000)

## 📍 Key URLs

| Service | URL |
|---------|-----|
| Frontend (App) | http://localhost:3000 |
| Login Page | http://localhost:3000/login |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |
| Database | localhost:5432 (PostgreSQL) |
| Cache | localhost:6379 (Redis) |

## 🔑 Test Credentials (After First User Registers)

```
Phone: 9876543210
Password: test@123456
Role: farmer
```

## 📁 Important Files

### Frontend
| File | Purpose |
|------|---------|
| `lib/apiServices.ts` | All API endpoint functions |
| `lib/axios.ts` | API client configuration |
| `app/login/page.tsx` | Login/registration page |
| `store/auth.ts` | Authentication state |
| `store/farmer.ts` | Farmer profile & crops state |
| `store/marketplace.ts` | Consumer marketplace state |

### Backend
| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI application entry |
| `backend/app/models.py` | Database models (14 tables) |
| `backend/app/services/` | Business logic (7 services) |
| `backend/app/api/` | API routes (4 routers) |
| `backend/requirements.txt` | Python dependencies |

## 🔥 Critical Tasks Before Testing

### Backend Setup
```bash
cd backend

# 1. Create database
createdb kisaan_saathi
psql kisaan_saathi -c "CREATE EXTENSION postgis;"

# 2. Copy environment
cp .env.example .env

# 3. Update .env with (at minimum)
# DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/kisaan_saathi
# SECRET_KEY=test-secret-key-change-in-production

# 4. Start server
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
# 1. Create environment
cp .env.example .env.local

# 2. Install dependencies
pnpm install  # or npm install

# 3. Start dev server
pnpm run dev  # or npm run dev
```

## 🧪 Test Full Flow

### 1. Register User
```bash
# Go to http://localhost:3000/login
# Click "New to KisaanSathi? We'll create your account"
# Fill: Phone (10 digits), Password, Name, Role (farmer/consumer)
# Click Create Account
```

### 2. Create Crop (Farmer)
```bash
# After login, go to /crops
# Fill crop details
# Submit
# Should redirect to /dashboard
```

### 3. Mark Crop Ready
```bash
# Go to /crops
# Find your crop
# Click "Mark Ready"
# Crop now appears in marketplace
```

### 4. Search Marketplace (Consumer)
```bash
# Register as consumer
# Go to /marketplace
# Should see nearby farmers with your crop
```

## 🐛 Troubleshooting

### "Cannot find database"
```bash
createdb kisaan_saathi
psql kisaan_saathi -c "CREATE EXTENSION postgis;"
```

### "Port 3000/8000 already in use"
```bash
# Windows: Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux: Kill process on port
lsof -i :3000
kill -9 <PID>
```

### "Cannot connect to backend"
- Check backend is running: `http://localhost:8000/docs` should open
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check CORS is enabled in FastAPI

### "PostgreSQL not found"
```bash
# Start PostgreSQL
# Windows: postgresql service should auto-start
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql
```

### "Token not persisting"
- Check browser localStorage: `ks_token` should exist
- Check Applications tab in DevTools
- Login again and submit form

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  Pages → Components → Stores (Zustand) → API Services  │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Axios HTTP Client
                    (Token Interceptors)
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
│  Routes → Services → Database → External APIs            │
│  (Auth, Farmers, Marketplace, Schemes, Market, AI)      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│           Databases & Services                          │
│  PostgreSQL + PostGIS | Redis | Qdrant                  │
│  (eNAM, Bhashini, OpenAI, Razorpay)                    │
└─────────────────────────────────────────────────────────┘
```

## 🎯 What Works Now

### ✅ Frontend
- [x] Login/Registration (phone + password)
- [x] Zustand stores for auth, farmer, marketplace
- [x] API client with token interceptors
- [x] Environment configuration

### ✅ Backend (Implemented but may need fixes)
- [x] Database models (14 entities)
- [x] Authentication service
- [x] Farmer CRUD operations
- [x] Crop management (planning → ready → sold)
- [x] Marketplace discovery (geo-proximity)
- [x] Order management
- [x] Review system
- [x] Government schemes
- [x] Market data (mandi prices)
- [x] AI assistant framework
- [x] Notification system

### ⚠️ Needs Testing
- [ ] Login flow integration
- [ ] Create crop flow
- [ ] Marketplace discovery
- [ ] Payment integration
- [ ] AI chat

## 🛠️ Development Commands

### Backend
```bash
# Development
uvicorn app.main:app --reload

# Format code
black app/

# Lint
flake8 app/

# Type check
mypy app/

# Run tests
pytest tests/
```

### Frontend
```bash
# Development
pnpm run dev

# Build
pnpm run build

# Type check
pnpm run type-check

# Lint
pnpm run lint

# Format
pnpm run format
```

## 📈 Next Steps

### Phase 1: Get Working (This Week)
1. [ ] Setup both services locally
2. [ ] Register first user successfully
3. [ ] Create crop successfully
4. [ ] View crop on marketplace
5. [ ] Test payment flow (mock)

### Phase 2: Core Features (Next Week)
1. [ ] Build farmer dashboard with real data
2. [ ] Build marketplace discovery page
3. [ ] Implement order management
4. [ ] Add AI chat interface
5. [ ] Government schemes page

### Phase 3: Polish & Deploy (Following Week)
1. [ ] Add notifications (SMS/push)
2. [ ] Implement voice features
3. [ ] Add advanced filters
4. [ ] Performance optimization
5. [ ] Security audit
6. [ ] Deploy to production

## 📞 Quick Help

### Lost? Check These Files
- **"How do I make an API call?"** → `lib/apiServices.ts`
- **"How do I store data?"** → `store/farmer.ts` or `store/marketplace.ts`
- **"How do I add authentication?"** → `lib/axios.ts` & `store/auth.ts`
- **"How do I understand the backend?"** → `backend/BACKEND_README.md`
- **"What endpoints exist?"** → `backend/app/api/` (the 4 router files)

### Common Code Patterns

**Fetch Data in Component**
```typescript
import { useFarmerStore } from '@/store/farmer';

export default function MyComponent() {
  const { farmer, isLoading } = useFarmerStore();
  const { fetchFarmer } = useFarmerStore();

  useEffect(() => {
    fetchFarmer(user_id);
  }, []);

  return isLoading ? <p>Loading...</p> : <p>{farmer?.name}</p>;
}
```

**Call API Directly**
```typescript
import { farmerService } from '@/lib/apiServices';

const crops = await farmerService.getFarmerCrops('farmer-123');
```

**Access Current User**
```typescript
import { useAuthStore } from '@/store/auth';

const { user, token } = useAuthStore();
```

## 🚨 Gotchas & Known Issues

1. **Token Expires**: Access tokens last 30 minutes. Implement refresh token logic if needed.
2. **CORS**: Make sure frontend URL is in backend CORS allowed origins.
3. **Timezone**: Dates might be in UTC. Convert for display.
4. **Image Upload**: S3 URLs needed for crop images.
5. **Real-time**: Current implementation uses polling. Add WebSockets for live updates.

## 📖 Documentation

- **Full Backend API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Backend README**: `backend/BACKEND_README.md`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Setup Guide**: `SETUP_GUIDE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

**Status**: 🟡 Integration in Progress  
**Last Updated**: April 20, 2026  
**GitHub Issues**: Create one for blockers
