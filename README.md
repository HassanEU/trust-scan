# TrustScan

AI-powered online shopping product authenticity checker. Paste a product URL from Amazon, Flipkart, eBay, or Shopify and get a trust score with seller analysis, review fraud detection, and purchase recommendations.

## Architecture

```
trustscan/
├── frontend/          # React + Tailwind + Vite
└── backend/           # Node.js + Express + MongoDB
    ├── controllers/
    ├── routes/
    ├── models/
    ├── services/
    ├── marketplace-connectors/   # Pluggable marketplace adapters
    ├── ai-engine/                # Review analysis & risk explanation
    ├── middleware/
    └── utils/
```

### Marketplace Connectors

Each connector implements a common interface (`getProductDetails`, `getSellerDetails`, `getReviews`) and returns normalized data. Add new marketplaces by extending `BaseConnector` and registering in `marketplace-connectors/index.js`.

### AI Engine

Modular AI layer ready for external API integration:
- `detectFakeReviews()` — repeated text, similarity, unnatural language, review spikes
- `analyzeReviewSentiment()` — positive/negative/neutral classification
- `generateRiskExplanation()` — human-readable risk summary

### Trust Score Algorithm

| Signal | Adjustment |
|--------|-----------|
| Base score | 50 |
| Seller rating > 4.5 | +20 |
| Established seller (365+ days) | +15 |
| Verified seller | +15 |
| Positive verified reviews (70%+) | +10 |
| Unusually low price (60%+ discount) | -20 |
| New seller (< 90 days) | -15 |
| Fake review patterns | -20 |
| Suspicious seller | -25 |

| Score Range | Risk Level |
|-------------|-----------|
| 80–100 | Highly Trusted |
| 50–79 | Moderate Risk |
| 0–49 | Suspicious |

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment setup

**Backend** — copy and edit `.env`:

```bash
cd backend
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trustscan
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Frontend** — optional (Vite proxy handles `/api` in dev):

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

## Running Locally

Start MongoDB, then run both servers:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## API Reference

### Authentication

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{ name, email, password }` | No |
| POST | `/api/auth/login` | `{ email, password }` | No |
| GET | `/api/auth/profile` | — | Bearer JWT |

### Product Analysis

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/analyze` | `{ productUrl }` | Optional |

**Response:**

```json
{
  "success": true,
  "data": {
    "productName": "Sony Wireless Headphones",
    "brand": "Sony",
    "sellerName": "Sony Marketplace Store",
    "sellerRating": 4.7,
    "marketplace": "amazon",
    "trustScore": 85,
    "riskLevel": "Highly Trusted",
    "reasons": ["✓ Seller has excellent rating (4.7/5)"],
    "recommendation": "Safe to purchase..."
  }
}
```

### User History (requires auth)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/user/history` | Bearer JWT |
| GET | `/api/user/history/:id` | Bearer JWT |
| DELETE | `/api/user/history/:id` | Bearer JWT |

## Testing

### Backend unit tests

```bash
cd backend
npm test
```

### Manual API testing

```bash
# Health check
curl http://localhost:5000/api/health

# Analyze product (no auth required)
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"productUrl":"https://www.amazon.com/dp/B08N5WRWNW"}'

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Analyze with auth (saves to history)
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"productUrl":"https://www.flipkart.com/sample/p/itm123"}'

# Get history
curl http://localhost:5000/api/user/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend testing

1. Open http://localhost:5173
2. Paste a sample Amazon/Flipkart/eBay/Shopify URL
3. Click **Analyze Product** — verify trust score, seller info, and reasons
4. Register an account — re-analyze a product
5. Visit **History** — confirm the check was saved
6. Test login/logout flow

## Future Extensions

The architecture supports:
- **Mobile app** — consume the same REST API
- **Browser extension** — inject analyze calls from product pages
- **New marketplaces** — add connectors in `marketplace-connectors/`
- **Brand verification APIs** — plug into `ai-engine/` or `services/`
- **Blockchain verification** — new service module alongside AI engine
- **External AI APIs** — replace heuristic AI functions with OpenAI/Claude calls in `ai-engine/`

## Production Notes

- Set strong `JWT_SECRET` and use HTTPS
- Use MongoDB Atlas with IP allowlisting
- Marketplace connectors currently use simulated data — integrate real marketplace APIs for production scraping
- Add rate limiting and request caching before public deployment
