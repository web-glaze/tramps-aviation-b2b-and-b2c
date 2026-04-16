"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSettingsStore, useAuthStore, usePlatformStore } from "@/lib/store";
import { B2B_SIDEBAR_NAV, B2B_SIDEBAR_BOTTOM, APP_NAME } from "@/config/app";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PanelLeftClose, PanelLeftOpen, Plane, Wallet, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export function B2BSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useSettingsStore();
  const { ps, fetchIfStale } = usePlatformStore();
  useEffect(() => { fetchIfStale(); }, []);
  const platformName = ps.platformName || APP_NAME;
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/b2b/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-[70px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 border-b border-border px-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white border border-border">
              <Image src="/logo.jpg" alt={platformName} width={36} height={36} className="h-9 w-9 object-contain" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-bold text-sm leading-none">{platformName}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Agent Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {B2B_SIDEBAR_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon!;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-medium text-sm",
                      isActive
                        ? "bg-[#208dcb] text-white shadow-sm shadow-[#208dcb]/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Wallet Balance */}
        {sidebarOpen && (
          <div className="mx-3 mb-2 p-3 bg-primary/8 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Wallet className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Wallet Balance</span>
            </div>
            <p className="text-lg font-bold text-primary">
              ₹{(user?.walletBalance || 0).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {/* Bottom Nav + Logout */}
        <div className="p-3 border-t border-border space-y-0.5">
          {B2B_SIDEBAR_BOTTOM.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon!;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-medium text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {!sidebarOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-medium text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="truncate">Logout</span>}
              </button>
            </TooltipTrigger>
            {!sidebarOpen && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>

          {/* Agent info */}
          {sidebarOpen && user && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-muted/50">
              <p className="text-xs font-semibold truncate">{user.name || user.agencyName || "Agent"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              {user.agentId && (
                <p className="text-[10px] font-mono font-bold text-primary/80 tracking-wide">{user.agentId}</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}