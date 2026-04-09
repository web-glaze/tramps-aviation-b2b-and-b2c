# Tramps Aviation — Web App
## Pure Zustand State Management

### Stores — `lib/store/index.ts`

| Store | localStorage Key | What it stores |
|---|---|---|
| `useSettingsStore` | `tp-settings` | theme, color, font, sidebar |
| `useAuthStore` | `tp-auth` | user, token, role, isAuthenticated |
| `useStatsStore` | none | dashboard stats (auto-refetches) |
| `useUsersStore` | none | admin users list |
| `useNotificationsStore` | `tp-notifications` | in-app notifications |

### How to use in any page

```typescript
import { useAuthStore, useSettingsStore, useStatsStore, useUsersStore, useNotificationsStore } from '@/lib/store'

// ── AUTH ──────────────────────────────────────────────
const { user, isAuthenticated, role, setAuth, clearAuth, _hasHydrated } = useAuthStore()

// Login:
setAuth(user, token)   // saves to store + localStorage + cookie

// Logout:
clearAuth()            // clears store + localStorage + cookie

// SSR check (ALWAYS do this before redirecting):
if (!_hasHydrated) return <Spinner />
if (!isAuthenticated) router.push('/login')

// ── SETTINGS ──────────────────────────────────────────
const { theme, setTheme, colorTheme, setColorTheme, sidebarOpen, toggleSidebar } = useSettingsStore()

// ── STATS (dashboard) ─────────────────────────────────
const { stats, loading, fetchStats } = useStatsStore()
useEffect(() => { fetchStats() }, [])

// ── USERS (admin) ─────────────────────────────────────
const { users, meta, loading, fetchUsers, deleteUser, setPage, setSearch } = useUsersStore()
useEffect(() => { fetchUsers() }, [])

// ── NOTIFICATIONS ─────────────────────────────────────
const { notifications, unreadCount, addNotification, markAllRead } = useNotificationsStore()
addNotification({ title: 'Booking confirmed!', message: 'PNR: ABC123', type: 'success' })
```

### Pages — Which stores they use

| Page | Stores used |
|---|---|
| `app/page.tsx` | `useAuthStore` (user, role, isAuthenticated) |
| `app/b2c/login/page.tsx` | `useAuthStore` (setAuth) |
| `app/b2c/register/` | `useAuthStore` (setAuth) |
| `app/b2c/flights/page.tsx` | `useAuthStore` (isAuthenticated, role) |
| `app/b2c/hotels/page.tsx` | `useAuthStore` (isAuthenticated, role) |
| `app/b2c/insurance/page.tsx` | `useAuthStore` (isAuthenticated) |
| `app/b2c/my-trips/page.tsx` | `useAuthStore` (isAuthenticated, user) |
| `app/b2b/layout.tsx` | `useAuthStore` + `useSettingsStore` (sidebarOpen) |
| `app/b2b/dashboard/page.tsx` | `useAuthStore` (user) |
| `components/layout/B2BSidebar.tsx` | `useAuthStore` (clearAuth) + `useSettingsStore` (sidebarOpen) |
| `components/layout/B2CNavbar.tsx` | `useAuthStore` (isAuthenticated, clearAuth) |
| `components/layout/SettingsProvider.tsx` | `useSettingsStore` (ALL settings) |
| `components/settings/SettingsFab.tsx` | `useSettingsStore` (ALL settings) |
| `components/dashboard/DashboardStats.tsx` | `useStatsStore` (stats, loading, fetchStats) |
| `components/dashboard/DashboardChart.tsx` | `useStatsStore` (stats, loading, fetchStats) |
| `components/dashboard/UsersTable.tsx` | `useUsersStore` (users, fetchUsers, deleteUser) |
| `components/shared/NotificationBell.tsx` | `useNotificationsStore` |

### Logo
Put `logo.jpg` in `public/` folder.
Used in: Homepage navbar, B2C Navbar, B2B Sidebar, browser favicon.
