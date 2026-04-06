'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ColorTheme  = 'blue'|'violet'|'emerald'|'rose'|'orange'|'teal'|'cyan'|'amber'|'pink'|'indigo'|'slate'|'lime'
type FontSize    = 'xs'|'sm'|'md'|'lg'|'xl'
type FontFamily  = 'inter'|'poppins'|'rajdhani'|'nunito'|'jakarta'|'dm-sans'|'outfit'|'sora'|'space'
type BorderRadius= 'none'|'sm'|'md'|'lg'|'xl'|'2xl'|'full'
type Theme       = 'light'|'dark'|'system'

interface SettingsState {
  theme: Theme; colorTheme: ColorTheme; fontSize: FontSize; fontFamily: FontFamily
  borderRadius: BorderRadius; sidebarOpen: boolean; compactMode: boolean; animations: boolean
  setTheme:(t:Theme)=>void; setColorTheme:(c:ColorTheme)=>void; setFontSize:(s:FontSize)=>void
  setFontFamily:(f:FontFamily)=>void; setBorderRadius:(r:BorderRadius)=>void
  toggleSidebar:()=>void; setSidebarOpen:(open:boolean)=>void
  setCompactMode:(c:boolean)=>void; setAnimations:(a:boolean)=>void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme:'dark', colorTheme:'blue', fontSize:'md', fontFamily:'jakarta',
      borderRadius:'lg', sidebarOpen:true, compactMode:false, animations:true,
      setTheme:(theme)=>set({theme}),
      setColorTheme:(colorTheme)=>set({colorTheme}),
      setFontSize:(fontSize)=>set({fontSize}),
      setFontFamily:(fontFamily)=>set({fontFamily}),
      setBorderRadius:(borderRadius)=>set({borderRadius}),
      toggleSidebar:()=>set(s=>({sidebarOpen:!s.sidebarOpen})),
      setSidebarOpen:(sidebarOpen)=>set({sidebarOpen}),
      setCompactMode:(compactMode)=>set({compactMode}),
      setAnimations:(animations)=>set({animations}),
    }),
    { name:'tp-settings' }
  )
)
export const useUIStore = useSettingsStore

// Role: only 'agent' (B2B) or 'customer' (B2C) — admin is a separate project
type UserRole = 'agent' | 'customer' | null

interface AuthState {
  user: any|null
  token: string|null
  role: UserRole
  agentId: string|null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth:(user:any, token:string)=>void
  clearAuth:()=>void
  setHasHydrated:(v:boolean)=>void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      agentId: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
          localStorage.setItem('agent_token', token)
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
        }
        set({
          user,
          token,
          role: user?.role || null,
          agentId: user?.agentId || null,  // TRV-00001 format
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('agent_token')
          localStorage.removeItem('tp-auth')
          document.cookie = 'auth_token=; path=/; max-age=0'
        }
        set({ user: null, token: null, role: null, agentId: null, isAuthenticated: false })
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'tp-auth',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
          state.isAuthenticated = !!(state.token && state.user)
        }
      },
    }
  )
)