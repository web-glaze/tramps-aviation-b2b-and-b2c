"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Plane, Hotel, Shield, Tag, Menu, X, LogIn, User,
  LogOut, Sun, Moon, ChevronDown, Home, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useSettingsStore, usePlatformStore } from "@/lib/store";
import { APP_NAME } from "@/config/app";
import { toast } from "sonner";

type HeaderVariant = "home" | "b2c" | "b2b";

const B2C_NAV = [
  { href: "/flights",     label: "Flights",    icon: Plane },
  { href: "/hotels",      label: "Hotels",     icon: Hotel },
  { href: "/insurance",   label: "Insurance",  icon: Shield },
  { href: "/series-fare", label: "Series Fare", icon: Tag },
];

const HOME_NAV = [
  { href: "/flights",   label: "Flights",    isAnchor: false },
  { href: "/#features", label: "Features",   isAnchor: true },
  { href: "/#agents",   label: "For Agents", isAnchor: true },
  { href: "/#contact",  label: "Contact",    isAnchor: true },
];

export function CommonHeader({ variant = "home" }: { variant?: HeaderVariant }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const { isAuthenticated, user, role, clearAuth } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();
  const { ps, fetchIfStale } = usePlatformStore();

  // Fetch platform settings once (cached 10 min)
  useEffect(() => { fetchIfStale(); }, []);

  useEffect(() => {
    if (variant !== "home") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setUserDropdown(false); }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleTheme  = () => setTheme(theme === "dark" ? "light" : "dark");
  const dashboardLink = role === "agent" ? "/b2b/dashboard" : "/b2c/my-trips";
  const isHome        = variant === "home";
  const isB2C         = variant === "b2c";
  const isTransparent = isHome && !scrolled;

  // Resolved platform name — dynamic from admin or fallback to config
  const platformName   = ps.platformName   || APP_NAME;
  const platformTagline = ps.platformTagline || (isB2C ? "Travel Made Easy" : "B2B & B2C Platform");

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      isTransparent
        ? "h-20 bg-transparent"
        : "h-16 bg-background/95 dark:bg-card/95 backdrop-blur-xl border-b border-border shadow-sm",
    )}>
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group mr-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0">
            <Image src="/logo.jpg" alt={platformName} width={40} height={40}
              className="h-full w-full object-contain bg-white" priority />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm sm:text-base leading-none text-foreground">
              {platformName}
            </span>
            <span className="text-[10px] text-muted-foreground block leading-none tracking-wide">
              {platformTagline}
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {isHome && HOME_NAV.map(({ href, label, isAnchor }) => {
            const active = !isAnchor && pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap",
                active ? "bg-background shadow-sm text-foreground" : "text-foreground/80 hover:text-foreground hover:bg-muted/60",
              )}>{label}</Link>
            );
          })}
          {isB2C && B2C_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            );
          })}
          {variant === "b2b" && (
            <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          )}
        </nav>

        <div className="flex-1 lg:hidden" />

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {(user?.name || user?.agencyName || "U")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[60px] sm:max-w-[80px] truncate hidden sm:block">
                  {user?.name || user?.agencyName || "User"}
                </span>
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform hidden sm:block", userDropdown && "rotate-180")} />
              </button>
              {userDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 sm:w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user?.name || user?.agencyName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link href={dashboardLink} onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                    </Link>
                    {role !== "agent" && (
                      <Link href="/b2c/my-trips" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Plane className="h-3.5 w-3.5" /> My Trips
                      </Link>
                    )}
                    <div className="border-t border-border my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5">
              <Link href="/b2c/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all">
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
              <Link href="/b2c/register"
                className="px-3.5 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-sm">
                Get Started
              </Link>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Link href="/b2b/login"
                className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-xl transition-all whitespace-nowrap">
                Agent Portal ↗
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 dark:bg-card/98 backdrop-blur-xl border-b border-border shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {(isHome ? HOME_NAV.map(n => ({ href: n.href, label: n.label }))
              : isB2C ? B2C_NAV.map(n => ({ href: n.href, label: n.label }))
              : [{ href: "/", label: "🏠 Home" }]
            ).map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  pathname.startsWith(href) && href.startsWith("/") && !href.includes("#")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}>
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.name || user?.agencyName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Link href={dashboardLink} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 text-left">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/b2c/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted">
                    <LogIn className="h-4 w-4" /> Sign In (Customer)
                  </Link>
                  <Link href="/b2c/register" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-primary text-primary-foreground font-medium">
                    Get Started Free
                  </Link>
                  <Link href="/b2b/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm border border-primary/30 text-primary font-medium hover:bg-primary/5">
                    <User className="h-4 w-4" /> Agent Portal (B2B) ↗
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}