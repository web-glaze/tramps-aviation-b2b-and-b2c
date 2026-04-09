"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/components/layout/SettingsProvider";
import { DevPathBar } from "@/components/dev/DevPathBar";

// Anti-flash: reads tp-settings BEFORE first paint → no theme flicker
// Also migrates old 'dark' default to new 'light' default (v4 upgrade)
const ANTI_FLASH = `
(function(){
  try{
    var raw = localStorage.getItem('tp-settings');
    var s = raw ? JSON.parse(raw) : {};
    var st = s.state || {};

    // MIGRATION: If user never explicitly set a theme (old default was 'dark'),
    // reset to 'light'. We detect this by checking if colorTheme is still 'blue'
    // (the old default) — if so, it's a stale old config, reset everything.
    if(st.colorTheme === 'blue' || st.colorTheme === undefined) {
      st.theme = 'light';
      st.colorTheme = 'brand';
      // Save the migration so it only runs once
      try{
        s.state = Object.assign({}, st, {theme:'light', colorTheme:'brand'});
        localStorage.setItem('tp-settings', JSON.stringify(s));
      }catch(e){}
    }

    var t = st.theme || 'light';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    // Only add 'dark' class if user explicitly chose dark
    if(dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    var r = document.documentElement;
    r.setAttribute('data-color',     st.colorTheme   || 'brand');
    r.setAttribute('data-font',      st.fontFamily   || 'jakarta');
    r.setAttribute('data-fontsize',  st.fontSize     || 'md');
    r.setAttribute('data-radius',    st.borderRadius || 'lg');
    r.setAttribute('data-compact',   st.compactMode  ? 'true' : 'false');
    r.setAttribute('data-animations',st.animations === false ? 'false' : 'true');
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Tramps Aviation — B2B & B2C Travel Platform</title>
        <meta name="description" content="India's premier travel booking platform for agents and travelers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        {/* Runs before paint — prevents flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FLASH }} />
      </head>
      <body>
        {/* SettingsProvider applies all theme/font/color attributes reactively */}
        <SettingsProvider>
          {children}
          {/* Dev path bar — only shows in development mode */}
          <DevPathBar />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "var(--radius)",
                fontFamily:   "var(--font-body, inherit)",
                fontSize:     "13px",
                background:   "hsl(var(--card))",
                color:        "hsl(var(--card-foreground))",
                border:       "1px solid hsl(var(--border))",
              },
              duration: 4000,
            }}
          />
        </SettingsProvider>
      </body>
    </html>
  );
}
