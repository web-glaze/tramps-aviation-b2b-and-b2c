# 🚀 Travel Platform — Complete Feature Map
## What's In Each Role (Admin / Agent / Customer)

---

## 👑 ADMIN — Full Platform Control

### ✅ Already Existed
- Dashboard stats
- Agent list, suspend, activate, delete
- KYC approve/reject
- Wallet topup, adjust, freeze, unfreeze
- Set credit limit
- Pricing rules management
- Commission rules
- Settlement generate/approve/mark-paid
- Customer list
- Revenue report
- Commission profile CRUD, assign to agent

### 🆕 NOW ADDED
| Feature | API Endpoint |
|---|---|
| **Booking trend charts** | `GET /admin/analytics/booking-trends?days=30` |
| **Top routes analytics** | `GET /admin/analytics/top-routes?limit=10` |
| **Agent leaderboard** | `GET /admin/analytics/agent-leaderboard?period=month` |
| **Revenue breakdown** | `GET /admin/analytics/revenue-breakdown?from=&to=` |
| **Credit limit requests queue** | `GET /admin/credit-requests` |
| **Approve/reject credit requests** | `POST /admin/credit-requests/:agentId/approve` |
| **Export bookings (JSON/CSV)** | `GET /admin/export/bookings?from=&to=&format=csv` |
| **Export agents list** | `GET /admin/export/agents` |
| **Promo codes CRUD** | `GET/POST/PUT /promo` |
| **Promo usage stats** | `GET /promo/:promoId/stats` |
| **Banners/offers management** | `GET/POST/PUT/DELETE /banners/admin/*` |
| **Banner performance tracking** | `GET /banners/admin/stats` |
| **Review moderation** | `GET/POST /reviews/admin/pending` |
| **Approve/delete reviews** | `POST /reviews/admin/:id/approve` |
| **Audit trail viewer** | `GET /admin/audit?action=&actorId=&fromDate=&toDate=` |
| **Add loyalty bonus points** | `POST /loyalty/admin/bonus` |
| **View any user's loyalty** | `GET /loyalty/admin/:userId` |
| **Sub-agents across platform** | `GET /sub-agents/admin/all` |

---

## 🏢 AGENT (B2B) — Travel Agency Features

### ✅ Already Existed
- Register, login
- Profile management
- KYC document upload, status check
- Dashboard stats
- Wallet balance check
- Wallet transaction history
- Search + book flights (wallet payment)
- Search + book hotels (wallet payment)
- Insurance with Bajaj Allianz
- View my bookings
- Cancel booking (auto wallet refund)
- Commission profile view
- Reports: sales summary, wallet statement

### 🆕 NOW ADDED
| Feature | API Endpoint |
|---|---|
| **Markup rules per route/airline** | `GET /agents/markup-rules` |
| **Create/update markup rule** | `POST /agents/markup-rules` |
| **Preview markup calculator** | `POST /agents/markup-rules/calculate` |
| **Delete markup rule** | `DELETE /agents/markup-rules/:index` |
| **Request credit limit increase** | `POST /agents/credit-limit/request` |
| **Generate invoice summary** | `GET /agents/invoice?from=&to=` |
| **Create sub-agents** | `POST /sub-agents` |
| **Manage sub-agents** | `GET/PUT/PATCH/DELETE /sub-agents` |
| **Sub-agent permissions control** | (in create/update body) |
| **Set sub-agent daily booking limit** | (in create/update body) |
| **Reset sub-agent password** | `POST /sub-agents/:id/reset-password` |
| **Sub-agent stats** | `GET /sub-agents/stats` |
| **Fare price drop alerts** | `POST /alerts` |
| **My fare alerts** | `GET /alerts/my` |
| **Loyalty points** | `GET /loyalty/my` |
| **Earn points on bookings** | (automatic) |
| **Redeem points** | `POST /loyalty/redeem` |
| **Points history** | `GET /loyalty/my/history` |

---

## 👤 CUSTOMER (B2C) — End Traveller Features

### ✅ Already Existed
- Register, login
- Profile management
- Search flights/hotels
- Book flight (Razorpay payment)
- Book hotel (Razorpay payment)
- Add insurance
- View my bookings
- Cancel booking
- Saved passengers
- Forgot/reset password

### 🆕 NOW ADDED
| Feature | API Endpoint |
|---|---|
| **Travel documents vault** | `GET/POST/DELETE /customers/documents` |
| **Save passport, visa, national ID** | `POST /customers/documents` |
| **Wishlist (save flights/hotels)** | `GET /customers/wishlist` |
| **Toggle wishlist** | `POST /customers/wishlist/toggle` |
| **Referral code** | `GET /customers/referral` |
| **Fare price drop alerts** | `POST /alerts` |
| **My alerts** | `GET /alerts/my` |
| **Delete alert** | `DELETE /alerts/:alertId` |
| **Loyalty points + tier** | `GET /loyalty/my` |
| **Points history** | `GET /loyalty/my/history` |
| **Redeem points on booking** | `POST /loyalty/redeem` |
| **Submit flight/hotel review** | `POST /reviews` |
| **My reviews** | `GET /reviews/my` |
| **Vote review helpful** | `POST /reviews/:id/helpful` |
| **Apply promo codes** | (in booking flow via `POST /promo/validate`)  |
| **Check promo before applying** | `GET /promo/check?code=SAVE500&amount=5000` |

---

## 📊 New Modules Added

### 🎟️ Promo Code Engine (`/promo`)
- Flat ₹ or % discounts
- Min order value, max discount cap
- Per-user usage limits
- First-time only restriction
- Agent-specific promos
- Auto-expire after validTill date
- Usage tracking with audit log

### 🏆 Loyalty Points System (`/loyalty`)
- Earn on flights (10 pts/₹100), hotels (8 pts), insurance (5 pts)
- 4 tiers: Bronze → Silver → Gold → Platinum
- Tier multipliers: 1x → 1.25x → 1.5x → 2x
- 1 point = ₹0.25 redemption value
- Points expire in 1 year
- Admin can add bonus points
- Full transaction history

### ⭐ Reviews & Ratings (`/reviews`)
- Rate flights and hotels (1-5 stars)
- Multiple sub-ratings (cleanliness, service, value, location, punctuality)
- Photo uploads
- Admin moderation (approve before publishing)
- Helpful vote system
- Admin response to reviews
- Rating statistics and distribution

### 🔔 Fare Alerts (`/alerts`)
- Set price drop target for any route+date
- Auto-detect when price falls below target
- Email + SMS notifications
- Duplicate alert prevention (updates existing)
- Auto-expire after travel date

### 📋 Audit Trail (`/admin/audit`)
- Logs every important action to MongoDB
- Filter by action type, actor, date range
- View full history for any admin/agent

### 🎨 Banners & Offers (`/banners`)
- Multiple positions: home carousel, flights page, hotels page, booking add-ons
- Target B2B or B2C separately
- Impression and click tracking
- Schedule active/inactive dates
- Sort order control

### 👥 Sub-Agents (`/sub-agents`)
- Master agent creates team members
- Per-permission control (book flights/hotels/insurance, view reports)
- Daily booking limit per sub-agent
- Max markup limit
- Password reset by master agent

---

## 🔧 All Services Run Locally (No 3rd Party Keys Needed)
- TBO Flights → Mock data ✓
- TBO Hotels → Mock data ✓
- Bajaj Allianz Insurance → Mock policies ✓
- AWS S3 → Local ./uploads/ folder ✓
- SMS → Console log ✓
- Email → Console log ✓
- Razorpay → Use test keys ✓
