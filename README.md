# TravelPro — B2B & B2C Frontend

Next.js 14 frontend for the Travel Platform — B2B Agent Portal + B2C Customer Portal.

> **Admin panel is a separate project** — `travel-admin` (React + MUI)

---

## Project Structure

```
app/
├── page.tsx              → Homepage (public landing page)
├── layout.tsx            → Root layout (theme, toasts)
├── b2b/                  → B2B Agent Portal
│   ├── login/            → Agent login
│   ├── register/         → Agency registration
│   ├── kyc/              → KYC document upload
│   ├── dashboard/        → Agent dashboard
│   ├── flights/          → Search & book flights
│   ├── hotels/           → Search & book hotels
│   ├── insurance/        → Travel insurance
│   ├── bookings/         → My bookings
│   ├── wallet/           → Wallet & transactions
│   ├── commission/       → Commission earnings
│   ├── reports/          → Reports & analytics
│   └── profile/          → Agent profile
└── b2c/                  → B2C Customer Portal
    ├── login/            → Customer login
    ├── register/         → Customer registration
    ├── flights/          → Search flights
    ├── hotels/           → Search hotels
    ├── insurance/        → Travel insurance
    ├── my-trips/         → My bookings
    └── booking/[id]/     → Booking detail
```

---

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server (backend must be running)
yarn dev

# Build for production
yarn build
yarn start
```

---

## Environment Variables

```env
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=TravelPro
NEXT_PUBLIC_USE_MOCK=false
```

Set `NEXT_PUBLIC_USE_MOCK=true` to run with mock data (no backend needed).

---

## Auth Flow

| User Type | Login URL | Dashboard |
|-----------|-----------|-----------|
| B2B Agent | `/b2b/login` | `/b2b/dashboard` |
| B2C Customer | `/b2c/login` | `/b2c/flights` |

---

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/b2b/login` | Agent login |
| `/b2b/register` | Agency registration |
| `/b2b/kyc` | KYC document upload |
| `/b2b/dashboard` | Agent dashboard (auth required) |
| `/b2c/login` | Customer login |
| `/b2c/flights` | Flight search (public) |
| `/b2c/my-trips` | My trips (auth required) |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **API**: Axios
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
