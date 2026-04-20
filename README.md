# KisanSaathi & आपनGaon

> **Empowering Indian Agriculture Through Technology**

A dual-platform digital ecosystem connecting farmers directly to consumers, eliminating middlemen, and democratizing access to agricultural knowledge across 140+ million farming households in India.

![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Languages](https://img.shields.io/badge/Languages-22%2B%20Indian%20Languages-orange)

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Two Platforms](#the-two-platforms)
- [Key Problems Solved](#key-problems-solved)
- [Project Objectives](#project-objectives)
- [Core Features](#core-features)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## 🎯 Overview

India's agricultural sector serves 140 million farming households but remains fragmented, information-poor, and intermediary-heavy. **KisanSaathi & आपनGaon** addresses this through:

1. **KisanSaathi** — A comprehensive farmer-facing platform offering crop planning, scheme discovery, market access, and AI-powered agricultural guidance in 22+ languages.

2. **आपनGaon** — A direct farm-to-consumer e-commerce marketplace that removes middlemen, reducing prices for consumers and increasing income for farmers.

The two platforms share unified backend infrastructure with **real-time inventory synchronization**: when a farmer marks a harvest as ready on KisanSaathi, it automatically appears on आपनGaon, creating a seamless farm-to-consumer pipeline.

---

## 🚜 The Two Platforms

### KisanSaathi (Farmer Dashboard)

**Target Users:** Small & marginal farmers, agricultural graduates, rural youth (86% of 140M farming households)

**Key Capabilities:**
- 📝 Multilingual farmer registration (22+ Indian languages)
- 🤖 AI-powered crop advisor (RAG-based, trained on regional dialects)
- 📋 Government scheme finder (PM-KISAN, PMFBY, KCC, state subsidies)
- 📊 Live mandi pricing & market access guidance
- 🎤 Voice-enabled AI chatbot with dialect support
- 🌾 Beginner onboarding module (10-step crop lifecycle)
- 💬 Real-time weather and advisory alerts
- ✅ Crop ready notification → auto-list on आपनGaon

**Language Support:** Hindi, English, Bhojpuri, Marathi, Haryanvi, Tamil, Telugu, Kannada, Malayalam, Punjabi, Bengali, Gujarati, Odia, Assamese, and 8+ more regional languages.

### आपनGaon (Consumer Marketplace)

**Target Users:** Urban middle-class health-conscious consumers (Tier 1 & 2 cities, ~300M with spending power)

**Key Capabilities:**
- 🗺️ Geo-proximity matching algorithm (nearest farmers ranked first)
- 👨‍🌾 Farmer-verified organic listings with traceability
- 🛒 Frictionless shopping cart & checkout (UPI, cards, COD)
- 📦 Weekly/monthly subscription boxes from nearby farmers
- 📍 Real-time delivery tracking (Shiprocket/Delhivery integration)
- ⭐ Farmer ratings and OrganiCertification badges
- 💚 Direct support to local farming communities

**Unique Value Proposition:** Consumers get genuinely organic produce at 60-70% of premium chain prices while supporting verified local farmers.

---

## 💡 Key Problems Solved

### For Farmers:
- ❌ **Language Barrier** → ✅ Multilingual AI assistant in 22+ languages including regional dialects
- ❌ **Scheme Ignorance** → ✅ Automated scheme discovery & eligibility filtering
- ❌ **No Crop Planning** → ✅ AI advisor for regional sowing, variety selection, yield prediction
- ❌ **Market Access** → ✅ Alternative channels beyond mandis (FPOs, exports, आपनGaon)
- ❌ **Middlemen Losses** → ✅ Direct-to-consumer sales (60-70% vs 30-35% net income)
- ❌ **No Beginner Support** → ✅ Structured digital guidance for new farmers

### For Consumers:
- ❌ **Overpriced Organic** → ✅ 40-50% lower prices through direct farmer connection
- ❌ **No Direct Access** → ✅ Verified, trustworthy farmer marketplace
- ❌ **Middlemen Inefficiency** → ✅ Fresh produce, transparent sourcing, reduced cost

---

## 🎯 Project Objectives

1. Build a multilingual farmer dashboard with low-bandwidth mobile support
2. Develop RAG-powered AI assistant trained on Indian agricultural data & regional dialects
3. Integrate real-time government scheme data (PM-KISAN, PMFBY, eNAM, state portals)
4. Provide live mandi pricing and international market guidance
5. Build आपनGaon as a direct-to-consumer organic marketplace
6. Implement geo-proximity algorithm connecting consumers to nearest farmers
7. Enable automated inventory synchronization (crop ready → marketplace listing)
8. Support UPI-based payments for rural-compatible transactions
9. Support all 22 scheduled Indian languages + major regional dialects
10. Create beginner onboarding module covering full crop lifecycle

---

## ✨ Core Features

### Phase 1 ✅ (Foundation)
- [x] Project setup & CI/CD pipeline
- [x] Authentication system
- [x] Basic farmer dashboard
- [x] eNAM API integration for mandi prices
- [x] Basic scheme listing

### Phase 2 🔄 (Core Features - In Progress)
- [ ] RAG pipeline setup (Qdrant, MuRIL embeddings)
- [ ] AI assistant (Hindi, English, 10+ major languages)
- [ ] आपनGaon marketplace
- [ ] Geo-proximity algorithm
- [ ] Razorpay payment integration
- [ ] Inventory synchronization

### Phase 3 📅 (Advanced)
- [ ] Full 22-language support
- [ ] Beginner onboarding module
- [ ] Subscription box feature
- [ ] Delivery integration & tracking
- [ ] SMS notifications
- [ ] PWA offline mode

### Phase 4 🚀 (Launch)
- [ ] Comprehensive testing (80%+ coverage)
- [ ] Load testing (10K concurrent users)
- [ ] Security audit & penetration testing
- [ ] Performance optimization
- [ ] Public launch

---

## 🛠️ Technical Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** | SSR web applications for both platforms |
| **React** | Component-based UI development |
| **Tailwind CSS** | Utility-first styling, mobile-first responsive |
| **PWA (Workbox)** | Offline support, installable app for farmers |
| **i18next** | Internationalization for 22+ languages |
| **ShadCN UI** | Accessible, screen-reader friendly components |
| **React Query** | Server state management, caching |

### Backend
| Technology | Purpose |
|---|---|
| **Python / FastAPI** | High-performance REST API |
| **Celery + Redis** | Background job queue (inventory sync, notifications) |
| **WebSockets** | Real-time order updates, listing alerts |
| **JWT + OAuth2** | Stateless authentication |

### Database & Storage
| Technology | Purpose |
|---|---|
| **PostgreSQL 16** | Relational database (users, crops, orders, reviews) |
| **PostGIS** | Geospatial queries for proximity matching |
| **Qdrant** | Vector database for RAG (open-source) |
| **Redis 7** | Caching, job queue |
| **AWS S3 / Cloudflare R2** | Media storage (farmer photos, crop images) |

### AI / NLP Stack
| Technology | Role |
|---|---|
| **LangChain / LlamaIndex** | RAG orchestration |
| **MuRIL / IndicBERT** | Multilingual embeddings (17 Indian languages) |
| **GPT-4o / Gemini 1.5 Pro** | LLM for response synthesis |
| **Bhashini API** | Translation, language ID (govt of India, free) |
| **OpenAI Whisper** | Speech-to-text for dialects |

### Third-Party Integrations
- **eNAM / AGMARKNET** — Live mandi prices
- **PM-KISAN Portal** — Scheme eligibility
- **IMD Agromet** — Weather & sowing advisories
- **Razorpay** — Payments (UPI, cards, COD)
- **Shiprocket / Delhivery** — Logistics & delivery tracking
- **Firebase / AWS SNS** — Push notifications & SMS

### DevOps & Infrastructure
- **Docker** — Containerization
- **Kubernetes (AWS EKS)** — Orchestration & auto-scaling
- **GitHub Actions** — CI/CD pipeline
- **AWS** — EC2, RDS, ElastiCache, S3 (ap-south-1 region)
- **Cloudflare CDN** — Asset delivery
- **Prometheus + Grafana** — Monitoring
- **Sentry** — Error tracking
- **ELK Stack** — Log aggregation

---

## 🏗️ Architecture

### Layered Architecture
```
Layer 1: Frontend (Next.js PWA for both KisanSaathi & आपनGaon)
    ↓
Layer 2: API Gateway (Single entry point routing)
    ↓
Layer 3: Core Services (Auth, Farmer Profile, Crop Mgmt, Orders, Schemes)
    ↓
Layer 4: AI Service (RAG pipeline, LLM, speech-to-text, language detection)
    ↓
Layer 5: Data Layer (PostgreSQL, Qdrant, Redis, S3)
    ↓
Layer 6: External APIs (Bhashini, eNAM, IMD, Razorpay, Shiprocket)
```

### Key Algorithms

**Geo-Proximity Matching:**
1. Capture consumer location (city/pincode/GPS)
2. Store farmer village coordinates (lat/lng from India Post PIN database)
3. Apply Haversine formula to calculate great-circle distance
4. Rank listings by proximity (within 100km = "Nearby Farmers", 300km = "Regional")
5. Further adjust by crop freshness, farmer rating, quantity for composite relevance score

**Automated Inventory Synchronization:**
1. Farmer marks crop as "Ready to Sell" on KisanSaathi
2. PostgreSQL crop record updated (status=READY, harvest_date, quantity)
3. Background job creates آپnGaon listing with farmer verification & coordinates
4. Nearby consumers subscribed to crop category receive push notifications
5. When sold out, listing deactivated & farmer receives SMS confirmation with payment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- pnpm (recommended) or npm
- Python 3.9+ (for backend development)
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/kisaan-saathi.git
   cd kisaan-saathi
   ```

2. **Install frontend dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # Languages & Internationalization
   NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   
   # Third-party APIs
   NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
   NEXT_PUBLIC_SHIPROCKET_API=your_shiprocket_api
   NEXT_PUBLIC_BHASHINI_API_KEY=your_bhashini_key
   
   # Firebase / Push Notifications
   NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_config
   ```

4. **Backend setup (Python):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Database setup:**
   ```bash
   # Create PostgreSQL database
   createdb kisaan_saathi
   
   # Run migrations
   psql kisaan_saathi < db/schema.sql
   
   # Enable PostGIS extension
   psql kisaan_saathi -c "CREATE EXTENSION postgis;"
   ```

---

## ▶️ Running the Project

### Frontend (Development Server)

```bash
pnpm run dev
# or
npm run dev
```

The application will be available at:
- **KisanSaathi (Farmer):** http://localhost:3000
- **आपनGaon (Consumer):** http://localhost:3000/marketplace

**Build for production:**
```bash
pnpm run build
pnpm start
```

### Backend (Python/FastAPI)

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API documentation will be available at: http://localhost:8000/docs

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Qdrant (Vector DB): http://localhost:6333

### Project Structure

```
kisaan-saathi/
├── app/                          # Next.js application
│   ├── (app)/                    # Farmer dashboard (KisanSaathi)
│   │   ├── chat/                 # AI assistant
│   │   ├── crop-advisor/         # Crop recommendation
│   │   ├── crops/                # Crop management
│   │   ├── dashboard/            # Main dashboard
│   │   ├── learning/             # Beginner onboarding
│   │   ├── market/               # Mandi prices & selling guide
│   │   ├── schemes/              # Government schemes
│   │   └── ...
│   ├── login/                    # Authentication
│   ├── onboarding/               # Initial farmer onboarding
│   └── layout.tsx                # Root layout
├── components/                   # Reusable React components
│   ├── ui/                       # ShadCN UI components
│   ├── LanguagePill.tsx          # Language selector
│   ├── CameraCapture.tsx         # Mobile camera input
│   └── ...
├── lib/                          # Utilities & helpers
│   ├── api.ts                    # API client
│   ├── axios.ts                  # Axios configuration
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Helper functions
├── store/                        # State management
│   └── auth.ts                   # Authentication state
├── styles/                       # Global styles
├── public/                       # Static assets
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── api/                  # API routes
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   ├── schemas/              # Request/response schemas
│   │   └── ai/                   # RAG & LLM services
│   ├── requirements.txt
│   └── main.py                   # FastAPI entry point
├── middleware.ts                 # Next.js middleware
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Frontend dependencies
├── pnpm-lock.yaml                # Locked dependencies
└── README.md                     # This file
```

---

## 📅 Development Roadmap

| Phase | Timeline | Status | Deliverables |
|-------|----------|--------|--------------|
| **Phase 1: Foundation** | Months 1–2 | ✅ In Progress | Setup, Auth, Dashboard, eNAM integration |
| **Phase 2: Core Features** | Months 3–4 | 📋 Planned | RAG pipeline, AI assistant, आपनGaon, Payments |
| **Phase 3: Advanced** | Months 5–6 | 📅 Planned | Full translations, Subscriptions, SMS, PWA offline |
| **Phase 4: Launch** | Month 7 | 🚀 Planned | Testing, Optimization, Production deployment |

---

## 📊 Performance & Non-Functional Requirements

- **Load Time:** <3s on 4G, <6s on 3G
- **Scalability:** 10K concurrent users (MVP) → 100K+ via horizontal scaling
- **Security:** AES-256 encryption at rest, TLS 1.3 in transit
- **Availability:** Offline mode for core features via service workers
- **Usability:** Icon-based navigation, voice commands, semi-literate farmer friendly
- **Localization:** All Indian scripts (Devanagari, Tamil, Telugu, etc.)
- **Code Coverage:** Minimum 80% test coverage
- **SEO:** Next.js SSR optimization for आपनGaon marketplace

---

## 🔐 Security

- User data encrypted with AES-256 at rest
- TLS 1.3 for all data in transit
- JWT authentication with OAuth2 support
- Rate limiting on APIs
- OWASP Top 10 compliance
- Regular security audits and penetration testing planned

---

## 📝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Write clean, readable code
- Add comments for complex logic
- Follow Next.js and Python/FastAPI conventions
- Maintain 80%+ test coverage
- Use TypeScript for frontend, type hints for Python backend

---

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture & Design Decisions](./docs/ARCHITECTURE.md)
- [RAG Pipeline & AI Assistant](./docs/AI_ASSISTANT.md)
- [Geo-Proximity Algorithm](./docs/GEO_ALGORITHM.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contribution Guidelines](./CONTRIBUTING.md)

---

## 🌍 Supported Languages

**All 22 Scheduled Indian Languages:**
Hindi, English, Bengali, Gujarati, Kannada, Kashmiri, Konkani, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Sindhi, Tamil, Telugu, Urdu, Assamese, Maithili, Santali, Dogri

**Plus Major Regional Dialects:**
Bhojpuri, Haryanvi, Awadhi, Magahi, Maggahi, and more

---

## 📞 Support & Contact

- **Issues & Bugs:** [GitHub Issues](https://github.com/yourusername/kisaan-saathi/issues)
- **Questions:** [GitHub Discussions](https://github.com/yourusername/kisaan-saathi/discussions)
- **Email:** support@kisaksaathi.org

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Bhashini (NPCI)** — Free multilingual translation & ASR APIs
- **Government of India** — eNAM, PM-KISAN, PMFBY, IMD open data
- **ICAR** — Crop cultivation manuals and advisory content
- **Kisan Call Centre** — Real farmer queries and regional language corpus

---

## 🎓 Academic Context

This project was developed as part of the **2025–2026 academic year** with the goal of creating a production-ready platform serving real farmers and consumers across India.

**Potential for Deployment Beyond Academia:**
The modular, open-source architecture enables adoption by NGOs, state governments, and agritech startups as a public good.

---

## 💡 Vision

**To bridge the 140-million-farmer gap by making agricultural knowledge, government support, and fair market access universally accessible in the languages farmers actually speak — and to fundamentally reshape the farm-to-consumer supply chain for the benefit of both producers and consumers.**

---

**Last Updated:** April 2026  
**Status:** 🔄 Active Development — Phase 2 in progress
