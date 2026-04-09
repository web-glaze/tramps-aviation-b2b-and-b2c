# ✈ Tramps Aviation — B2B & B2C Travel Platform

> India's premier travel booking platform for agents and travelers.
> Built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Features](#pages--features)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Theme & Design System](#theme--design-system)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Build & Deployment](#build--deployment)
- [Environment Variables](#environment-variables)

---

## 🗺 Project Overview

Tramps Aviation is a dual-portal travel platform:

| Portal | Audience | Entry |
|--------|----------|-------|
| **B2C** | End travelers / customers | `/b2c/` routes |
| **B2B** | Travel agents / agencies | `/b2b/` routes |

> ⚠️ **Admin is a separate project.** This repo contains only B2B and B2C.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| UI Components | shadcn/ui |
| State Management | Zustand (with persist middleware) |
| Icons | Lucide React |
| Notifications | Sonner |
| HTTP Client | Custom fetch wrapper (`lib/api/client.ts`) |

---

## 📁 Project Structure

```
app_web/
├── app/
│   ├── layout.tsx               # Root layout (no SettingsFab — removed)
│   ├── globals.css              # CSS variables, theme tokens, animations
│   ├── page.tsx                 # Home page (/)
│   ├── b2b/
│   │   ├── layout.tsx           # B2B layout (auth-gated, sidebar + header)
│   │   ├── login/page.tsx
│   │   ├── register/
│   │   ├── kyc/
│   │   ├── dashboard/page.tsx
│   │   ├── flights/page.tsx
│   │   ├── hotels/page.tsx
│   │   ├── insurance/page.tsx
│   │   ├── bookings/
│   │   ├── wallet/page.tsx
│   │   ├── commission/page.tsx
│   │   ├── reports/page.tsx
│   │   └── profile/page.tsx
│   └── b2c/
│       ├── layout.tsx           # B2C layout (CommonHeader + CommonFooter)
│       ├── login/page.tsx
│       ├── register/
│       ├── flights/page.tsx
│       ├── hotels/page.tsx
│       ├── insurance/page.tsx
│       ├── my-trips/page.tsx
│       ├── search/page.tsx
│       └── booking/[bookingId]/
│
├── components/
│   ├── layout/
│   │   ├── CommonHeader.tsx     # ✅ REUSABLE — All pages (home/b2c/b2b)
│   │   ├── CommonFooter.tsx     # ✅ REUSABLE — Same footer everywhere
│   │   ├── B2BSidebar.tsx       # B2B collapsible sidebar
│   │   ├── DashboardHeader.tsx  # B2B top bar (page title + user)
│   │   ├── SettingsProvider.tsx # Applies theme data-attributes to <html>
│   │   └── QueryProvider.tsx    # React Query provider
│   ├── dashboard/               # Dashboard-specific widgets
│   ├── shared/                  # Reusable UI pieces (StatCard, DataTable, etc.)
│   ├── forms/                   # Form components
│   └── ui/                      # shadcn/ui primitives
│
├── lib/
│   ├── api/
│   │   ├── client.ts            # Base fetch wrapper
│   │   ├── services.ts          # API service functions
│   │   └── mock.ts              # Mock data for dev
│   ├── store/
│   │   └── index.ts             # Zustand stores (settings, auth, notifications)
│   ├── hooks/                   # Custom React hooks
│   ├── validators/              # Validation helpers
│   └── utils.ts                 # cn() and utilities
│
├── config/
│   ├── app.ts                   # APP_NAME, ROUTES, sidebar nav
│   └── design-system.ts         # Typography & spacing constants
│
├── types/index.ts               # Shared TypeScript types
├── public/logo.jpg              # Tramps Aviation logo
├── middleware.ts                # Route protection middleware
└── README.md
```

---

## 📄 Pages & Features

### 🏠 Home Page (`/`)

- Transparent navbar (scrolls to solid) via `CommonHeader variant="home"`
- Hero with tabbed search: Flights / Hotels / Insurance
- Popular routes, stats, airlines strip
- Features grid (6 cards)
- B2B agent portal highlight section
- Testimonials (auto-rotate)
- CTA banner
- `CommonFooter`

---

### ✈ B2C Customer Portal

| Page | Path | Purpose |
|------|------|---------|
| Login | `/b2c/login` | Customer sign in |
| Register | `/b2c/register` | New customer signup |
| Flights | `/b2c/flights` | Search & book flights |
| Hotels | `/b2c/hotels` | Search & book hotels |
| Insurance | `/b2c/insurance` | Browse insurance plans |
| My Trips | `/b2c/my-trips` | Booking history |
| Search | `/b2c/search` | Unified search results |
| Booking | `/b2c/booking/[id]` | Booking detail + PNR |

Layout: `CommonHeader variant="b2c"` + `CommonFooter`

---

### 🏢 B2B Agent Portal

| Page | Path | Purpose |
|------|------|---------|
| Login | `/b2b/login` | Agent sign in |
| Register | `/b2b/register` | New agent registration |
| KYC | `/b2b/kyc` | Document upload & verification |
| Dashboard | `/b2b/dashboard` | Stats, charts, activity |
| Flights | `/b2b/flights` | Flight booking (agent rates) |
| Hotels | `/b2b/hotels` | Hotel booking |
| Insurance | `/b2b/insurance` | Insurance products |
| Bookings | `/b2b/bookings` | All bookings + detail |
| Wallet | `/b2b/wallet` | Balance, transactions, top-up |
| Commission | `/b2b/commission` | Commission tracking |
| Reports | `/b2b/reports` | Analytics & export |
| Profile | `/b2b/profile` | Agent profile + agency info |

Layout: `B2BSidebar` + `DashboardHeader` (auth-gated, KYC-checked)

---

## 🧩 Component Architecture

### CommonHeader

Single reusable header for all contexts:

```tsx
<CommonHeader variant="home" />  // Transparent → solid on scroll
<CommonHeader variant="b2c"  />  // Always solid, shows Flights/Hotels/Insurance nav
<CommonHeader variant="b2b"  />  // Always solid, minimal (sidebar handles nav)
```

Features: Logo, theme toggle, user dropdown (auth), guest buttons, mobile menu.

### CommonFooter

One footer for all pages. Sections: brand + contact, platform links, account links, legal, bottom bar.

### B2BSidebar

Collapsible sidebar (64px collapsed, 256px expanded) with tooltips in collapsed mode.
Includes wallet balance widget and logout.

### DashboardHeader

Fixed top bar for B2B dashboard. Shows: page title, theme toggle, notification bell, user avatar.

---

## 🗃 State Management (Zustand)

All stores live in `lib/store/index.ts`.

### useSettingsStore
```ts
theme: 'light' | 'dark' | 'system'    // default: 'light'
colorTheme: 'brand' | 'blue' | ...     // default: 'brand' (logo sky-blue)
fontSize, fontFamily, borderRadius
compactMode, animations, sidebarOpen
```

### useAuthStore
```ts
user: User | null
token: string | null
role: 'agent' | 'customer' | null
isAuthenticated: boolean
_hasHydrated: boolean   // prevents SSR flash
```

### useNotificationStore
In-app notifications list + unread count.

---

## 🎨 Theme & Design System

### Brand Colors (from Logo)
- **Primary (Blue):** `#3AADE0` — HSL `196 75% 56%`
- **Accent (Orange):** `#E8471C` — HSL `14 83% 51%`

### Logo Display
Logo container always has `bg-white` so the TA bird renders correctly on both light and dark themes.

### Default Theme
- Light mode with `data-color="brand"` (logo sky-blue as primary)
- No floating settings icon — theme toggled via header moon/sun button

### CSS Variables Applied via `data-*` Attributes
```html
<html data-color="brand" data-font="jakarta" data-fontsize="md" data-radius="lg">
```

---

## ⚙️ Environment Setup

### Prerequisites
- Node.js >= 18
- Yarn (recommended) or npm

### Install
```bash
yarn install
```

---

## 🚀 Running the Project

### Development
```bash
yarn dev
```
Opens at **http://localhost:3000**

### Production
```bash
yarn build
yarn start
```

### Lint
```bash
yarn lint
```

---

## 📦 Build & Deployment

```bash
# Build
yarn build

# Start production server
yarn start
```

Output goes to `.next/`. Compatible with Vercel, Railway, or any Node.js host.

### Env files
| File | Purpose |
|------|---------|
| `.env.development` | Dev API URLs |
| `.env.production` | Production API URLs |
| `.env.test` | Test config |
| `.env.example` | Copy to `.env.local` |

---

## 🔐 Environment Variables

Copy `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.trampsaviation.in/v1
NEXT_PUBLIC_APP_NAME=Tramps Aviation
NEXT_PUBLIC_APP_ENV=development
JWT_SECRET=your_secret_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_APP_NAME` | ❌ | Display name |
| `NEXT_PUBLIC_APP_ENV` | ❌ | `development` / `production` |
| `JWT_SECRET` | ✅ server | JWT validation in middleware |

---

## 🔄 Feature Flows

### B2C Booking
```
Home → Search → /b2c/flights → Select → Login (if needed) → Booking → PNR
```

### B2B Agent
```
/b2b/register → /b2b/kyc (submit docs) → Admin approves
→ /b2b/dashboard → Book flights/hotels → Commission credited
→ /b2b/wallet → /b2b/commission → /b2b/reports
```

### Auth
```
Login → JWT in localStorage + Zustand
→ middleware.ts guards protected routes
→ B2B layout checks role=agent + KYC approved
→ Redirect to /b2b/kyc if pending
```

---

## 🧹 What Changed (Latest Update)

| Change | Details |
|--------|---------|
| ⬜ White background | Default theme changed to light mode with white background |
| 🎨 Brand colors | Primary color now matches logo blue (#3AADE0) |
| ❌ SettingsFab removed | Floating settings/gear icon removed from all pages |
| 🔁 CommonHeader | Single reusable header replaces B2CNavbar + Navbar + inline home header |
| 🔁 CommonFooter | Single reusable footer replaces inline home footer + old Footer.tsx |
| 🗑 Admin removed | All admin .md docs and references cleaned up |
| 📝 Docs updated | This README replaces all old docs |

---

## 📞 Support

- **Email:** support@trampsaviation.in
- **Phone:** 1800-001-2345 (Toll Free)
