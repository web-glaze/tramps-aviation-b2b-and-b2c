"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularApi, unwrap } from "@/lib/api/services";

const FALLBACK: any[] = [
  { name: "Maldives", flag: "🇲🇻", tagline: "Island Paradise", visaInfo: "Visa on Arrival", currency: "MVR", flightPrice: "From ₹18,000" },
  { name: "Dubai", flag: "🇦🇪", tagline: "City of Gold", visaInfo: "Visa on Arrival", currency: "AED", flightPrice: "From ₹12,000" },
  { name: "Singapore", flag: "🇸🇬", tagline: "Lion City", visaInfo: "No Visa", currency: "SGD", flightPrice: "From ₹15,000" },
  { name: "Thailand", flag: "🇹🇭", tagline: "Land of Smiles", visaInfo: "Visa on Arrival", currency: "THB", flightPrice: "From ₹14,000" },
  { name: "Bali", flag: "🇮🇩", tagline: "Island of Gods", visaInfo: "Visa on Arrival", currency: "IDR", flightPrice: "From ₹16,000" },
  { name: "Switzerland", flag: "🇨🇭", tagline: "Alpine Beauty", visaInfo: "Schengen Visa", currency: "CHF", flightPrice: "From ₹45,000" },
];

function CountryCard({ country, onClick }: { country: any; onClick: () => void }) {
  const visaBg = country.visaInfo?.includes("No Visa")
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : country.visaInfo?.includes("on Arrival")
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";

  return (
    <button onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-44 sm:w-52 text-left rounded-2xl overflow-hidden transition-all duration-200",
        "border border-border/60 dark:border-white/10 bg-white dark:bg-card",
        "shadow-[0_1px_6px_rgba(0,0,0,0.05)]",
        "hover:ring-2 hover:ring-primary/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] hover:-translate-y-1",
      )}
    >
      <div className="h-28 sm:h-32 w-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        {country.imageUrl
          ? <img src={country.imageUrl} alt={country.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ fontSize: "44px", lineHeight: 1 }}
                className="group-hover:scale-110 transition-transform duration-300 select-none">
                {country.flag || "🌍"}
              </span>
            </div>
          )
        }
        {country.imageUrl && country.flag && (
          <div className="absolute top-2 right-2" style={{ fontSize: "20px", lineHeight: 1 }}>{country.flag}</div>
        )}
        {country.visaInfo && (
          <div className={`absolute bottom-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${visaBg}`}>
            {country.visaInfo}
          </div>
        )}
      </div>
      <div className="p-3.5">
        <p className="font-bold text-sm text-foreground leading-tight">{country.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{country.tagline}</p>
        {country.flightPrice && (
          <div className="flex items-center gap-1 mt-2">
            <Plane className="h-2.5 w-2.5 text-primary flex-shrink-0" />
            <span className="text-[10px] font-semibold" style={{ color: "hsl(var(--brand-orange))" }}>{country.flightPrice}</span>
          </div>
        )}
        {country.currency && <p className="text-[9px] text-muted-foreground mt-0.5">💰 {country.currency}</p>}
        <div className="mt-2.5 pt-2 border-t border-border/40">
          <span className="text-[10px] text-primary font-semibold">Explore flights →</span>
        </div>
      </div>
    </button>
  );
}

export function PopularCountries({ preloaded }: { preloaded?: any[] }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  useEffect(() => {
    if (preloaded !== undefined) {
      setCountries(preloaded.length ? preloaded : []);
    } else {
      popularApi.getCountries()
        .then((r) => { const d = unwrap(r); setCountries(Array.isArray(d) && d.length ? d : FALLBACK); })
        .catch(() => setCountries(FALLBACK));
    }
  }, []);

  if (!countries.length) return null;

  const update = () => {
    const el = ref.current; if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scroll = (dir: "l" | "r") => ref.current?.scrollBy({ left: dir === "l" ? -280 : 280, behavior: "smooth" });

  return (
    <section className="py-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-emerald-600" />
              </span>
              International Destinations
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 ml-10">Visa info & flight prices included</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("l")} disabled={!canL}
              className="w-9 h-9 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("r")} disabled={!canR}
              className="w-9 h-9 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div ref={ref} onScroll={update}
          className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide">
          {countries.map((c, i) => (
            <CountryCard key={c._id || c.name + i} country={c}
              onClick={() => router.push("/flights")} />
          ))}
        </div>
      </div>
    </section>
  );
}