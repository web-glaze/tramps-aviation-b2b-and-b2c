"use client";

import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";

export default function B2CLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CommonHeader variant="b2c" />
      <main className="pt-16 flex-1">{children}</main>
      <CommonFooter />
    </div>
  );
}

