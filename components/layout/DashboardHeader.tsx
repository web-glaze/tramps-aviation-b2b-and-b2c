'use client'
import { usePathname } from 'next/navigation'
import { useAuthStore, useSettingsStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Bell, Sun, Moon } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/b2b/dashboard':  'Dashboard',
  '/b2b/flights':    'Book Flights',
  '/b2b/hotels':     'Book Hotels',
  '/b2b/insurance':  'Travel Insurance',
  '/b2b/bookings':   'My Bookings',
  '/b2b/wallet':     'Wallet',
  '/b2b/commission': 'Commission',
  '/b2b/reports':    'Reports',
  '/b2b/profile':    'My Profile',
  '/b2b/kyc':        'KYC Verification',
}

export function DashboardHeader({ title }: { title?: string }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, theme, setTheme } = useSettingsStore()
  const pageTitle = title || PAGE_TITLES[pathname] || 'TravelPro'

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className={cn(
      'fixed top-0 right-0 z-20 h-16 bg-background/95 backdrop-blur-xl border-b border-border flex items-center px-6 gap-4 transition-all duration-300',
      sidebarOpen ? 'left-64' : 'left-[70px]'
    )}>
      <div className="flex-1">
        <h1 className="font-bold text-base font-display">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button className="relative h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
              {(user.name || user.agencyName || 'A')[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold leading-none">{user.name || user.agencyName || 'Agent'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Agent</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
