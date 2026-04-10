"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Plane,
  Menu,
  X,
  LogIn,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/flights", label: "Flights", icon: "✈" },
  { href: "/hotels", label: "Hotels", icon: "🏨" },
  { href: "/insurance", label: "Insurance", icon: "🛡" },
];

export function B2CNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { colorTheme } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    clearAuth();
    setUserDropdown(false);
    setMobileOpen(false);
    toast.success("Logged out");
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-xl border-b border-border">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2">
          {false ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src=""
              alt="Tramps Aviation"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <Image src="/logo.jpg" alt="Tramps Aviation" width={40} height={40} className="h-10 w-10 object-contain" />
              </div>
              <span className="font-extrabold text-foreground tracking-tight hidden sm:block">
                Tramps Aviation
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-foreground shadow-lg shadow-blue-600/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span className="text-sm">{icon}</span> {label}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={() => {
              if (theme === "dark") setTheme("light");
              else if (theme === "light") setTheme("system");
              else setTheme("dark");
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User menu if logged in as customer */}
          {isAuthenticated && user?.role === "customer" ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors border border-border"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-foreground max-w-[80px] truncate hidden sm:block">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>

              {userDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/b2c/my-trips"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Plane className="h-3.5 w-3.5" /> My Trips
                    </Link>
                    <Link
                      href="/b2c/profile"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <User className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
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
              <Link
                href="/b2c/login"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/b2c/register"
                className="px-4 py-1.5 text-sm font-semibold bg-primary hover:bg-primary/90 text-foreground rounded-xl transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Agent/Admin portal link */}
          <Link
            href="/b2b/login"
            className="hidden lg:block text-xs px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground rounded-xl transition-colors ml-1"
          >
            Agent Portal ↗
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-card/98 backdrop-blur-xl border-b border-border px-4 py-3 space-y-1 shadow-2xl">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span>{icon}</span> {label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border/30 space-y-1">
            {isAuthenticated && user?.role === "customer" ? (
              <>
                <Link
                  href="/b2c/my-trips"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Plane className="h-4 w-4" /> My Trips
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 text-left"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/b2c/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" /> Customer Login
                </Link>
                <Link
                  href="/b2c/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-primary text-foreground font-medium"
                >
                  Sign Up Free
                </Link>
              </>
            )}
            <Link
              href="/b2b/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Agent Portal (B2B)
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
