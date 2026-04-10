"use client";
/**
 * BookingRoleModal
 * Shown when a guest (not logged in) clicks "Book Now"
 * Lets them choose: Customer (B2C) or Agent (B2B)
 */
import { useRouter } from "next/navigation";
import { X, Users, Building2, ArrowRight } from "lucide-react";

interface Props {
  /** URL to redirect back to after B2C login */
  b2cRedirectUrl: string;
  /** URL to redirect to for B2B login (usually /b2b/login) */
  b2bRedirectUrl?: string;
  /** Short context label shown under the title */
  context?: string;
  onClose: () => void;
}

export function BookingRoleModal({ b2cRedirectUrl, b2bRedirectUrl, context, onClose }: Props) {
  const router = useRouter();
  const b2bUrl = b2bRedirectUrl || "/b2b/login";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in">
        <button onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
          <X className="h-4 w-4"/>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-primary"/>
          </div>
          <h3 className="font-bold text-xl text-foreground">How would you like to book?</h3>
          {context && <p className="text-muted-foreground text-sm mt-1">{context}</p>}
        </div>

        <div className="space-y-3">
          {/* B2C */}
          <button
            onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(b2cRedirectUrl)}`)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Book as Customer</p>
              <p className="text-xs text-muted-foreground">Personal travel · Card / UPI</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"/>
          </button>

          {/* B2B */}
          <button
            onClick={() => router.push(`/b2b/login?redirect=${encodeURIComponent(b2bUrl)}`)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-amber-400/40 hover:bg-amber-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Book as Travel Agent</p>
              <p className="text-xs text-muted-foreground">B2B portal · Wallet · Better rates</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors flex-shrink-0"/>
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Already have an account?{" "}
          <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(b2cRedirectUrl)}`)}
            className="text-primary hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
