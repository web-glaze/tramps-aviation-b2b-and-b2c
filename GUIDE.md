# TravelPro — Complete Developer Guide

## 📋 Table of Contents
1. [Project Overview](#overview)
2. [Quick Start](#quick-start)
3. [Development Credentials](#dev-credentials)
4. [All Pages Reference](#pages)
5. [Mock Mode (No Backend Needed)](#mock-mode)
6. [Color Themes & Dark Mode](#themes)
7. [Settings FAB Usage](#settings)
8. [API Integration](#api)
9. [Known Issues Fixed](#fixes)
10. [Production Deployment](#production)

---

## 1. Project Overview {#overview}

**TravelPro** is a Next.js 14 frontend for a B2B + B2C travel platform.

- **B2C**: Customers search and book flights, pay via Razorpay
- **B2B**: Travel agents book flights with wallet deduction + earn commissions
- **Admin**: Full management panel for agents, KYC, wallets, reports

**Tech Stack**: Next.js 14 · TypeScript · Tailwind CSS · Zustand · Sonner (toasts) · Axios

---

## 2. Quick Start {#quick-start}

```bash
# 1. Unzip and enter project
cd travel-frontend

# 2. Install dependencies
npm install

# 3. Start development (mock mode — no backend needed)
npm run dev

# App runs at: http://localhost:3000
```

**With real backend:**
```bash
# Make sure backend is running at localhost:8080
# Edit .env.development:
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=false

npm run dev
```

---

## 3. Development Credentials {#dev-credentials}

### Mock Mode (NEXT_PUBLIC_USE_MOCK=true)

All these work instantly — no backend needed:

| Role     | Login Field        | Value                  | Password      |
|----------|--------------------|------------------------|---------------|
| Agent    | Agent ID           | `AG12345678`           | any password  |
| Customer | Email              | `user@demo.com`        | any password  |
| Admin    | Email              | `admin@demo.com`       | any password  |

> **OTP (Forgot Password)**: In dev mode, OTP is always **`123456`**
> The OTP also appears in the success toast message on screen

### KYC Test Data
When submitting KYC in mock mode, use:
- PAN: `AAPFU0939F` (10 chars)
- Aadhaar: `123456789012` (12 digits)
- IFSC: `SBIN0001234` (11 chars)

### Real Backend (NEXT_PUBLIC_USE_MOCK=false)
- Default admin: `admin@travelplatform.com` / `Admin@123456`
- (Created automatically on first backend startup)

---

## 4. All Pages Reference {#pages}

### Public Pages (No Login Required)
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with flight search, hero, features |
| Login | `/auth/login` | Unified login — Traveler / Agent / Admin tabs |
| Customer Register | `/auth/register` | New customer signup |
| Agent Register | `/auth/agent-register` | 3-step agent registration wizard |
| Forgot Password | `/auth/forgot-password` | OTP-based password reset |

### B2B Agent Pages (Login Required — role: agent)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/b2b/dashboard` | Stats, recent bookings, wallet overview |
| Book Flights | `/b2b/flights` | Search & book flights (TBO API / mock) |
| My Bookings | `/b2b/bookings` | All bookings list with filters |
| Booking Detail | `/b2b/bookings/[id]` | Full booking info, PNR, passengers |
| Wallet | `/b2b/wallet` | Balance, transactions, statement |
| Commission | `/b2b/commission` | Commission report, earned amounts |
| KYC | `/b2b/kyc` | Submit PAN, Aadhaar, bank details |

### Admin Pages (Login Required — role: admin)
| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin/dashboard` | Platform stats, KPIs, recent activity |
| Agents | `/admin/agents` | List, search, suspend/activate agents |
| Customers | `/admin/customers` | Customer list and management |
| Bookings | `/admin/bookings` | All bookings across platform |
| KYC Review | `/admin/kyc` | Approve / reject agent KYC |
| Wallet Ops | `/admin/wallet` | Top-up, deduct, freeze agent wallets |
| Commissions | `/admin/commission` | Commission reports, settlements |
| Reports | `/admin/reports` | Revenue, airline performance charts |
| Flights | `/admin/flights` | Pricing rules management |
| Hotels | `/admin/hotels` | Hotel inventory |
| Settings | `/admin/settings` | Appearance, platform config, security |

---

## 5. Mock Mode (No Backend Needed) {#mock-mode}

Set `NEXT_PUBLIC_USE_MOCK=true` in `.env.development` (already default).

**What works in mock mode:**
- ✅ Login / Register (all 3 roles)
- ✅ OTP forgot password (static code `123456`)
- ✅ Agent dashboard with dummy stats
- ✅ Flight search (5 sample flights always returned)
- ✅ Flight booking (returns mock PNR)
- ✅ Wallet balance & transaction history
- ✅ Commission report
- ✅ KYC submission & status
- ✅ Admin dashboard stats
- ✅ Agent list, KYC list
- ✅ All pages render correctly

**Mock login flow:**
1. Go to `/auth/login`
2. Select "Agent" tab
3. Enter Agent ID: `AG12345678`, any password
4. → Redirected to `/b2b/dashboard`

**Mock admin flow:**
1. Go to `/auth/login`
2. Select "Admin" tab
3. Enter email: `admin@demo.com`, any password
4. → Redirected to `/admin/dashboard`

---

## 6. Color Themes & Dark Mode {#themes}

### Settings are persisted in localStorage (`tp-settings`)

Dark mode is applied **before page paint** (no white flash) via an inline script in `<head>`.

**Changing theme:**
- Click the ⚙️ **Settings FAB** (bottom-right corner)
- Or go to `/admin/settings` → Appearance tab

**Available Themes:**
| Key | Name | Color |
|-----|------|-------|
| `blue` | Ocean | #3b82f6 |
| `violet` | Royal | #8b5cf6 |
| `emerald` | Forest | #10b981 |
| `rose` | Rose | #f43f5e |
| `orange` | Sunset | #f97316 |
| `teal` | Teal | #14b8a6 |
| `cyan` | Cyan | #06b6d4 |
| `amber` | Amber | #f59e0b |
| `pink` | Pink | #ec4899 |
| `indigo` | Indigo | #6366f1 |
| `slate` | Slate | #64748b |
| `lime` | Lime | #65a30d |

**Dark Mode Fixed Issues:**
- ✅ No white flash on page load
- ✅ Skeleton loaders use theme colors
- ✅ Toggle switch knob is grey (not white) in dark mode
- ✅ Gradient orbs use opacity variants (not raw `bg-white`)
- ✅ All status badges have dark mode variants

---

## 7. Settings FAB Usage {#settings}

The ⚙️ button (bottom-right) opens a panel with 4 sections:

| Section | Options |
|---------|---------|
| **Appearance** | Light / Dark / System |
| **Color Theme** | 12 colors to choose from |
| **Typography** | 9 font families + 5 font sizes |
| **Layout & Effects** | 7 corner radius options, Compact Mode toggle, Animations toggle |

All settings are saved to `localStorage` and persist across sessions.

---

## 8. API Integration {#api}

### Environment Variables

```env
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=true       # false = real backend

# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_USE_MOCK=false
```

### Backend Expected Endpoints

```
POST /api/auth/agent/register
POST /api/auth/agent/login
POST /api/auth/customer/register
POST /api/auth/customer/login
POST /api/auth/admin/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me

POST /api/search/flights
POST /api/search/flights/revalidate
POST /api/search/insurance/plans

GET  /api/kyc/my
POST /api/kyc/submit

GET  /api/wallet
GET  /api/wallet/transactions

POST /api/bookings/agent/flight
POST /api/bookings/customer/flight/initiate
GET  /api/bookings/my
GET  /api/bookings/:id
PATCH /api/bookings/:id/cancel

GET  /api/admin/dashboard
GET  /api/admin/agents
GET  /api/admin/kyc
PATCH /api/admin/kyc/:id/approve
PATCH /api/admin/kyc/:id/reject
POST /api/admin/wallet/topup
```

### Token Storage
JWT token is stored in `localStorage` as `auth_token` and attached to every API request automatically via Axios interceptor.

---

## 9. Known Issues Fixed {#fixes}

| Issue | Fix Applied |
|-------|-------------|
| Dark mode shows white background on load | Added inline `<script>` in `<head>` to set dark class before paint |
| White gradient orbs visible in dark mode | Changed `bg-white` → `bg-primary-foreground/10` |
| Toggle switch knob white in dark mode | Added CSS variable `--toggle-knob` that changes per theme |
| Skeleton loader looks wrong in dark | Uses `hsl(var(--muted))` and `hsl(var(--accent))` |
| Admin settings page crashes | Fixed wrong import from `@/lib/store/settings` → `@/lib/store` |
| Zip had brace-named folders | Clean copy — no brace expansion in folder names |
| Mock mode not working | `NEXT_PUBLIC_USE_MOCK=true` set by default in `.env.development` |

---

## 10. Production Deployment {#production}

```bash
# Build
npm run build

# Start
npm run start
```

**Vercel (recommended):**
1. Push to GitHub
2. Import in Vercel
3. Set env vars:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_USE_MOCK` = `false`

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## File Structure

```
travel-frontend/
├── app/
│   ├── page.tsx                 # Home / Landing
│   ├── layout.tsx               # Root layout + theme init
│   ├── globals.css              # All CSS variables & utilities
│   ├── auth/
│   │   ├── login/               # Unified login (3 roles)
│   │   ├── register/            # Customer register
│   │   ├── agent-register/      # Agent 3-step wizard
│   │   └── forgot-password/     # OTP reset flow
│   ├── b2b/
│   │   ├── layout.tsx           # Agent layout (sidebar + header)
│   │   ├── dashboard/           # Agent dashboard
│   │   ├── flights/             # Search & book
│   │   ├── bookings/            # Booking list + detail
│   │   ├── wallet/              # Wallet + transactions
│   │   ├── commission/          # Commission report
│   │   └── kyc/                 # KYC submission
│   └── admin/
│       ├── layout.tsx           # Admin layout
│       ├── dashboard/           # Admin stats
│       ├── agents/              # Agent management
│       ├── customers/           # Customer list
│       ├── bookings/            # All bookings
│       ├── kyc/                 # KYC review
│       ├── wallet/              # Wallet operations
│       ├── commission/          # Commission management
│       ├── reports/             # Revenue reports
│       └── settings/            # Platform settings
├── components/
│   ├── layout/
│   │   ├── AdminSidebar.tsx     # Admin navigation
│   │   ├── AgentSidebar.tsx     # Agent navigation
│   │   └── DashboardHeader.tsx  # Top header bar
│   ├── settings/
│   │   └── SettingsFab.tsx      # ⚙️ Bottom-right settings panel
│   ├── shared/
│   │   ├── AuthGuard.tsx        # Route protection
│   │   ├── DataTable.tsx        # Reusable table
│   │   ├── StatCard.tsx         # Metric card
│   │   └── StatusBadge.tsx      # Colored status pill
│   └── ui/                      # Base UI components
├── lib/
│   ├── api/
│   │   ├── client.ts            # Axios instance
│   │   ├── services.ts          # All API calls + mock branching
│   │   └── mock.ts              # Mock data & responses
│   └── store/
│       └── index.ts             # Zustand stores (auth + settings)
└── GUIDE.md                     # This file
```

---

*Built with ❤️ for TravelPro India — Last updated: March 2026*
