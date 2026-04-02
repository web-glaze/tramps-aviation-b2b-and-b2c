"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";
export type FontFamily = "inter" | "poppins" | "outfit" | "nunito" | "dm-sans" | "geist";
export type ColorScheme = "blue" | "indigo" | "violet" | "emerald" | "rose" | "amber" | "cyan" | "custom";

export interface PlatformSettings {
  // Branding
  appName: string;
  appTagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;

  // Theme
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  customPrimaryColor: string;
  customPrimaryFg: string;

  // Typography
  fontFamily: FontFamily;
  fontScale: number; // 0.9 to 1.2

  // Layout
  sidebarStyle: "default" | "compact" | "floating";
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  density: "compact" | "normal" | "comfortable";

  // Features
  enableBookingWithoutLogin: boolean;
  enableAgentSearch: boolean;
  maintenanceMode: boolean;

  // Contact/Social
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  appName: "TravelPro",
  appTagline: "India's Smartest Travel Platform",
  logoUrl: null,
  faviconUrl: null,
  themeMode: "dark",
  colorScheme: "blue",
  customPrimaryColor: "#3b82f6",
  customPrimaryFg: "#ffffff",
  fontFamily: "inter",
  fontScale: 1,
  sidebarStyle: "default",
  borderRadius: "lg",
  density: "normal",
  enableBookingWithoutLogin: false,
  enableAgentSearch: true,
  maintenanceMode: false,
  supportEmail: "support@travelpro.com",
  supportPhone: "+91-1800-XXX-XXXX",
  websiteUrl: "https://travelpro.com",
};

export const COLOR_SCHEMES: Record<ColorScheme, { primary: string; fg: string; name: string }> = {
  blue:    { primary: "#3b82f6", fg: "#fff", name: "Ocean Blue" },
  indigo:  { primary: "#6366f1", fg: "#fff", name: "Indigo" },
  violet:  { primary: "#8b5cf6", fg: "#fff", name: "Violet" },
  emerald: { primary: "#10b981", fg: "#fff", name: "Emerald" },
  rose:    { primary: "#f43f5e", fg: "#fff", name: "Rose Red" },
  amber:   { primary: "#f59e0b", fg: "#000", name: "Amber Gold" },
  cyan:    { primary: "#06b6d4", fg: "#fff", name: "Cyan" },
  custom:  { primary: "#3b82f6", fg: "#fff", name: "Custom" },
};

export const FONT_FAMILIES: Record<FontFamily, { name: string; import: string }> = {
  inter:    { name: "Inter",     import: "Inter:wght@400;500;600;700;800" },
  poppins:  { name: "Poppins",   import: "Poppins:wght@400;500;600;700;800" },
  outfit:   { name: "Outfit",    import: "Outfit:wght@400;500;600;700;800" },
  nunito:   { name: "Nunito",    import: "Nunito:wght@400;500;600;700;800" },
  "dm-sans":{ name: "DM Sans",   import: "DM+Sans:wght@400;500;600;700;800" },
  geist:    { name: "Geist",     import: "Geist:wght@400;500;600;700;800" },
};

interface SettingsStore {
  settings: PlatformSettings;
  updateSettings: (partial: Partial<PlatformSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: "travelpro-settings" }
  )
);
