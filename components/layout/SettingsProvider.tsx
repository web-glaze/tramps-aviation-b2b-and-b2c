"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore, COLOR_SCHEMES, FONT_FAMILIES } from "@/lib/store/settings";
import { useTheme } from "next-themes";

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  // Sync next-themes → settings store when user toggles theme via header button
  // This is a ONE-WAY sync: next-themes is the source of truth for the current theme
  const prevTheme = useRef(theme);
  useEffect(() => {
    if (theme && theme !== prevTheme.current) {
      prevTheme.current = theme;
      if (theme === "light" || theme === "dark" || theme === "system") {
        updateSettings({ themeMode: theme as any });
      }
    }
  }, [theme, updateSettings]);

  // When settings.themeMode changes (e.g. from settings page), push to next-themes
  const prevSettingsTheme = useRef(settings.themeMode);
  useEffect(() => {
    if (settings.themeMode !== prevSettingsTheme.current) {
      prevSettingsTheme.current = settings.themeMode;
      setTheme(settings.themeMode);
    }
  }, [settings.themeMode, setTheme]);

  // Apply CSS variables for color, font, radius, density
  useEffect(() => {
    const root = document.documentElement;

    const scheme = COLOR_SCHEMES[settings.colorScheme];
    const primaryHex = settings.colorScheme === "custom"
      ? settings.customPrimaryColor
      : scheme?.primary || "#3b82f6";
    const fgHex = settings.colorScheme === "custom"
      ? settings.customPrimaryFg
      : scheme?.fg || "#ffffff";

    root.style.setProperty("--primary", hexToHsl(primaryHex));
    root.style.setProperty("--ring", hexToHsl(primaryHex));
    root.style.setProperty("--primary-hex", primaryHex);
    root.style.setProperty("--primary-foreground", fgHex === "#fff" || fgHex === "#ffffff" ? "0 0% 100%" : "0 0% 0%");

    const fontCss = FONT_FAMILIES[settings.fontFamily];
    if (fontCss) root.style.setProperty("--font-sans", `'${fontCss.name}', sans-serif`);

    root.style.setProperty("--font-scale", String(settings.fontScale ?? 1));

    const radiusMap: Record<string, string> = { none: "0px", sm: "4px", md: "8px", lg: "12px", xl: "16px" };
    root.style.setProperty("--radius", radiusMap[settings.borderRadius] || "8px");

    const densityMap: Record<string, string> = { compact: "0.85", normal: "1", comfortable: "1.15" };
    root.style.setProperty("--density", densityMap[settings.density] || "1");
  }, [
    settings.colorScheme,
    settings.customPrimaryColor,
    settings.customPrimaryFg,
    settings.fontFamily,
    settings.fontScale,
    settings.borderRadius,
    settings.density,
  ]);

  // Load Google Font dynamically
  useEffect(() => {
    const fontData = FONT_FAMILIES[settings.fontFamily];
    if (!fontData) return;
    const existingLink = document.getElementById("dynamic-font");
    if (existingLink) existingLink.remove();
    const link = document.createElement("link");
    link.id = "dynamic-font";
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontData.import}&display=swap`;
    document.head.appendChild(link);
  }, [settings.fontFamily]);

  return <>{children}</>;
}
