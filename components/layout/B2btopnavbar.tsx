"use client";

/**
 * B2BTopNavbar
 * ────────────
 * Modern horizontal top navigation for the B2B agent portal.
 * Replaces the old left sidebar. All navigation items live in the top bar.
 * On mobile, collapses to a hamburger drawer.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, Bell, Sun, Moon, Home, ChevronDown, LogOut,
  User as UserIcon, Wallet, BookOpen, HelpCircle,
} from "lucide-react";
import { useAuthStore, useSettingsStore, usePlatformStore } from "@/lib/store";
import { agentApi, unwrap } from "@/lib/api/services";
import { B2B_SIDEBAR_NAV, B2B_SIDEBAR_BOTTOM, APP_NAME } from "@/config/app";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/b2b/dashboard": "Dashboard",
  "/b2b/flights": "Book Flights",
  "/b2b/hotels": "Book Hotels",
  "/b2b/insurance": "Travel Insurance",
  "/b2b/series-fare": "Series Fare",
  "/b2b/bookings": "My Bookings",
  "/b2b/wallet": "Wallet",
  "/b2b/commission": "Commission",
  "/b2b/reports": "Reports",
  "/b2b/profile": "My Profile",
  "/b2b/help": "Help & Support",
};

export function B2BTopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();
  const { ps, fetchIfStale } = usePlatformStore();

  const platformName = ps.platformName || APP_NAME;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => { fetchIfStale(); }, []);

  // Fetch wallet balance on mount
  const fetchBalance = async () => {
    try {
      setBalLoading(true);
      const res = await agentApi.getWallet();
      const data = unwrap(res) as any;
      const balance = data?.balance ?? data?.walletBalance ?? 0;
      setLiveBalance(Number(balance) || 0);
    } catch { /* silent */ }
    finally { setBalLoading(false); }
  };

  useEffect(() => { fetchBalance(); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleLogout = () => {
    if (clearAuth) clearAuth();
    router.push("/b2b/login");
  };

  const userName = user?.name || user?.agencyName || "Agent";
  const userInitial = userName[0]?.toUpperCase() || "A";
  const pageTitle = PAGE_TITLES[pathname] || "";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ══ Main Navbar ══════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 dark:bg-card/95 backdrop-blur-xl border-b border-border">

        {/* Row 1: Brand + Center Nav + Actions */}
        <div className="h-16 flex items-center px-4 sm:px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all xl:hidden flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Brand */}
          <Link href="/b2b/dashboard" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-white border border-border shadow-sm">
              <Image
                src="/logo.jpg"
                alt={platformName}
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-sm leading-none text-foreground group-hover:text-primary transition-colors">
                {platformName}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wider uppercase">
                Agent Portal
              </p>
            </div>
          </Link>

          {/* Horizontal nav (desktop XL+) */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
            {B2B_SIDEBAR_NAV.map((item) => {
              const Icon = item.icon!;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer when nav hidden */}
          <div className="flex-1 xl:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link
              href="/"
              className="h-9 w-9 rounded-xl border border-border hidden sm:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Link>

            {/* Wallet icon with live balance tooltip */}
            <Link
              href="/b2b/wallet"
              className="relative h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all group"
              title={liveBalance !== null ? `Wallet: ₹${liveBalance.toLocaleString("en-IN")}` : "Wallet"}
            >
              <Wallet className="h-4 w-4" />
              {liveBalance !== null && liveBalance > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-emerald-500 border-2 border-background text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  ✓
                </span>
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              className="relative h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User dropdown */}
            {user && (
              <div className="relative ml-1 pl-2 border-l border-border" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-semibold leading-none truncate max-w-[120px]">{userName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Agent</p>
                  </div>
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform hidden lg:block mr-1",
                    userMenuOpen && "rotate-180"
                  )} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || "Agent"}</p>
                    </div>
                    <div className="py-1">
                      {B2B_SIDEBAR_BOTTOM.map((item) => {
                        const Icon = item.icon!;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <Link
                        href="/b2b/wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        My Wallet
                      </Link>
                      <Link
                        href="/b2b/bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        My Bookings
                      </Link>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Scrollable secondary nav (md+ but <xl) — shows all nav items */}
        <div className="hidden md:block xl:hidden border-t border-border bg-muted/20">
          <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-thin">
            {B2B_SIDEBAR_NAV.map((item) => {
              const Icon = item.icon!;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Page title strip (mobile only, since no secondary nav) */}
        {pageTitle && (
          <div className="md:hidden px-4 pb-2 border-t border-border bg-muted/10">
            <p className="text-sm font-bold text-foreground pt-2">{pageTitle}</p>
          </div>
        )}
      </header>

      {/* ══ Mobile Drawer ════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <aside
            ref={drawerRef}
            className="fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl overflow-hidden bg-white border border-border">
                  <Image
                    src="/logo.jpg"
                    alt={platformName}
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">{platformName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Agent Portal</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wallet balance in drawer */}
            {liveBalance !== null && (
              <Link
                href="/b2b/wallet"
                className="mx-3 mt-3 mb-2 flex items-center gap-3 p-3 rounded-xl border border-primary/25 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                    Wallet Balance
                  </p>
                  <p className="text-base font-bold text-foreground mt-1">
                    ₹{liveBalance.toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            )}

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {B2B_SIDEBAR_NAV.map((item) => {
                const Icon = item.icon!;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="border-t border-border my-3" />

              {B2B_SIDEBAR_BOTTOM.map((item) => {
                const Icon = item.icon!;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer — user + logout */}
            {user && (
              <div className="border-t border-border p-3 flex-shrink-0">
                <div className="flex items-center gap-2.5 mb-2 px-1">
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}