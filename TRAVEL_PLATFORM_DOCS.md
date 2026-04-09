# Tramps Aviation — Travel Platform Documentation

Complete reference for the B2B & B2C travel booking platform frontend.

## Overview

**Tramps Aviation** is a modern travel booking platform serving:
- **B2B Agents**: Travel agents who book flights, manage inventory, track commissions
- **B2C Customers**: Individual travelers who search and book flights, hotels, insurance

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

---

## Key Features

### For Agents (B2B)
- **Flight Management**: Browse, book, and manage flight inventory
- **Wallet System**: Pre-funded wallet for bookings with transaction history
- **Commission Tracking**: Real-time commission earnings and payouts
- **KYC Verification**: Document submission and approval tracking
- **Booking Management**: View all bookings with filtering and search
- **Reports & Analytics**: Sales performance and revenue insights
- **Profile Management**: Agent details and settings

### For Customers (B2C)
- **Flight Search**: Real-time flight search with filters
- **Hotel Booking**: Search and book accommodations
- **Travel Insurance**: Browse and purchase insurance plans
- **Booking History**: Manage and view all trips
- **User Profile**: Manage personal information and preferences

### Platform Features
- **12 Color Themes**: Fully customizable color scheme
- **Dark/Light Mode**: System preference detection and manual toggle
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: WCAG compliant with keyboard navigation
- **Real-time Notifications**: Toast-based alerts and updates

---

## Authentication

### Agent (B2B) Login
- Email and password authentication
- Session stored in localStorage with JWT token
- Protected routes via AuthGuard component
- Auto-redirect to dashboard on login

### Customer (B2C) Login
- Email/phone-based authentication
- Password reset via OTP
- Session management via auth store
- Personal dashboard access

### Logout
- Clears token from storage
- Removes user session
- Redirects to home page

---

## Pages & Routes

### Public Pages
- `/` — Home/Landing page
- `/b2b/login` — Agent login
- `/b2b/register` — Agent registration
- `/b2c/login` — Customer login
- `/b2c/register` — Customer signup
- `/b2b/forgot-password` — Password recovery

### Agent Portal (B2B)
Protected routes require agent login (`/b2b/*`)

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/b2b/dashboard` | Overview, stats, recent bookings |
| Flights | `/b2b/flights` | Search and book flights |
| Bookings | `/b2b/bookings` | All bookings list |
| Booking Detail | `/b2b/bookings/:id` | Full booking info |
| Wallet | `/b2b/wallet` | Balance and transactions |
| Commission | `/b2b/commission` | Earnings tracking |
| Reports | `/b2b/reports` | Sales analytics |
| KYC | `/b2b/kyc` | Document submission |
| Profile | `/b2b/profile` | Agent settings |

### Customer Portal (B2C)
Protected routes require customer login (`/b2c/*`)

| Page | URL | Purpose |
|------|-----|---------|
| Flights | `/b2c/flights` | Search and book flights |
| Hotels | `/b2c/hotels` | Search and book hotels |
| Insurance | `/b2c/insurance` | Travel insurance options |
| My Trips | `/b2c/my-trips` | Trip history |
| Booking Detail | `/b2c/booking/:id` | Booking confirmation |

---

## State Management

Uses **Zustand** with localStorage persistence for:
- **Auth**: User session, login/logout, tokens
- **Settings**: Theme, colors, fonts, sidebar state
- **Stats**: Dashboard numbers and metrics
- **Notifications**: Toast messages and alerts

See [GUIDE.md](./GUIDE.md#state-management) for store details.

---

## Customization

### Change Brand/Logo
1. Replace `/public/logo.png` with your logo
2. Update `APP_NAME` in `config/app.ts`
3. Update metadata in `app/layout.tsx`

### Change Color Theme
1. Click ⚙️ Settings button (bottom-right)
2. Select "Color Theme"
3. Choose from 12 options
4. Changes persist automatically

### Add Navigation Links
Edit `config/app.ts`:
- `B2B_SIDEBAR_NAV` — Agent sidebar menu
- `B2C_NAVBAR_NAV` — Customer top nav
- `ROUTES` — All route constants

### Modify Colors
Update CSS variables in `app/globals.css`:
```css
:root {
  --primary: 217 91% 60%;  /* Change primary color */
  --secondary: ...
  /* ... more colors */
}
```

---

## Development

### Setup
```bash
pnpm install
pnpm dev
```

### Build
```bash
pnpm build
pnpm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

See [README.md](./README.md) for detailed setup.

---

## File Structure

```
app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout
├── globals.css           # Styles & variables
├── b2b/                  # Agent portal
│   ├── layout.tsx
│   ├── dashboard/
│   ├── flights/
│   ├── bookings/
│   ├── wallet/
│   ├── commission/
│   ├── reports/
│   ├── kyc/
│   ├── profile/
│   ├── login/
│   ├── register/
│   └── forgot-password/
└── b2c/                  # Customer portal
    ├── layout.tsx
    ├── flights/
    ├── hotels/
    ├── insurance/
    ├── my-trips/
    ├── booking/
    ├── login/
    └── register/

components/
├── layout/               # Navigation, headers, footers
├── shared/               # Reusable components
├── dashboard/            # Dashboard-specific
├── forms/                # Form components
├── settings/             # Settings UI
└── ui/                   # shadcn/ui components

lib/
├── api/                  # API services
├── store/                # Zustand stores
├── hooks/                # Custom hooks
├── validators/           # Zod schemas
└── utils.ts             # Utilities

config/
├── app.ts               # Routes and constants
└── design-system.ts     # Themes and colors

types/
└── index.ts             # TypeScript interfaces
```

---

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```

---

## Support & Resources

- **README.md** — Project overview and quick start
- **GUIDE.md** — Development patterns and architecture
- **Code Comments** — Inline documentation
- **Component Files** — JSDoc and prop documentation

For more details, see the individual documentation files or code comments.
