"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plane,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { popularApi, unwrap } from "@/lib/api/services";

const FALLBACK: any[] = [
  {
    name: "Goa",
    country: "India",
    tagline: "Beach Paradise",
    airportCode: "GOI",
    flightPrice: "From ₹2,499",
  },
  {
    name: "Mumbai",
    country: "India",
    tagline: "City of Dreams",
    airportCode: "BOM",
    flightPrice: "From ₹2,199",
  },
  {
    name: "Delhi",
    country: "India",
    tagline: "Heart of India",
    airportCode: "DEL",
    flightPrice: "From ₹1,899",
  },
  {
    name: "Bangalore",
    country: "India",
    tagline: "Silicon Valley",
    airportCode: "BLR",
    flightPrice: "From ₹1,299",
  },
  {
    name: "Jaipur",
    country: "India",
    tagline: "Pink City",
    airportCode: "JAI",
    flightPrice: "From ₹1,999",
  },
  {
    name: "Chennai",
    country: "India",
    tagline: "Gateway of South",
    airportCode: "MAA",
    flightPrice: "From ₹2,799",
  },
];

const glassCard = cn(
  "transition-all duration-200 border border-white/60 dark:border-white/10",
  "bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
  "hover:border-primary/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-white/10",
);

function CityCard({
  city,
  isNearest,
  onClick,
}: {
  city: any;
  isNearest?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-36 sm:w-44 text-left rounded-xl sm:rounded-2xl overflow-hidden",
        glassCard,
      )}
    >
      <div className="h-24 sm:h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        {city.imageUrl ? (
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-400"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
        {city.airportCode && (
          <div className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-black/60 text-slate-700 dark:text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {city.airportCode}
          </div>
        )}
        {isNearest && (
          <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Navigation className="h-2 w-2" /> Near You
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3.5">
        <p className="font-bold text-xs sm:text-sm text-foreground leading-tight">
          {city.name}
        </p>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 truncate">
          {city.tagline}
        </p>
        {city.flightPrice && (
          <div className="flex items-center gap-1 mt-2">
            <Plane className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary flex-shrink-0" />
            <span
              className="text-[9px] sm:text-[10px] font-semibold"
              style={{ color: "hsl(var(--brand-orange))" }}
            >
              {city.flightPrice}
            </span>
          </div>
        )}
        <div className="mt-2.5 pt-2 border-t border-border/40">
          <span className="text-[9px] text-primary font-semibold">
            Search flights →
          </span>
        </div>
      </div>
    </button>
  );
}

export function PopularCities({ preloaded }: { preloaded?: any[] }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [nearestCode, setNearestCode] = useState<string | null>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  useEffect(() => {
    if (preloaded !== undefined) {
      setCities(preloaded.length ? preloaded : []);
    } else {
      popularApi
        .getCities()
        .then((r) => {
          const d = unwrap(r);
          setCities(Array.isArray(d) && d.length ? d : FALLBACK);
        })
        .catch(() => setCities(FALLBACK));
    }

    // Detect nearest city
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { "Accept-Language": "en" } },
            );
            const data = await res.json();
            const city = data?.address?.city || data?.address?.town || "";
            const MAP: Record<string, string> = {
              Delhi: "DEL",
              "New Delhi": "DEL",
              Mumbai: "BOM",
              Bangalore: "BLR",
              Bengaluru: "BLR",
              Chennai: "MAA",
              Hyderabad: "HYD",
              Kolkata: "CCU",
              Pune: "PNQ",
              Ahmedabad: "AMD",
              Goa: "GOI",
              Jaipur: "JAI",
              Kochi: "COK",
              Lucknow: "LKO",
              Chandigarh: "IXC",
            };
            const code = MAP[city];
            if (code) setNearestCode(code);
          } catch {}
        },
        () => {},
        { timeout: 5000 },
      );
    }
  }, []);

  if (!cities.length) return null;

  const sorted = nearestCode
    ? [...cities].sort((a, b) =>
        a.airportCode === nearestCode
          ? -1
          : b.airportCode === nearestCode
            ? 1
            : 0,
      )
    : cities;

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

  const onCityClick = (c: any) => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const d = tmr.toISOString().split("T")[0];
    const from = nearestCode || "DEL";
    if (c.airportCode)
      router.push(
        `/flights?from=${from}&to=${c.airportCode}&date=${d}&adults=1`,
      );
    else router.push(`/hotels?city=${encodeURIComponent(c.name)}`);
  };

  return (
    <section className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </span>
              Popular Cities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">
              Click a city to search flights
              {nearestCode && (
                <span className="ml-1 text-primary font-medium">
                  · Nearest first
                </span>
              )}
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
        <div
          ref={ref}
          onScroll={update}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sorted.map((c, i) => (
            <CityCard
              key={c._id || c.name + i}
              city={c}
              isNearest={nearestCode ? c.airportCode === nearestCode : false}
              onClick={() => onCityClick(c)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
