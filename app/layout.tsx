"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { SettingsFab } from "@/components/settings/SettingsFab";
import { SettingsProvider } from "@/components/layout/SettingsProvider";

// Anti-flash: reads tp-settings BEFORE first paint → no theme flicker
const ANTI_FLASH = `
(function(){
  try{
    var s=JSON.parse(localStorage.getItem('tp-settings')||'{}');
    var st=s.state||{};
    var t=st.theme||'dark';
    var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(dark)document.documentElement.classList.add('dark');
    var r=document.documentElement;
    r.setAttribute('data-color',    st.colorTheme  ||'blue');
    r.setAttribute('data-font',     st.fontFamily  ||'jakarta');
    r.setAttribute('data-fontsize', st.fontSize    ||'md');
    r.setAttribute('data-radius',   st.borderRadius||'lg');
    r.setAttribute('data-compact',  st.compactMode ?'true':'false');
    r.setAttribute('data-animations',st.animations===false?'false':'true');
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
          <SettingsFab />
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
