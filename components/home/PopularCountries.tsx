"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularApi, unwrap } from "@/lib/api/services";

const FALLBACK: any[] = [
  {
    name: "Maldives",
    flag: "🇲🇻",
    tagline: "Island Paradise",
    visaInfo: "Visa on Arrival",
    currency: "MVR",
    flightPrice: "From ₹18,000",
  },
  {
    name: "Dubai",
    flag: "🇦🇪",
    tagline: "City of Gold",
    visaInfo: "Visa on Arrival",
    currency: "AED",
    flightPrice: "From ₹12,000",
  },
  {
    name: "Singapore",
    flag: "🇸🇬",
    tagline: "Lion City",
    visaInfo: "No Visa",
    currency: "SGD",
    flightPrice: "From ₹15,000",
  },
  {
    name: "Thailand",
    flag: "🇹🇭",
    tagline: "Land of Smiles",
    visaInfo: "Visa on Arrival",
    currency: "THB",
    flightPrice: "From ₹14,000",
  },
  {
    name: "Bali",
    flag: "🇮🇩",
    tagline: "Island of Gods",
    visaInfo: "Visa on Arrival",
    currency: "IDR",
    flightPrice: "From ₹16,000",
  },
  {
    name: "Switzerland",
    flag: "🇨🇭",
    tagline: "Alpine Beauty",
    visaInfo: "Schengen Visa",
    currency: "CHF",
    flightPrice: "From ₹45,000",
  },
];

// ── ORIGINAL card styles — unchanged ────────────────────────────────────────
const glassCard = cn(
  "transition-all duration-200 border border-white/60 dark:border-white/10",
  "bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
  "hover:border-primary/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-white/10",
);

function CountryCard({
  country,
  onClick,
}: {
  country: any;
  onClick: () => void;
}) {
  const visaBg = country.visaInfo?.includes("No Visa")
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
    : country.visaInfo?.includes("on Arrival")
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-36 sm:w-44 text-left rounded-xl sm:rounded-2xl overflow-hidden",
        glassCard,
      )}
    >
      <div className="h-24 sm:h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        {country.imageUrl ? (
          <img
            src={country.imageUrl}
            alt={country.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300 leading-none">
              {country.flag || "🌍"}
            </span>
          </div>
        )}
        {country.imageUrl && country.flag && (
          <div className="absolute top-1.5 right-1.5 text-xl drop-shadow">
            {country.flag}
          </div>
        )}
        {country.visaInfo && (
          <div
            className={`absolute bottom-1.5 left-1.5 text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded ${visaBg}`}
          >
            {country.visaInfo}
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3.5">
        <p className="font-bold text-xs sm:text-sm text-foreground leading-tight">
          {country.name}
        </p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">
          {country.tagline}
        </p>
        {country.flightPrice && (
          <div className="flex items-center gap-1 mt-2">
            <Plane className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary flex-shrink-0" />
            <span
              className="text-[9px] sm:text-[10px] font-semibold"
              style={{ color: "hsl(var(--brand-orange))" }}
            >
              {country.flightPrice}
            </span>
          </div>
        )}
        {country.currency && (
          <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5">
            💰 {country.currency}
          </p>
        )}
        <div className="mt-2.5 pt-2 border-t border-border/40">
          <span className="text-[9px] text-primary font-semibold">
            Explore flights →
          </span>
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
      popularApi
        .getCountries()
        .then((r) => {
          const d = unwrap(r);
          setCountries(Array.isArray(d) && d.length ? d : FALLBACK);
        })
        .catch(() => setCountries(FALLBACK));
    }
  }, []);

  if (!countries.length) return null;

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scroll = (dir: "l" | "r") =>
    ref.current?.scrollBy({
      left: dir === "l" ? -280 : 280,
      behavior: "smooth",
    });

  return (
    <section className="py-6">
      {" "}
      {/* ← py-8→py-6 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header — tighter margin below */}
        <div className="flex items-center justify-between mb-4">
          {" "}
          {/* ← mb-5/6→mb-4 */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="h-4 w-4 text-emerald-600" />
              </span>
              International Destinations
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 ml-10">
              {" "}
              {/* ← mt-1→mt-0.5 */}
              Visa info & flight prices included
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("l")}
              disabled={!canL}
              className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("r")}
              disabled={!canR}
              className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={ref}
          onScroll={update}
          className="flex gap-3 sm:gap-4 overflow-x-auto py-2 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {countries.map((c, i) => (
            <CountryCard
              key={c._id || c.name + i}
              country={c}
              onClick={() => router.push("/flights")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
