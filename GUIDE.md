# Development Guide — Tramps Aviation

Guide for developing, customizing, and extending the Tramps Aviation B2B & B2C travel platform.

**Quick Links:**
- [README.md](./README.md) — Project overview & setup
- [Architecture Overview](#architecture)
- [State Management](#state-management)
- [Styling & Theming](#styling)
- [API Integration](#api)
- [Adding Features](#adding-features)
- [Best Practices](#best-practices)

**Tech Stack**: Next.js 16 · React 19 · TypeScript · Tailwind CSS · Zustand · Sonner · shadcn/ui

## Architecture Overview {#architecture}

### Directory Structure
```
app/
├── page.tsx                 # Home page
├── layout.tsx              # Root layout
├── b2b/                    # Agent portal
│   ├── dashboard/
│   ├── flights/, hotels/
│   ├── bookings/, wallet/
│   └── kyc/, profile/, etc.
├── b2c/                    # Customer portal
│   ├── flights/, hotels/
│   ├── insurance/
│   ├── bookings/, my-trips/
│   └── login/, register/
└── globals.css             # Theme variables

components/
├── layout/                 # Navbar, Sidebar, Footer, Providers
├── shared/                 # AuthGuard, DataTable, PageHeader, etc.
├── dashboard/              # Dashboard-specific components
├── forms/                  # Form components
├── settings/               # Settings FAB
└── ui/                     # shadcn/ui components

lib/
├── api/                    # Services, HTTP client
├── store/                  # Zustand stores (auth, settings, etc.)
├── hooks/                  # Custom React hooks
├── validators/             # Zod schemas
└── utils.ts               # Helper utilities

config/
├── app.ts                 # Routes, navigation, constants
└── design-system.ts       # Color themes
```

### Layout Hierarchy
```
RootLayout (theme providers)
├── B2BLayout (sidebar + header)
├── B2CLayout (navbar + footer)
└── HomeLayout (navbar + footer)
```

## State Management {#state-management}

Uses **Zustand** with localStorage persistence for global state.

### Core Stores

#### 1. Auth Store (`useAuthStore`)
```typescript
const { isAuthenticated, user, role, setAuth, clearAuth } = useAuthStore()
```
- Manages user login/logout
- Stores JWT token
- Persists to `tp-auth` in localStorage
- Auto-hydrates on app load

#### 2. Settings Store (`useSettingsStore`)
```typescript
const { theme, colorTheme, fontSize, fontFamily, sidebarOpen, setTheme } = useSettingsStore()
```
- Theme (light/dark/system)
- Color theme (12 options)
- Font & typography settings
- Sidebar visibility
- Persists to `tp-settings`

#### 3. Stats Store (`useStatsStore`)
```typescript
const { stats, loading, fetchStats } = useStatsStore()
```
- Dashboard statistics
- Async data fetching with cache
- 5-minute cache invalidation

#### 4. Notifications Store (`useNotificationsStore`)
```typescript
const { notifications, addNotification, markRead } = useNotificationsStore()
```
- Toast-style notifications
- Mark as read, clear all
- Persists notification history

### Usage Pattern
```typescript
import { useAuthStore, useSettingsStore } from '@/lib/store'

export function MyComponent() {
  const { isAuthenticated } = useAuthStore()
  const { theme, setTheme } = useSettingsStore()
  
  // Component code...
}
```

## Styling & Theming {#styling}

### CSS Variables System

All colors and spacing use CSS variables defined in `app/globals.css`:

```css
/* Base colors */
--background: 0 0% 100%;
--foreground: 0 0% 3%;
--card: 0 0% 100%;
--primary: 217 91% 60%;
--muted: 210 40% 96%;
/* ... 30+ more variables */
```

### 12 Color Themes

Built-in themes in `config/design-system.ts`:
- **Cool**: Blue, Violet, Teal, Cyan, Indigo, Slate
- **Warm**: Orange, Amber, Rose, Pink
- **Vibrant**: Emerald, Lime

Change via Settings FAB (⚙️ button, bottom-right) or:
```typescript
const { setColorTheme } = useSettingsStore()
setColorTheme('orange')
```

### Dark Mode

Applied **before page paint** (no flash) via inline script in `<head>`.

**Features:**
- System preference detection
- Manual light/dark toggle
- Theme persists in localStorage
- All components have dark variants

### Tailwind Usage

```tsx
// Responsive
<div className="md:flex lg:grid-cols-3">

// Dark mode
<div className="dark:bg-slate-800 dark:text-white">

// Theme colors
<div className="bg-primary text-primary-foreground">

// Custom theme variables
<div className="bg-[hsl(var(--primary))]">
```

## API Integration {#api}

### Service Calls

API calls are in `lib/api/services.ts`:

```typescript
export const flightsApi = {
  async getFlights(params: FlightParams) {
    const res = await apiClient.get('/flights', { params })
    return res.data
  },
  async bookFlight(flightId: string, passengers: Passenger[]) {
    const res = await apiClient.post('/flights/book', { flightId, passengers })
    return res.data
  }
}
```

### Usage in Components

```typescript
import { flightsApi } from '@/lib/api/services'
import { useQuery } from '@tanstack/react-query'

export function FlightsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: () => flightsApi.getFlights({})
  })
  
  if (isLoading) return <Spinner />
  return <DataTable data={data.flights} />
}
```

### Error Handling

```typescript
try {
  await flightsApi.bookFlight(id, passengers)
  toast.success('Flight booked!')
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Booking failed')
}
```

## Form Validation

Uses **Zod** for type-safe validation:

```typescript
import { z } from 'zod'

const bookingSchema = z.object({
  passengers: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
  })).min(1),
  date: z.date(),
  agreeTerms: z.boolean().refine(v => v === true)
})

const form = useForm({
  resolver: zodResolver(bookingSchema),
  defaultValues: { passengers: [] }
})
```

## Adding Features {#adding-features}

### 1. New Page

```
app/b2b/new-feature/
├── page.tsx
├── layout.tsx (optional)
└── components/ (optional)
```

### 2. New Component

```
components/new-feature/
├── NewComponent.tsx
├── index.ts (optional export)
```

### 3. New API Service

- Add endpoint to `lib/api/services.ts`
- Define TypeScript interface
- Add validation schema if needed

### 4. New Zustand Store

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      // state and actions
    }),
    { name: 'my-store' }
  )
)
```

## Common Patterns {#best-practices}

### Authentication Check
```typescript
const { isAuthenticated, role } = useAuthStore()

if (!isAuthenticated) return <LoginPrompt />
if (role === 'agent') return <AgentDashboard />
if (role === 'customer') return <CustomerDashboard />
```

### Sidebar Toggle
```typescript
const { sidebarOpen, toggleSidebar } = useSettingsStore()

return (
  <div className={sidebarOpen ? 'gap-64' : 'gap-20'}>
    <button onClick={toggleSidebar}>Toggle</button>
  </div>
)
```

### Theme Toggle
```typescript
const { theme, setTheme } = useSettingsStore()

return (
  <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    Toggle Theme
  </button>
)
```

### Protected Route
```typescript
import { AuthGuard } from '@/components/shared/AuthGuard'

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}
```

## Debugging

### Check State in Console
```typescript
// Auth state
localStorage.getItem('tp-auth')

// Settings
localStorage.getItem('tp-settings')

// Current theme color
document.documentElement.getAttribute('data-color')
```

### React DevTools
- Use React DevTools browser extension
- Check props, state, and hooks
- Profile component renders

### Network Tab
- Inspect API requests in DevTools
- Verify request/response headers
- Check for CORS issues

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## File Naming

- **Components**: PascalCase (`MyComponent.tsx`)
- **Pages**: `page.tsx`
- **Types**: `types/index.ts`
- **Utils**: camelCase (`lib/utils.ts`)
- **Hooks**: `use` prefix (`useStats.ts`)

## Import Aliases

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { User } from '@/types'
import { ROUTES } from '@/config/app'
```

---

See [README.md](./README.md) for project overview and setup instructions.
