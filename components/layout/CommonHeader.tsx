"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Plane, Hotel, Shield, Menu, X, LogIn, User, LogOut,
  Sun, Moon, ChevronDown, Home, LayoutDashboard, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useSettingsStore } from "@/lib/store";
import { toast } from "sonner";

type HeaderVariant = "home" | "b2c" | "b2b";

interface CommonHeaderProps {
  variant?: HeaderVariant;
}

const B2C_NAV = [
  { href: "/b2c/flights",     label: "Flights",      icon: Plane   },
  { href: "/b2c/hotels",      label: "Hotels",       icon: Hotel   },
  { href: "/b2c/insurance",   label: "Insurance",    icon: Shield  },
  { href: "/b2c/series-fare", label: "Series Fare",  icon: Tag     },
];

export function CommonHeader({ variant = "home" }: CommonHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, role, clearAuth } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    if (variant !== "home") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const handleLogout = () => {
    clearAuth();
    setUserDropdown(false);
    setMobileOpen(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const dashboardLink = role === "agent" ? "/b2b/dashboard" : "/b2c/my-trips";

  const isHome = variant === "home";
  const isB2C = variant === "b2c";
  const isTransparentAtTop = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isTransparentAtTop
          ? "h-20 bg-transparent"
          : "h-16 bg-background/95 dark:bg-card/95 backdrop-blur-xl border-b border-border shadow-sm"
      )}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">

        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/logo.jpg"
              alt="Tramps Aviation"
              width={40} height={40}
              className="h-10 w-10 object-contain bg-white"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-base font-display leading-none text-foreground">
              Tramps Aviation
            </span>
            <span className="text-[10px] text-muted-foreground block leading-none tracking-wide">
              {isB2C ? "Travel Made Easy" : "B2B & B2C Platform"}
            </span>
          </div>
        </Link>

        {/* ─── Desktop Navigation ─── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
          {isHome && (
            <>
              <NavLink href="/b2c/flights" label="Flights" pathname={pathname} />
              <NavLink href="/#features" label="Features" pathname={pathname} isAnchor />
              <NavLink href="/#agents" label="For Agents" pathname={pathname} isAnchor />
              <NavLink href="/#contact" label="Contact" pathname={pathname} isAnchor />
            </>
          )}

          {isB2C && B2C_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            );
          })}

          {/* B2B just shows home link since sidebar handles internal nav */}
          {variant === "b2b" && (
            <Link href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
          )}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* ─── Right side actions ─── */}
        <div className="flex items-center gap-1.5">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>

          {/* Authenticated user menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {(user?.name || user?.agencyName || "U")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[80px] truncate hidden sm:block">
                  {user?.name || user?.agencyName || "User"}
                </span>
                <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform hidden sm:block", userDropdown && "rotate-180")} />
              </button>

              {userDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user?.name || user?.agencyName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link href={dashboardLink} onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                    </Link>
                    {role !== "agent" && (
                      <Link href="/b2c/my-trips" onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Plane className="h-3.5 w-3.5" /> My Trips
                      </Link>
                    )}
                    <div className="border-t border-border my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link href="/b2c/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
              <Link href="/b2c/register"
                className="px-3.5 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-sm"
              >
                Get Started
              </Link>
              <div className="w-px h-4 bg-border mx-0.5" />
              <Link href="/b2b/login"
                className="px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary border border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-xl transition-all whitespace-nowrap"
              >
                Agent Portal ↗
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 dark:bg-card/98 backdrop-blur-xl border-b border-border shadow-2xl animate-in">
          <div className="px-4 py-3 space-y-1">
            {(isB2C ? B2C_NAV.map(n => ({ href: n.href, label: n.label })) : [
              { href: "/b2c/flights",     label: "✈ Flights"     },
              { href: "/b2c/series-fare", label: "🎫 Series Fare" },
              { href: "/#features",       label: "★ Features"     },
              { href: "/#agents",         label: "🏢 For Agents"  },
            ]).map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  pathname.startsWith(href) && href.startsWith("/b")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border space-y-1">
              {isAuthenticated ? (
                <>
                  <Link href={dashboardLink} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 text-left"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/b2c/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <LogIn className="h-4 w-4" /> Customer Login
                  </Link>
                  <Link href="/b2c/register" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-primary text-primary-foreground font-medium"
                  >
                    Sign Up Free
                  </Link>
                  <Link href="/b2b/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <User className="h-4 w-4" /> Agent Portal (B2B)
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

function NavLink({
  href, label, pathname, isAnchor = false
}: {
  href: string; label: string; pathname: string; isAnchor?: boolean;
}) {
  const active = !isAnchor && pathname === href;
  return (
    <Link href={href}
      className={cn(
        "px-3.5 py-2 text-sm font-medium rounded-xl transition-all",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {label}
    </Link>
  );
}
