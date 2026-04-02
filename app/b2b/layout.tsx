"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, useSettingsStore } from "@/lib/store";
import { B2BSidebar } from "@/components/layout/B2BSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Pages inside /b2b that are fully public (no auth needed)
const B2B_PUBLIC = [
  "/b2b/login",
  "/b2b/register",
  "/b2b/kyc",
  "/b2b/forgot-password",
  "/b2b/reset-password",
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const { user, token, role, isAuthenticated, _hasHydrated } = useAuthStore();
  const { sidebarOpen } = useSettingsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  const isPublicPage = B2B_PUBLIC.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!_hasHydrated) return;

    // Public b2b pages — always allow
    if (isPublicPage) {
      setChecked(true);
      return;
    }

    // No token or wrong role → go to B2B login
    const localToken =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if ((!isAuthenticated && !localToken) || (role && role !== "agent")) {
      router.replace("/b2b/login");
      return;
    }

    // Agent logged in — check KYC
    const kycStatus = user?.kycStatus || user?.status || "";
    const kycApproved = kycStatus === "approved" || kycStatus === "active";
    const isOnKycPage = pathname.startsWith("/b2b/kyc");

    if (!kycApproved && !isOnKycPage) {
      router.replace("/b2b/kyc");
      return;
    }

    setChecked(true);
  }, [_hasHydrated, isAuthenticated, role, pathname, user]);

  // Spinner while checking
  if (!_hasHydrated || (!checked && !isPublicPage)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Public pages — no sidebar
  if (isPublicPage) return <>{children}</>;

  // Not authenticated after check
  if (!isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("auth_token")) return null;

  // KYC page — full-screen (no sidebar)
  if (pathname.startsWith("/b2b/kyc")) return <>{children}</>;

  // Full agent dashboard layout
  return (
    <div className="min-h-screen bg-background">
      <B2BSidebar />
      <DashboardHeader />
      <main
        className={cn(
          "transition-all duration-300 pt-16 min-h-screen",
          sidebarOpen ? "ml-64" : "ml-[70px]",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
