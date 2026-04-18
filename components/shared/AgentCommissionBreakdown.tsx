"use client";

/**
 * AgentCommissionBreakdown
 * ────────────────────────
 * Single source of truth for showing agent commission, GST & net payable.
 *
 * USAGE: Drop it inside any fare/price card. Internally checks if the logged-in
 * user is an agent — renders nothing for customers/guests.
 *
 *   <AgentCommissionBreakdown
 *     totalAmount={2000}
 *     commissionPercent={5}              // optional, default 5
 *     commissionAmount={100}             // optional, if backend sends it directly
 *     productType="flight"               // flight | hotel | insurance | series-fare
 *   />
 *
 * BACKEND INTEGRATION (future-proof):
 * - If backend sends `commissionAmount` (exact value from commission rules engine),
 *   we use that directly.
 * - Else if backend sends `commissionPercent`, we calculate from it.
 * - Else we fall back to a safe 5% default estimate.
 *
 * Works for TBO live data, Amadeus, series fares, hotels — anywhere.
 */

import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

// Fixed: GST on travel agent commission is 18% per Indian tax law
const GST_ON_COMMISSION_PERCENT = 18;

export interface AgentCommissionBreakdownProps {
  /** Final price customer pays (including all taxes) */
  totalAmount: number;

  /** Base fare if known; else auto-estimated as 85% of total */
  baseFare?: number;

  /** Taxes amount if known; else auto-estimated as 15% of total */
  taxes?: number;

  /** Commission % from backend (commission rules engine). Defaults to 5. */
  commissionPercent?: number;

  /** Exact commission amount from backend. Overrides percent calculation. */
  commissionAmount?: number;

  /** Product for labeling */
  productType?: "flight" | "hotel" | "insurance" | "series-fare";

  /** Number of pax/units for labeling */
  quantity?: number;
  quantityLabel?: string;

  /** Layout density */
  variant?: "full" | "compact";

  /** Hide the estimate disclaimer (if you're showing exact backend values) */
  hideDisclaimer?: boolean;

  /** Extra class */
  className?: string;
}

export function AgentCommissionBreakdown({
  totalAmount,
  baseFare,
  taxes,
  commissionPercent = 5,
  commissionAmount,
  productType = "flight",
  quantity = 1,
  quantityLabel = "pax",
  variant = "full",
  hideDisclaimer = false,
  className,
}: AgentCommissionBreakdownProps) {
  const { role } = useAuthStore();
  const isAgent = role === "agent";

  // Only render for agents — customers & guests see nothing
  if (!isAgent) return null;

  // Safe numeric parsing
  const total = Number(totalAmount) || 0;
  if (total <= 0) return null;

  // Work out the breakdown
  const actualTaxes = typeof taxes === "number" && taxes > 0 ? taxes : Math.round(total * 0.15);
  const actualBase = typeof baseFare === "number" && baseFare > 0 ? baseFare : total - actualTaxes;

  const commission = typeof commissionAmount === "number" && commissionAmount >= 0
    ? commissionAmount
    : Math.round((total * commissionPercent) / 100);

  const gst = Math.round((commission * GST_ON_COMMISSION_PERCENT) / 100);
  const netPayable = total - commission + gst;
  const netProfit = commission - gst;

  const rateLabel = typeof commissionAmount === "number"
    ? "Your Commission"
    : `Your Commission (${commissionPercent}%)`;

  if (variant === "compact") {
    // Compact single-line badge for small card corners
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40",
          className
        )}
        title={`Customer pays ₹${total.toLocaleString("en-IN")}, you earn ₹${commission.toLocaleString("en-IN")} (₹${netProfit.toLocaleString("en-IN")} after GST)`}
      >
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          You earn ₹{commission.toLocaleString("en-IN")}
        </span>
        {netProfit !== commission && (
          <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80">
            (net ₹{netProfit.toLocaleString("en-IN")})
          </span>
        )}
      </div>
    );
  }

  // Full breakdown (inside expandable details)
  return (
    <div className={cn("space-y-1.5 text-sm", className)}>
      {/* Fare lines (only in full mode, since caller may show these separately) */}
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          Base Fare{quantity > 1 ? ` × ${quantity}` : ""}
        </span>
        <span className="font-medium">₹{actualBase.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Taxes & Fees</span>
        <span className="font-medium">
          {typeof taxes === "number" && taxes > 0
            ? `₹${actualTaxes.toLocaleString("en-IN")}`
            : `~₹${actualTaxes.toLocaleString("en-IN")}`}
        </span>
      </div>
      <div className="flex justify-between font-bold border-t border-border pt-1.5 mt-1.5">
        <span>Customer Pays</span>
        <span style={{ color: "hsl(var(--brand-orange))" }}>
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Divider + agent commission block */}
      <div className="mt-3 pt-3 border-t-2 border-dashed border-emerald-300 dark:border-emerald-700/50">
        <div className="flex justify-between">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            {rateLabel}
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            + ₹{commission.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-muted-foreground text-xs">
            GST on commission ({GST_ON_COMMISSION_PERCENT}%)
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            − ₹{gst.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-700/30 bg-emerald-50/60 dark:bg-emerald-900/20 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
          <span className="text-emerald-900 dark:text-emerald-300">
            Net Payable by You
          </span>
          <span className="text-emerald-900 dark:text-emerald-300">
            ₹{netPayable.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {!hideDisclaimer && (
        <p className="text-[10px] text-muted-foreground mt-2 italic flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>
            {typeof commissionAmount === "number"
              ? "Commission calculated per your agent agreement."
              : "Indicative commission. Final value as per your agent agreement."}
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * AgentEarnBadge — ultra-compact badge for price corners
 * Shows just "You earn ₹X" and nothing else. Renders null for customers.
 */
export function AgentEarnBadge({
  totalAmount,
  commissionPercent = 5,
  commissionAmount,
  className,
}: {
  totalAmount: number;
  commissionPercent?: number;
  commissionAmount?: number;
  className?: string;
}) {
  const { role } = useAuthStore();
  if (role !== "agent") return null;

  const total = Number(totalAmount) || 0;
  if (total <= 0) return null;

  const commission =
    typeof commissionAmount === "number" && commissionAmount >= 0
      ? commissionAmount
      : Math.round((total * commissionPercent) / 100);

  if (commission <= 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40",
        className
      )}
    >
      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
        You earn ₹{commission.toLocaleString("en-IN")}
      </span>
    </div>
  );
}