"use client";

import { useState, useEffect } from "react";
import { Shield, CheckCircle, Star, ArrowRight, RefreshCcw } from "lucide-react";
import { insuranceApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MOCK_PLANS = [
  {
    id: "basic", name: "Basic Plan", type: "Domestic",
    price: 149, badge: "", color: "blue",
    coverage: ["Trip cancellation (up to ₹10,000)", "Trip delay (6hr+)", "Missed connection", "Emergency assistance 24/7"],
  },
  {
    id: "standard", name: "Standard Plan", type: "Domestic + International",
    price: 399, badge: "Most Popular", color: "emerald",
    coverage: ["All Basic benefits", "Medical emergency abroad (₹5L)", "Lost baggage (up to ₹25,000)", "Emergency evacuation", "Passport loss assistance"],
  },
  {
    id: "premium", name: "Premium Plan", type: "Worldwide",
    price: 799, badge: "Best Value", color: "violet",
    coverage: ["All Standard benefits", "Personal accident cover (₹10L)", "Trip interruption coverage", "Flight delay (2hr+)", "Home burglary cover", "24/7 travel concierge"],
  },
];

const COLORS: Record<string, { border: string; bg: string; badge: string; btn: string; icon: string }> = {
  blue:    { border: "border-blue-500/30",    bg: "bg-blue-500/5",    badge: "bg-blue-500/20 text-blue-300",    btn: "bg-blue-600 hover:bg-blue-500",    icon: "text-blue-400" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-300", btn: "bg-emerald-600 hover:bg-emerald-500", icon: "text-emerald-400" },
  violet:  { border: "border-violet-500/30",  bg: "bg-violet-500/5",  badge: "bg-violet-500/20 text-violet-300",  btn: "bg-violet-600 hover:bg-violet-500",  icon: "text-violet-400" },
};

export default function B2CInsurancePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    insuranceApi.getPlans({}).then(res => {
      const data = unwrap(res) as any;
      const list = data?.plans || data?.data || [];
      if (list.length > 0) setPlans(list);
    }).catch(() => {});
  }, []);

  const handleBuy = async (plan: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase insurance");
      router.push("/b2c/login?redirect=/b2c/insurance");
      return;
    }
    setBuying(plan.id);
    await new Promise(r => setTimeout(r, 1200));
    setBuying(null);
    toast.success(`${plan.name} purchased successfully!`);
    router.push(`/b2c/booking/IN-${Date.now()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex h-14 w-14 bg-green-500/15 rounded-2xl items-center justify-center mb-4">
          <Shield className="h-7 w-7 text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Travel Insurance</h1>
        <p className="text-muted-foreground text-sm">Powered by Bajaj Allianz · Instant policy issuance · Claim online</p>
        {!isAuthenticated && (
          <p className="text-amber-400 text-xs mt-2">Login required to purchase a plan</p>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const c = COLORS[(plan.color as string) || "blue"];
          return (
            <div key={plan.id}
              className={`relative border ${c.border} ${c.bg} rounded-2xl p-6 flex flex-col transition-all hover:scale-[1.02]`}>
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${c.badge}`}>
                  {plan.badge}
                </span>
              )}

              <div className={`inline-flex h-11 w-11 rounded-xl items-center justify-center mb-4 ${c.badge.split(" ")[0]}`}>
                <Shield className={`h-5 w-5 ${c.icon}`} />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">{plan.type}</p>

              <div className="mb-5 flex-1">
                <ul className="space-y-2">
                  {plan.coverage.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${c.icon}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <div className="mb-3">
                  <span className="text-3xl font-black text-white">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ person</span>
                </div>
                <button
                  onClick={() => handleBuy(plan)}
                  disabled={buying === plan.id}
                  className={`w-full ${c.btn} disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2`}
                >
                  {buying === plan.id
                    ? <><RefreshCcw className="h-4 w-4 animate-spin" /> Processing…</>
                    : <><Shield className="h-4 w-4" /> Buy Now <ArrowRight className="h-3.5 w-3.5" /></>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap justify-center gap-6 text-center">
        {[
          { icon: "🏆", text: "Bajaj Allianz", sub: "Trusted Insurer" },
          { icon: "⚡", text: "Instant Policy", sub: "Issued immediately" },
          { icon: "📱", text: "Claim Online", sub: "Easy digital claims" },
          { icon: "🔒", text: "Secure Payment", sub: "256-bit SSL" },
        ].map(item => (
          <div key={item.text} className="flex flex-col items-center">
            <span className="text-2xl mb-1">{item.icon}</span>
            <p className="text-sm font-semibold text-white">{item.text}</p>
            <p className="text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
