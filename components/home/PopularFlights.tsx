"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plane, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularApi, unwrap } from "@/lib/api/services";

const AIRLINE_COLORS: Record<string, string> = {
  IndiGo: "bg-indigo-500",
  "Air India": "bg-red-500",
  SpiceJet: "bg-orange-500",
  Vistara: "bg-purple-500",
  "Akasa Air": "bg-yellow-400",
  GoFirst: "bg-sky-500",
  AirAsia: "bg-red-600",
  GoAir: "bg-sky-600",
  "Air India Express": "bg-red-400",
};
const acColor = (a?: string) => AIRLINE_COLORS[a || ""] || "bg-slate-400";

const FALLBACK: any[] = [
  {
    from: "DEL",
    fromCity: "Delhi",
    to: "BOM",
    toCity: "Mumbai",
    price: "₹2,199",
    airline: "IndiGo",
    duration: "2h 10m",
  },
  {
    from: "BOM",
    fromCity: "Mumbai",
    to: "BLR",
    toCity: "Bangalore",
    price: "₹1,899",
    airline: "SpiceJet",
    duration: "1h 45m",
  },
  {
    from: "DEL",
    fromCity: "Delhi",
    to: "GOI",
    toCity: "Goa",
    price: "₹2,499",
    airline: "Air India",
    duration: "2h 30m",
  },
  {
    from: "BLR",
    fromCity: "Bangalore",
    to: "HYD",
    toCity: "Hyderabad",
    price: "₹1,299",
    airline: "IndiGo",
    duration: "1h 10m",
  },
  {
    from: "MAA",
    fromCity: "Chennai",
    to: "DEL",
    toCity: "Delhi",
    price: "₹2,799",
    airline: "Vistara",
    duration: "2h 50m",
  },
  {
    from: "BOM",
    fromCity: "Mumbai",
    to: "CCU",
    toCity: "Kolkata",
    price: "₹2,399",
    airline: "Air India",
    duration: "2h 25m",
  },
];

function FlightCard({ route, onClick }: { route: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-44 sm:w-52 text-left rounded-2xl p-4 transition-all duration-200",
        "border border-white/60 dark:border-white/10",
        "bg-white/70 dark:bg-white/5 backdrop-blur-md",
        "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        "hover:border-primary/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1",
        "hover:bg-white/90 dark:hover:bg-white/10",
      )}
    >
      {/* Airline row */}
      <div className="flex items-center gap-2 mb-3.5">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm",
            acColor(route.airline),
          )}
        >
          {(route.airline || "?")[0]}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium truncate">
          {route.airline || "Any"}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-1.5 mb-3.5">
        <div className="text-center flex-shrink-0">
          <p className="text-xl font-black text-foreground leading-none">
            {route.from}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {route.fromCity}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center w-full gap-1">
            <div className="flex-1 h-px bg-border/50" />
            <Plane className="h-2.5 w-2.5 text-primary/70" />
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <span className="text-[9px] text-muted-foreground/80 whitespace-nowrap">
            {route.duration || ""}
          </span>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-xl font-black text-foreground leading-none">
            {route.to}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {route.toCity}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="pt-3 border-t border-border/40">
        <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider mb-0.5">
          from
        </p>
        <p
          className="text-base font-black"
          style={{ color: "hsl(var(--brand-orange))" }}
        >
          {route.price}
        </p>
      </div>
    </button>
  );
}

export function PopularFlights({ preloaded }: { preloaded?: any[] }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  useEffect(() => {
    if (preloaded !== undefined) {
      setRoutes(preloaded.length ? preloaded : []);
      return;
    }
    popularApi
      .getFlights()
      .then((r) => {
        const d = unwrap(r);
        setRoutes(Array.isArray(d) && d.length ? d : FALLBACK);
      })
      .catch(() => setRoutes(FALLBACK));
  }, []);

  if (!routes.length) return null;

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scroll = (dir: "l" | "r") =>
    ref.current?.scrollBy({
      left: dir === "l" ? -320 : 320,
      behavior: "smooth",
    });

  const handleClick = (r: any) => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    router.push(
      `/flights?from=${r.from}&to=${r.to}&date=${tmr.toISOString().split("T")[0]}&adults=1`,
    );
  };

  return (
    <section className="py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plane className="h-4 w-4 text-primary" />
              </span>
              Popular Flights
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 ml-10">
              Top routes · click to search
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
          className="flex gap-3 sm:gap-4 overflow-x-auto py-2 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {routes.map((r, i) => (
            <FlightCard
              key={r._id || r.from + r.to + i}
              route={r}
              onClick={() => handleClick(r)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
