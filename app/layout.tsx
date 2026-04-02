'use client'

import './globals.css'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useSettingsStore } from '@/lib/store'
import { SettingsFab } from '@/components/settings/SettingsFab'

// Anti-flash script injected as raw HTML before page renders
const ANTI_FLASH_SCRIPT = `
(function(){
  try {
    var s = JSON.parse(localStorage.getItem('tp-settings') || '{}');
    var state = s.state || {};
    var theme = state.theme || 'dark';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(isDark) document.documentElement.classList.add('dark');
    var color = state.colorTheme || 'blue';
    var font  = state.fontFamily  || 'jakarta';
    var fsize = state.fontSize    || 'md';
    var rad   = state.borderRadius|| 'lg';
    var cmpct = state.compactMode ? 'true' : 'false';
    var anim  = state.animations === false ? 'false' : 'true';
    var root  = document.documentElement;
    root.setAttribute('data-color', color);
    root.setAttribute('data-font',  font);
    root.setAttribute('data-fontsize', fsize);
    root.setAttribute('data-radius', rad);
    root.setAttribute('data-compact', cmpct);
    root.setAttribute('data-animations', anim);
  } catch(e){}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const {
    theme, colorTheme, fontSize, fontFamily,
    borderRadius, compactMode, animations
  } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.toggle('dark', mq.matches)
      const handler = (e: MediaQueryListEvent) => root.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-color',      colorTheme)
    root.setAttribute('data-font',       fontFamily)
    root.setAttribute('data-fontsize',   fontSize)
    root.setAttribute('data-radius',     borderRadius)
    root.setAttribute('data-compact',    compactMode ? 'true' : 'false')
    root.setAttribute('data-animations', animations  ? 'true' : 'false')
  }, [colorTheme, fontFamily, fontSize, borderRadius, compactMode, animations])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TravelPro — B2B & B2C Travel Platform</title>
        <meta name="description" content="India's premier travel booking platform for agents and travelers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Inject before paint to prevent white flash */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }} />
      </head>
      <body>
        {children}
        <SettingsFab />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body, inherit)',
              fontSize: '13px',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}
