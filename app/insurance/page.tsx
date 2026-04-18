"use client";
/**
 * /insurance — Public insurance plans (common for B2C + B2B)
 */
import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  Star,
  ArrowRight,
  RefreshCcw,
  Users,
  Building2,
} from "lucide-react";
import { insuranceApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingRoleModal } from "@/components/search/BookingRoleModal";
import { AgentEarnBadge } from "@/components/shared/AgentCommissionBreakdown";

const PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    type: "Domestic",
    price: 149,
    badge: "",
    highlight: false,
    coverage: [
      "Trip cancellation (up to ₹10,000)",
      "Trip delay (6hr+)",
      "Missed connection",
      "Emergency assistance 24/7",
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    type: "Domestic + International",
    price: 399,
    badge: "Most Popular",
    highlight: true,
    coverage: [
      "All Basic benefits",
      "Medical emergency abroad (₹5L)",
      "Lost baggage (up to ₹25,000)",
      "Emergency evacuation",
      "Passport loss assistance",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    type: "Worldwide",
    price: 799,
    badge: "Best Value",
    highlight: false,
    coverage: [
      "All Standard benefits",
      "Personal accident cover (₹10L)",
      "Trip interruption coverage",
      "Flight delay (2hr+)",
      "Home burglary cover",
      "24/7 travel concierge",
    ],
  },
];

export default function InsurancePage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [plans, setPlans] = useState(PLANS);
  const [buying, setBuying] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState(false);

  useEffect(() => {
    insuranceApi
      .getPlans({})
      .then((res) => {
        const data = unwrap(res) as any;
        const list = data?.plans || data?.data || [];
        if (list.length > 0) setPlans(list);
      })
      .catch(() => {});
  }, []);

  const handleBuy = (plan: any) => {
    if (isAuthenticated && role === "agent") {
      // Agent buys insurance inline — same flow, wallet deduction happens server-side
      setBuying(plan.id);
      toast.success(`${plan.name} selected — processing via agent wallet…`);
      setTimeout(() => {
        setBuying(null);
        window.location.href = "/b2b/bookings";
      }, 2000);
      return;
    }
    if (isAuthenticated) {
      setBuying(plan.id);
      toast.success(`${plan.name} selected — redirecting to payment…`);
      setTimeout(() => {
        setBuying(null);
        router.push("/b2c/my-trips");
      }, 2000);
      return;
    }
    setRoleModal(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {roleModal && (
        <BookingRoleModal
          b2cRedirectUrl="/insurance"
          b2bRedirectUrl="/b2b/login?redirect=/insurance"
          context="Travel Insurance Plans"
          onClose={() => setRoleModal(false)}
        />
      )}

      {/* Hero — wrapped in padding container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
        <div className="search-hero">
          <div className="px-4 py-10 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Travel Insurance
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Comprehensive protection for your journeys — from domestic weekend
              trips to worldwide adventures
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "bg-card border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                plan.highlight
                  ? "border-primary/40 shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/25",
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={cn(
                    "px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider",
                    plan.highlight
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      plan.highlight ? "bg-primary/15" : "bg-muted",
                    )}
                  >
                    <Shield
                      className={cn(
                        "h-5 w-5",
                        plan.highlight
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.type}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Starting from
                  </p>
                  <p
                    className="text-4xl font-black leading-none"
                    style={{ color: "hsl(var(--brand-orange))" }}
                  >
                    ₹{plan.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    per person per trip
                  </p>
                  {/* Agent-only earn badge */}
                  <AgentEarnBadge
                    totalAmount={Number(plan.price) || 0}
                    commissionPercent={Number(
                      (plan as any)?.commissionPercent ?? 5,
                    )}
                    commissionAmount={(plan as any)?.commissionAmount}
                    className="mt-2"
                  />
                </div>

                {/* Coverage */}
                <div className="space-y-2 mb-6">
                  {plan.coverage.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle
                        className={cn(
                          "h-3.5 w-3.5 flex-shrink-0 mt-0.5",
                          plan.highlight
                            ? "text-primary"
                            : "text-emerald-600 dark:text-emerald-400",
                        )}
                      />
                      <p className="text-xs text-foreground leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleBuy(plan)}
                  disabled={buying === plan.id}
                  className={cn(
                    "w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[.98]",
                    plan.highlight
                      ? "btn-primary"
                      : "btn-outline hover:bg-primary hover:text-primary-foreground hover:border-primary",
                  )}
                >
                  {buying === plan.id ? (
                    <>
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Select Plan <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust band */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            [Shield, "Bajaj Allianz", "Trusted insurer"],
            [CheckCircle, "Cashless Claims", "Direct settlement"],
            [Star, "4.8 Rating", "Customer rated"],
            [RefreshCcw, "24/7 Support", "Always available"],
          ].map(([Icon, t, s]: any) => (
            <div
              key={t}
              className="bg-card border border-border rounded-xl p-4 text-center shadow-sm"
            >
              <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">{t}</p>
              <p className="text-[10px] text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
