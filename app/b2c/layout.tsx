"use client";

import { B2CNavbar } from "@/components/layout/B2CNavbar";

export default function B2CLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <B2CNavbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
