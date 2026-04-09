# Quick Start — Tramps Aviation

Get up and running in 3 minutes.

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Open browser
# → http://localhost:3000
```

## Key URLs

| Section | URL |
|---------|-----|
| Home | http://localhost:3000 |
| Agent Login | http://localhost:3000/b2b/login |
| Customer Login | http://localhost:3000/b2c/login |
| Agent Dashboard | http://localhost:3000/b2b/dashboard |

## Project Structure

```
app/                    # Pages & layouts
├── page.tsx           # Home
├── b2b/               # Agent portal
└── b2c/               # Customer portal

components/            # React components
├── layout/            # Navigation, headers, footers
├── shared/            # Reusable components
└── ui/                # shadcn/ui components

lib/                    # Business logic
├── api/               # API services
├── store/             # Zustand stores
└── hooks/             # Custom React hooks

config/               # App configuration
types/                # TypeScript types
```

## Common Tasks

### Change Theme Color
1. Click ⚙️ Settings (bottom-right)
2. Select "Color Theme"
3. Pick from 12 colors

### Update Logo
1. Replace `/public/logo.png`
2. No code changes needed

### Add New Page
1. Create `app/section/page-name/page.tsx`
2. Use existing components from `components/`
3. Import routes from `config/app.ts`

### Modify Navigation
Edit `config/app.ts`:
- `B2B_SIDEBAR_NAV` — Agent sidebar menu
- `ROUTES` — All route constants

## Available Scripts

```bash
pnpm dev           # Development server
pnpm build         # Production build
pnpm start         # Production server
pnpm lint          # ESLint check
pnpm type-check    # TypeScript check
```

## Documentation

- **README.md** — Full project overview
- **GUIDE.md** — Development patterns & architecture
- **TRAVEL_PLATFORM_DOCS.md** — Features & pages reference

## State Management

```typescript
// Get user info
const { isAuthenticated, user } = useAuthStore()

// Change theme
const { setColorTheme } = useSettingsStore()

// Get dashboard stats
const { stats } = useStatsStore()

// Add notification
const { addNotification } = useNotificationsStore()
```

## Components Library

All shadcn/ui components available:
- Button, Card, Dialog, Input, Select
- Table, Tabs, Toast, Dropdown, etc.

Import: `import { Button } from '@/components/ui/button'`

## Styling

Use Tailwind classes:
```tsx
// Responsive
<div className="md:flex lg:grid-cols-3">

// Dark mode
<div className="dark:bg-slate-800">

// Theme colors
<div className="bg-primary text-primary-foreground">
```

## Form Validation

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})
```

## Troubleshooting

**Blank page?**
- Check browser console for errors
- Clear cache: Ctrl+Shift+Delete
- Verify `pnpm dev` is running

**Theme not saving?**
- Check localStorage: `localStorage.getItem('tp-settings')`
- Clear localStorage and reload

**API errors?**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- See Network tab in DevTools

## Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
```

## Need Help?

- Read **README.md** for full documentation
- Check **GUIDE.md** for development patterns
- See **TRAVEL_PLATFORM_DOCS.md** for features
- Look at existing components for examples

---

Happy coding! 🚀
