# ✈️ Travel Platform — Complete Developer Documentation
*MakeMyTrip / Booking.com style B2B+B2C travel platform*

---

## 📁 Project Structure

```
project/
├── backend/          NestJS API (Node.js + MongoDB)
└── frontend/         Next.js 14 App Router
```

---

## 🚀 Quick Start — Local Development (No 3rd party keys needed)

### 1. Prerequisites
```bash
# Install these first:
# - Node.js 18+
# - MongoDB Community (or Docker)
# - Redis (or Docker)

# Docker quick start (easiest):
docker run -d -p 27017:27017 --name mongo mongo:7
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. Backend Setup
```bash
cd backend
cp .env.development .env        # Already configured for local dev
yarn install
yarn start:dev                  # Starts on http://localhost:3000
# Swagger UI: http://localhost:3000/api/docs
```

### 3. Frontend Setup
```bash
cd frontend
yarn install
yarn dev                        # Starts on http://localhost:3001
```

---

## 🗄️ Database — MongoDB

All data is automatically saved to MongoDB. Connection: `mongodb://localhost:27017/travel_platform_dev`

### Collections Created Automatically:
| Collection | Description |
|---|---|
| `users` | Admin users |
| `agents` | B2B travel agents |
| `customers` | B2C customers |
| `bookings` | Flight bookings |
| `hotelbookings` | Hotel bookings |
| `insurancepolicies` | Insurance policies |
| `wallets` | Agent wallet |
| `wallettransactions` | All wallet credits/debits |
| `payments` | Payment records |
| `refunds` | Refund requests |
| `commissions` | Commission profiles |
| `kycs` | KYC documents |

---

## 👥 Three User Roles

### 1. 🔑 ADMIN
- Full platform control
- Approve/reject agent KYC
- View all bookings, refunds, policies
- Manage commission profiles
- Create admin via seed script

**Create First Admin:**
```bash
# POST /api/auth/seed-admin (runs once, then disables)
# OR directly in MongoDB:
# db.users.insertOne({ email:"admin@travel.com", password: "<bcrypt>", role:"admin" })
```

### 2. 🏢 AGENT (B2B)
- Register → Upload KYC docs → Admin approves → Can book
- Pays via Wallet (pre-funded by admin)
- Earns commission on bookings
- Manages own customers/sub-agents

**Agent Registration Flow:**
```
POST /api/auth/agent/register    ← Create account
POST /api/kyc/submit             ← Upload PAN, Aadhaar, GST
GET  /api/kyc/status             ← Check approval status
[Admin approves in dashboard]
POST /api/wallet/topup           ← Admin funds wallet
POST /api/bookings/init          ← Can now book!
```

### 3. 👤 CUSTOMER (B2C)
- Register → Verify OTP → Book directly
- Pays via Razorpay (UPI, Card, Net Banking)

**Customer Registration Flow:**
```
POST /api/auth/customer/register  ← Create account
POST /api/auth/verify-otp         ← Verify phone OTP
POST /api/flights/search          ← Search flights
POST /api/bookings/init           ← Book
POST /api/payments/razorpay/order ← Pay
POST /api/payments/razorpay/verify← Confirm
```

---

## ✈️ Flight Booking — Complete API Flow

### Search Flights
```bash
POST /api/flights/search
{
  "origin": "DEL",
  "destination": "BOM",
  "departureDate": "2025-04-15",
  "adults": 2,
  "children": 0,
  "cabinClass": "Economy"
}
# Returns: list of flights with resultToken per flight
# MOCK: Returns realistic fake data when TBO keys absent
```

### Book a Flight
```bash
# Step 1: Initialize booking
POST /api/bookings/init
Authorization: Bearer <token>
{
  "resultToken": "from_search_result",
  "tripType": "one_way",
  "passengers": [{
    "firstName": "Rahul",
    "lastName": "Sharma",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "passportNumber": "A1234567"  # international only
  }],
  "contactEmail": "rahul@example.com",
  "contactPhone": "9876543210",
  "addInsurance": true,
  "insurancePlanType": "domestic_basic"
}
# Returns: bookingRef, totalAmount, paymentMethod

# Step 2a: B2B Agent — Pay from wallet
POST /api/bookings/confirm
{ "bookingRef": "TRV-20250315-ABCDEF" }

# Step 2b: B2C Customer — Pay via Razorpay
POST /api/payments/razorpay/order
{ "bookingRef": "TRV-20250315-ABCDEF" }
# → Use Razorpay SDK on frontend
POST /api/payments/razorpay/verify
{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
```

---

## 🏨 Hotel Booking — API Flow

```bash
# Search
POST /api/hotels/search
{
  "cityCode": "DEL",
  "cityName": "New Delhi",
  "checkIn": "2025-04-15",
  "checkOut": "2025-04-18",
  "rooms": 1,
  "adults": 2
}

# Get Room Rates
GET /api/hotels/:hotelCode/rates?checkIn=...&checkOut=...&rooms=1&adults=2

# Pre-book (lock rate)
POST /api/hotels/pre-book
{ "rateToken": "from_rates_response" }

# Confirm
POST /api/hotels/confirm
{ "preBookToken": "...", "guestDetails": {...} }
```

---

## 🛡️ Insurance — Bajaj Allianz (Mock locally)

```bash
# Get plans during booking (add-ons screen)
GET /api/insurance/plans?origin=DEL&destination=BOM&departureDate=2025-04-15&passengerCount=2
# Returns 4 plans: domestic_basic, domestic_standard, international_standard, international_premium

# Issue policy after payment
POST /api/insurance/issue
Authorization: Bearer <token>
{
  "bookingRef": "TRV-20250315-ABCDEF",
  "planType": "domestic_basic",
  "passengers": [{ "firstName": "Rahul", "lastName": "Sharma", "dateOfBirth": "1990-05-15", "gender": "M" }],
  "contactEmail": "rahul@example.com",
  "contactPhone": "9876543210"
}
# Returns policyRef immediately (Bajaj call happens async)

# Check policy status
GET /api/insurance/:policyRef

# My policies
GET /api/insurance/my

# Cancel
POST /api/insurance/:policyRef/cancel
{ "reason": "Flight cancelled" }
```

### Insurance Plans & Pricing:
| Plan | Type | Price/Person | Coverage |
|---|---|---|---|
| Domestic Basic | Domestic | ₹149 | Trip cancel ₹25K + delay ₹5K |
| Domestic Standard | Domestic | ₹399 | Cancel + baggage + accident |
| International Standard | International | ₹499 | Medical ₹5L + cancel + baggage |
| International Premium | International | ₹999 | Medical ₹25L + full coverage |

**Platform earns 17% commission on each policy sold.**

---

## 💰 Wallet System (B2B Agents)

```bash
# Admin: Top up agent wallet
POST /api/wallet/topup
{ "agentId": "...", "amount": 50000, "remarks": "Initial credit" }

# Agent: Check balance
GET /api/wallet/balance

# Agent: Transaction history
GET /api/wallet/transactions?page=1&limit=20

# Wallet deducted automatically on booking confirmation
# Wallet credited on refund/cancellation
```

---

## 📁 File Upload (Local mode — no AWS needed)

```bash
# Upload image
POST /api/upload/image
Content-Type: multipart/form-data
file: <image_file>

# Upload KYC document
POST /api/upload/image  (same endpoint, returns url)

# Storage modes (set in .env):
# STORAGE_PROVIDER=local  → saves to ./uploads/ folder (default for dev)
# STORAGE_PROVIDER=minio  → local MinIO S3-compatible
# STORAGE_PROVIDER=aws    → real AWS S3
```

---

## 🔧 Adding Real 3rd Party Keys (Production)

### TBO Flights
```env
TBO_API_URL=https://api.tboconsumer.com
TBO_USERNAME=your_username
TBO_PASSWORD=your_password
TBO_MEMBER_ID=your_member_id
```

### Bajaj Allianz Insurance
```env
BAJAJ_ALLIANZ_API_URL=https://api.bajajallianz.com/partner
BAJAJ_ALLIANZ_PARTNER_ID=your_partner_id
BAJAJ_ALLIANZ_API_KEY=your_api_key
BAJAJ_ALLIANZ_SECRET_KEY=your_secret
```

### AWS S3
```env
STORAGE_PROVIDER=aws
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
```

### Razorpay (use test keys for dev)
```env
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=yyyy
```

### SMS (Twilio or MSG91)
```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890
```

---

## 🔴 Mock Mode — What Works Without Keys

| Feature | Mock Behavior |
|---|---|
| **TBO Flights** | Returns 5-10 realistic mock flights |
| **TBO Hotels** | Returns 3-5 mock hotels with rates |
| **Insurance** | Returns 4 plans, auto-issues MOCK policy number |
| **SMS** | Logs OTP to console (check server logs) |
| **Email** | Logs to console OR use Ethereal test account |
| **File Upload** | Saves to `./uploads/` folder |
| **Razorpay** | Use test mode keys (works fully with test cards) |
| **MongoDB** | Fully functional — all data saved |
| **Redis** | Optional — caching disabled if not running |

---

## 📊 Admin Dashboard APIs

```bash
# Stats overview
GET /api/admin/dashboard/stats

# Manage agents
GET  /api/admin/agents?status=pending_kyc
PUT  /api/admin/agents/:id/kyc/approve
PUT  /api/admin/agents/:id/kyc/reject
PUT  /api/admin/agents/:id/suspend

# All bookings
GET /api/admin/bookings?status=CONFIRMED&from=2025-01-01

# Refunds
GET    /api/refunds?status=PENDING
PATCH  /api/refunds/:refundId/process
PATCH  /api/refunds/:refundId/reject

# Commission profiles
GET  /api/admin/commission-profiles
POST /api/admin/commission-profiles
POST /api/admin/commission-profiles/:id/assign/:agentId
```

---

## 🛠️ Common Issues & Solutions

| Error | Fix |
|---|---|
| MongoDB connection failed | Run `docker run -d -p 27017:27017 mongo:7` |
| Redis error in logs | OK to ignore locally — caching just disabled |
| OTP not received | Check server console logs for OTP |
| Insurance MOCK mode warning | Expected — real Bajaj keys not set |
| JWT expires fast | Change `JWT_EXPIRES_IN=7d` in .env |
| KYC doc upload fails | Ensure `./uploads/` folder has write permission |

---

## 📞 API Base URL

- **Local**: `http://localhost:3000/api`
- **Swagger Docs**: `http://localhost:3000/api/docs`

---

*Built with NestJS + MongoDB + Next.js 14. All 3rd party integrations run in mock mode locally.*
