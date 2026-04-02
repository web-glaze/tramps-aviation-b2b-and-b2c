"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Zap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/config/app";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg">{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 scale-100 dark:scale-0" />
            <Moon className="absolute h-4 w-4 scale-0 dark:scale-100" />
          </Button>
          <Button variant="ghost">
            <Link href="/b2c/login">Login</Link>
          </Button>
          <Button>
            <Link href={ROUTES.B2B_DASHBOARD}>Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
