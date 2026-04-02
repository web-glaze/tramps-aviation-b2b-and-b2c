import Link from "next/link";
import { APP_NAME } from "@/config/app";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <Zap className="h-3 w-3" />
          </div>
          <span className="font-semibold text-sm">{APP_NAME}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Built with Next.js + Shadcn UI.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
