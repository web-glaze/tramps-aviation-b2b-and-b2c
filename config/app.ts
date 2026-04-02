import {
  LayoutDashboard,
  Settings,
  BarChart3,
  Plane,
  Hotel,
  Shield,
  Wallet,
  BookOpen,
  TrendingUp,
  FileText,
  HelpCircle,
  User,
} from "lucide-react";
import type { NavItem } from "@/types";

export const APP_NAME = "Tramps Aviation";
export const APP_DESCRIPTION = "B2B & B2C Travel Platform";

export const ROUTES = {
  HOME: "/",
  // B2B Agent Portal
  B2B_LOGIN: "/b2b/login",
  B2B_REGISTER: "/b2b/register",
  B2B_DASHBOARD: "/b2b/dashboard",
  B2B_FLIGHTS: "/b2b/flights",
  B2B_HOTELS: "/b2b/hotels",
  B2B_INSURANCE: "/b2b/insurance",
  B2B_BOOKINGS: "/b2b/bookings",
  B2B_WALLET: "/b2b/wallet",
  B2B_COMMISSION: "/b2b/commission",
  B2B_REPORTS: "/b2b/reports",
  B2B_PROFILE: "/b2b/profile",
  B2B_KYC: "/b2b/kyc",
  // B2C Customer Portal
  B2C_LOGIN: "/b2c/login",
  B2C_REGISTER: "/b2c/register",
  B2C_FLIGHTS: "/b2c/flights",
  B2C_HOTELS: "/b2c/hotels",
  B2C_INSURANCE: "/b2c/insurance",
  B2C_MY_TRIPS: "/b2c/my-trips",
} as const;

// B2B Sidebar Navigation
export const B2B_SIDEBAR_NAV: NavItem[] = [
  { label: "Dashboard", href: ROUTES.B2B_DASHBOARD, icon: LayoutDashboard },
  { label: "Flights", href: ROUTES.B2B_FLIGHTS, icon: Plane },
  { label: "Hotels", href: ROUTES.B2B_HOTELS, icon: Hotel },
  { label: "Insurance", href: ROUTES.B2B_INSURANCE, icon: Shield },
  { label: "My Bookings", href: ROUTES.B2B_BOOKINGS, icon: BookOpen },
  { label: "Wallet", href: ROUTES.B2B_WALLET, icon: Wallet },
  { label: "Commission", href: ROUTES.B2B_COMMISSION, icon: TrendingUp },
  { label: "Reports", href: ROUTES.B2B_REPORTS, icon: BarChart3 },
];

export const B2B_SIDEBAR_BOTTOM: NavItem[] = [
  { label: "Profile", href: ROUTES.B2B_PROFILE, icon: User },
  { label: "Help", href: "/b2b/help", icon: HelpCircle },
];
