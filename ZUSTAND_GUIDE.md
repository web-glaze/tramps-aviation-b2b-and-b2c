# Zustand vs Redux — Complete Guide for Tramps Aviation

## Why Zustand? (Not Redux)

| Feature | Zustand ✅ | Redux ❌ |
|---|---|---|
| Lines of code | ~20 lines per store | ~100+ lines (actions + reducers + selectors) |
| Boilerplate | Near zero | Actions, action types, reducers, selectors — all separate |
| Learning curve | 30 minutes | Days to weeks |
| Bundle size | ~1KB | ~20KB (+ Redux Toolkit) |
| DevTools | ✅ Yes | ✅ Yes |
| Async support | Direct (no middleware) | Requires Thunk/Saga |
| React integration | Hooks only, no Provider needed | Needs `<Provider>` wrapping |
| TypeScript | Excellent | Good but verbose |

**Decision: Zustand is best for Tramps Aviation** — small, fast, zero boilerplate.

---

## How Our Stores Work

### File: `lib/store/index.ts`

We have **2 stores** in one file:

```typescript
// ─── STORE 1: useSettingsStore ────────────────────────────────
// Saves to localStorage key: 'tp-settings'
// Used by: every page (theme, font, color)
const { theme, setTheme, colorTheme, setColorTheme } = useSettingsStore()

// ─── STORE 2: useAuthStore ────────────────────────────────────
// Saves to localStorage key: 'tp-auth'
// Used by: login, protected pages, booking flow
const { user, token, role, isAuthenticated, setAuth, clearAuth } = useAuthStore()
```

---

## Complete Store Code Explained

```typescript
// lib/store/index.ts

'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ════════════════════════════════════════
// STORE 1 — SETTINGS (theme, font, color)
// ════════════════════════════════════════
interface SettingsState {
  // State values
  theme: 'light' | 'dark' | 'system'
  colorTheme: 'blue' | 'violet' | 'emerald' // ...etc
  fontFamily: string
  borderRadius: string
  sidebarOpen: boolean

  // Actions (functions to change state)
  setTheme: (t: string) => void
  setColorTheme: (c: string) => void
  setFontFamily: (f: string) => void
  setBorderRadius: (r: string) => void
  toggleSidebar: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(                        // ← auto-saves to localStorage
    (set) => ({
      // Default values
      theme: 'dark',
      colorTheme: 'blue',
      fontFamily: 'jakarta',
      borderRadius: 'lg',
      sidebarOpen: true,

      // Actions — call set() to update state
      setTheme: (theme) => set({ theme }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'tp-settings' }       // ← localStorage key name
  )
)

// ════════════════════════════════════════
// STORE 2 — AUTH (user login state)
// ════════════════════════════════════════
interface AuthState {
  user: any | null
  token: string | null
  role: 'agent' | 'customer' | null
  isAuthenticated: boolean
  _hasHydrated: boolean           // ← SSR fix: is localStorage loaded?

  setAuth: (user: any, token: string) => void
  clearAuth: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, token) => {
        // Also store in localStorage/cookie for middleware
        localStorage.setItem('auth_token', token)
        set({ user, token, role: user?.role, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, token: null, role: null, isAuthenticated: false })
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'tp-auth',
      onRehydrateStorage: () => (state) => {
        // Called when localStorage data is loaded on page refresh
        if (state) state.setHasHydrated(true)
      },
    }
  )
)
```

---

## How Every Page Uses the Stores

### Pattern 1 — Read auth state (most common)
```typescript
// Any page that needs to know if user is logged in
import { useAuthStore } from '@/lib/store'

export default function FlightsPage() {
  const { isAuthenticated, role, user } = useAuthStore()

  if (!isAuthenticated) return <LoginPrompt />
  if (role === 'agent')    return <AgentView />
  return <CustomerView />
}
```

### Pattern 2 — Login (set auth state)
```typescript
// b2c/login/page.tsx and b2b/login/page.tsx
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const { setAuth, isAuthenticated } = useAuthStore()

  const handleLogin = async () => {
    const res = await authApi.loginCustomer({ email, password })
    const { access_token, user } = res.data.data
    setAuth(user, access_token)    // ← saves to store + localStorage
    router.push('/b2c/my-trips')
  }
}
```

### Pattern 3 — Logout (clear auth)
```typescript
// Any logout button
const { clearAuth } = useAuthStore()

const handleLogout = () => {
  clearAuth()                       // ← clears store + localStorage + cookie
  router.push('/')
}
```

### Pattern 4 — Theme/Settings
```typescript
// SettingsFab.tsx — settings panel
import { useSettingsStore } from '@/lib/store'

export function SettingsFab() {
  const { theme, setTheme, colorTheme, setColorTheme } = useSettingsStore()

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  )
}
```

### Pattern 5 — Sidebar toggle (B2B layout)
```typescript
// b2b/layout.tsx
import { useSettingsStore } from '@/lib/store'

export default function B2BLayout() {
  const { sidebarOpen, toggleSidebar } = useSettingsStore()

  return (
    <main className={sidebarOpen ? 'ml-64' : 'ml-16'}>
      {children}
    </main>
  )
}
```

### Pattern 6 — Wait for hydration (SSR/Next.js)
```typescript
// Any page that needs auth on first load
const { _hasHydrated, isAuthenticated } = useAuthStore()

if (!_hasHydrated) return <Spinner />  // wait for localStorage to load
if (!isAuthenticated) return router.push('/login')
```

---

## All Pages — Which Store They Use

| Page/Component | useAuthStore | useSettingsStore |
|---|---|---|
| `app/layout.tsx` | — | ✅ theme, colorTheme, fontSize |
| `app/page.tsx` (homepage) | ✅ user, role, isAuthenticated | — |
| `app/b2c/login/page.tsx` | ✅ setAuth, isAuthenticated | — |
| `app/b2c/register/` | ✅ setAuth | — |
| `app/b2c/flights/page.tsx` | ✅ isAuthenticated, role | — |
| `app/b2c/hotels/page.tsx` | ✅ isAuthenticated, role | — |
| `app/b2c/insurance/page.tsx` | ✅ isAuthenticated | — |
| `app/b2c/my-trips/page.tsx` | ✅ isAuthenticated, user | — |
| `app/b2c/booking/[id]/page.tsx` | ✅ isAuthenticated, user | — |
| `app/b2b/login/page.tsx` | ✅ setAuth, isAuthenticated | — |
| `app/b2b/register/` | ✅ setAuth | — |
| `app/b2b/layout.tsx` | ✅ user, token, role, _hasHydrated | ✅ sidebarOpen |
| `app/b2b/dashboard/page.tsx` | ✅ user, agentId | — |
| `app/b2b/flights/page.tsx` | — (layout guards it) | — |
| `app/b2b/wallet/page.tsx` | — (layout guards it) | — |
| `app/b2b/bookings/page.tsx` | — (layout guards it) | — |
| `components/layout/B2BSidebar.tsx` | ✅ user, clearAuth | ✅ sidebarOpen, toggleSidebar |
| `components/layout/B2CNavbar.tsx` | ✅ isAuthenticated, user, clearAuth | — |
| `components/layout/SettingsProvider.tsx` | — | ✅ ALL settings |
| `components/settings/SettingsFab.tsx` | — | ✅ ALL settings |

---

## Important: `_hasHydrated` — SSR Fix

Next.js renders pages on server first. Server doesn't have `localStorage`.
So on first render, `isAuthenticated` is always `false` (server doesn't know you're logged in).

```typescript
// WRONG — flickers login page then redirects
const { isAuthenticated } = useAuthStore()
if (!isAuthenticated) return <Redirect to="/login" />

// CORRECT — wait for localStorage to load
const { isAuthenticated, _hasHydrated } = useAuthStore()
if (!_hasHydrated) return <Spinner />        // server render
if (!isAuthenticated) return <Redirect />    // now safe to check
```

---

## Add a New Store (Example: Cart/Booking Draft)

```typescript
// lib/store/index.ts — add this

interface BookingDraftState {
  selectedFlight: any | null
  passengers: any[]
  setSelectedFlight: (f: any) => void
  addPassenger: (p: any) => void
  clearDraft: () => void
}

export const useBookingDraftStore = create<BookingDraftState>()((set) => ({
  selectedFlight: null,
  passengers: [],

  setSelectedFlight: (selectedFlight) => set({ selectedFlight }),
  addPassenger: (p) => set((s) => ({ passengers: [...s.passengers, p] })),
  clearDraft: () => set({ selectedFlight: null, passengers: [] }),
  // No persist() — draft clears on page refresh (intentional)
}))
```

Then use it anywhere:
```typescript
const { selectedFlight, setSelectedFlight } = useBookingDraftStore()
```

---

## Zustand vs Redux — Final Verdict for This Project

```
Redux would need:
├── store/
│   ├── index.ts          (configure store)
│   ├── authSlice.ts      (actions + reducers)
│   ├── settingsSlice.ts  (actions + reducers)
│   └── selectors.ts      (memoized selectors)
├── _app.tsx              (Provider wrapper)
└── ~300 lines total

Zustand needs:
└── lib/store/index.ts    (~80 lines total) ✅
```

**Use Zustand. It's already set up perfectly for this project.**
