"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane, ArrowRight, Luggage, Search, RefreshCcw, X,
  AlertCircle, Shield, Zap, CheckCircle, Filter,
  Star, Info, Sparkles, ArrowLeftRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FlightFilters } from "@/components/search/FlightFilters";
import { getPrice } from "@/components/search/FlightCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const AIRLINE_COLOR: Record<string, string> = {
  "IndiGo":"bg-indigo-600","Air India":"bg-red-600","SpiceJet":"bg-orange-500",
  "Vistara":"bg-purple-600","Akasa Air":"bg-yellow-500","Go First":"bg-sky-500",
  "Air India Express":"bg-red-500","AirAsia":"bg-red-700","GoAir":"bg-sky-600",
};
const airlineColor = (n: string) => AIRLINE_COLOR[n] || "bg-primary";

// ─── Series Fare Card ─────────────────────────────────────────────────────────
function SeriesFareCard({ flight, onBook }: { flight: any; onBook: (f: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const price = typeof flight.price === "number" ? flight.price
    : flight.fare?.totalFare || flight.fare?.total || flight.price || 0;
  const refundable = flight.isRefundable !== false;
  const code = (flight.airlineCode || (flight.airline || "?").slice(0, 2)).toUpperCase();

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border transition-all duration-200",
      "bg-card/90 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5",
      "border-border/60 hover:border-primary/30"
    )}>
      {/* Exclusive badge */}
      <div className="bg-gradient-to-r from-primary/8 to-primary/4 border-b border-border/50 px-4 py-1.5 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-primary flex-shrink-0"/>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
          Tramps Aviation Exclusive · Series Fare
        </span>
        {!refundable && (
          <span className="ml-auto text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 rounded-full font-semibold">
            Non-Refundable
          </span>
        )}
        {refundable && (
          <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-semibold">
            Refundable
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Airline badge */}
          <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
            <div className={cn(airlineColor(flight.airline), "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm")}>
              {code}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-center leading-tight">
              {flight.flightNumber || flight.flightNo || ""}
            </p>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">
                {flight.departureTime || flight.origin || "—"}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {flight.origin}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-muted-foreground">{flight.duration || "—"}</p>
              <div className="flex items-center w-full gap-1">
                <div className="flex-1 h-px bg-border"/>
                <Plane className="h-3 w-3 text-primary"/>
                <div className="flex-1 h-px bg-border"/>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">
                {flight.arrivalTime || flight.destination || "—"}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {flight.destination}
              </p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-muted-foreground">per person</p>
            <p className="text-2xl font-black leading-tight" style={{ color: "hsl(var(--brand-orange))" }}>
              ₹{Number(price).toLocaleString("en-IN")}
            </p>
            <button onClick={() => onBook(flight)}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: "hsl(var(--brand-orange))" }}>
              Book Now
            </button>
          </div>
        </div>

        {/* Quick info strip */}
        <div className="flex items-center flex-wrap gap-3 mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Luggage className="h-3 w-3"/>
            {flight.baggage || flight.checkinBaggage || "30KG"} check-in
          </span>
          <span className="flex items-center gap-1">
            <Luggage className="h-3 w-3"/>
            {flight.cabinBaggage || "7KG"} cabin
          </span>
          <span className={cn("flex items-center gap-1 font-medium", refundable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>
            <Shield className="h-3 w-3"/>
            {refundable ? "Refundable" : "Non-Refundable"}
          </span>
          {flight.cabinClass && (
            <span className="flex items-center gap-1 font-mono text-[10px] bg-muted px-2 py-0.5 rounded-full border border-border">
              {flight.cabinClass}
            </span>
          )}
          {flight.airline && <span className="font-semibold text-foreground ml-auto">{flight.airline}</span>}
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors ml-2">
            {expanded ? "Hide" : "Details"} ▾
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fare breakdown */}
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Fare Breakdown</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span className="font-medium">₹{Number(flight.fare?.baseFare || price).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span className="font-medium">₹{Number(flight.fare?.taxes || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-border pt-1.5 mt-1.5">
                    <span>Total</span>
                    <span style={{ color: "hsl(var(--brand-orange))" }}>
                      ₹{Number(flight.fare?.totalFare || flight.fare?.total || price).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Policies</p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Cancellation</span>
                    <span className={refundable ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-rose-500 font-medium"}>
                      {refundable ? "Charges apply" : "Not allowed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Change</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {flight.isChangeable === false ? "Not allowed" : "Charges apply"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baggage</span>
                    <span className="text-foreground font-medium">
                      {flight.baggage || "30KG"} + {flight.cabinBaggage || "7KG"} cabin
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats Left</span>
                    <span className={cn("font-medium", (flight.seatsAvailable || 9) <= 5 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400")}>
                      {flight.seatsAvailable || 9} seats
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {flight.notes && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 inline mr-1.5"/>
                  {flight.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Book Modal ───────────────────────────────────────────────────────────────
function BookModal({ flight, from, to, date, onClose }: { flight: any; from: string; to: string; date: string; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
          <X className="h-4 w-4"/>
        </button>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Plane className="h-6 w-6 text-primary"/>
        </div>
        <h3 className="font-bold text-lg mb-1">Book this Series Fare</h3>
        <p className="text-xs text-muted-foreground mb-5">{flight.airline} · {from} → {to} · {date}</p>
        <div className="space-y-3">
          <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(`/flights?from=${from}&to=${to}&date=${date}`)}`)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Star className="h-4 w-4 text-primary"/>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Customer</p>
              <p className="text-xs text-muted-foreground">Sign in · UPI / Card payment</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary"/>
          </button>
          <button onClick={() => router.push(`/b2b/login`)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left group">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-amber-600"/>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Agent (B2B)</p>
              <p className="text-xs text-muted-foreground">Agent portal · Wallet · Best rates</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500"/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function SeriesFarePage() {
  const router = useRouter();
  const params = useSearchParams();

  const [from,   setFrom]   = useState(params.get("from")   || "DEL");
  const [to,     setTo]     = useState(params.get("to")     || "BOM");
  const [date,   setDate]   = useState(params.get("date")   || "");
  const [adults, setAdults] = useState(params.get("adults") || "1");

  const [flights,  setFlights]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Filter state
  const [sortBy,        setSortBy]        = useState("price");
  const [filterStop,    setFilterStop]    = useState("all");
  const [filterRef,     setFilterRef]     = useState("all");
  const [filterCabin,   setFilterCabin]   = useState("all");
  const [filterAirline, setFilterAirline] = useState("all");
  const [maxPrice,      setMaxPrice]      = useState(0);

  useEffect(() => {
    if (!date) {
      const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
      setDate(tmr.toISOString().split("T")[0]);
    }
    if (params.get("from") && params.get("to") && params.get("date")) {
      doSearch(params.get("from")!, params.get("to")!, params.get("date")!);
    }
  }, []);

  const doSearch = async (f = from, t = to, d = date) => {
    if (!f || !t) { toast.error("Enter origin and destination"); return; }
    if (!d) {
      const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
      d = tmr.toISOString().split("T")[0]; setDate(d);
    }
    setLoading(true); setSearched(true); setFlights([]);
    setFilterStop("all"); setFilterRef("all"); setFilterCabin("all");
    setFilterAirline("all"); setMaxPrice(0);
    try {
      const res = await fetch(
        `${API_BASE}/flights/series?origin=${encodeURIComponent(f.toUpperCase())}&destination=${encodeURIComponent(t.toUpperCase())}&departureDate=${d}&adults=${adults}`
      );
      const json = await res.json();
      const list = json?.data?.data || json?.data || json?.results || [];
      setFlights(Array.isArray(list) ? list : []);
      if (!list.length) toast.info("No series fares found for this route.");
    } catch {
      toast.error("Failed to load series fares. Please try again.");
      setFlights([]);
    } finally { setLoading(false); }
  };

  const swap = () => { setFrom(to); setTo(from); };

  // Filter + sort
  const allPrices = flights.map(f => f.price || f.fare?.totalFare || 0).filter(Boolean);
  const maxPriceAll = allPrices.length ? Math.max(...allPrices) : 0;
  const effMax = maxPrice > 0 ? maxPrice : maxPriceAll;
  const hasFilters = filterStop !== "all" || filterRef !== "all" || filterCabin !== "all" || filterAirline !== "all" || (maxPrice > 0 && maxPrice < maxPriceAll);

  const filtered = flights.filter(f => {
    if (filterStop === "0" && f.stops !== 0) return false;
    if (filterStop === "1" && f.stops === 0) return false;
    if (filterRef === "yes" && f.isRefundable === false) return false;
    if (filterRef === "no" && f.isRefundable !== false) return false;
    if (filterCabin && filterCabin !== "all" && (f.cabinClass || "ECONOMY") !== filterCabin) return false;
    if (filterAirline && filterAirline !== "all" && f.airline !== filterAirline) return false;
    const p = f.price || f.fare?.totalFare || 0;
    if (effMax > 0 && p > effMax) return false;
    return true;
  }).sort((a, b) => {
    const pa = a.price || a.fare?.totalFare || 0;
    const pb = b.price || b.fare?.totalFare || 0;
    if (sortBy === "price") return pa - pb;
    if (sortBy === "departure") return (a.departureTime || "").localeCompare(b.departureTime || "");
    return 0;
  });

  // Adapt flights for FlightFilters (it expects getPrice format)
  const flightsForFilter = flights.map(f => ({
    ...f,
    price: f.price || f.fare?.totalFare || f.fare?.total || 0,
    airline: f.airline || "",
    cabinClass: f.cabinClass || "ECONOMY",
    stops: f.stops ?? 0,
    refundable: f.isRefundable !== false,
  }));

  return (
    <>
      {selectedFlight && (
        <BookModal flight={selectedFlight} from={from} to={to} date={date} onClose={() => setSelectedFlight(null)}/>
      )}

      {/* ── Search Bar ── */}
      <div className="search-hero">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
            {/* From */}
            <div>
              <label className="search-label">From</label>
              <div className="relative">
                <input value={from} onChange={e => setFrom(e.target.value.toUpperCase())}
                  maxLength={3} placeholder="DEL"
                  className="search-input w-full font-black text-xl tracking-widest text-center uppercase"/>
                <button onClick={swap}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 hidden sm:flex">
                  <ArrowLeftRight className="h-3 w-3 text-primary"/>
                </button>
              </div>
            </div>
            {/* To */}
            <div>
              <label className="search-label">To</label>
              <input value={to} onChange={e => setTo(e.target.value.toUpperCase())}
                maxLength={3} placeholder="BOM"
                className="search-input w-full font-black text-xl tracking-widest text-center uppercase"/>
            </div>
            {/* Date */}
            <div>
              <label className="search-label">Travel Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="search-input-date w-full text-sm"/>
            </div>
            {/* Adults */}
            <div>
              <label className="search-label">Adults</label>
              <input type="number" value={adults} min={1} max={9}
                onChange={e => setAdults(e.target.value)}
                className="search-input w-full font-bold text-xl text-center"/>
            </div>
            {/* Search */}
            <div className="flex items-end">
              <button onClick={() => doSearch()} disabled={loading}
                className="w-full h-[50px] bg-white text-primary hover:bg-white/90 disabled:opacity-60 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
                {loading ? <RefreshCcw className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          {/* Info bar */}
          <div className="mt-3 flex items-start gap-2 text-xs text-white/70 bg-white/10 rounded-xl px-4 py-2.5 border border-white/15 backdrop-blur-sm">
            <Info className="h-3.5 w-3.5 text-white/60 flex-shrink-0 mt-0.5"/>
            <p>
              <span className="font-semibold text-white">Series Fares</span> are Tramps Aviation's exclusive bulk inventory —
              separate from regular TBO fares. These offer special rates for group and series bookings.
            </p>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {searched && !loading && flights.length > 0 ? (
          <div className="flex gap-5">
            {/* LEFT: Filter panel */}
            <div className="w-56 flex-shrink-0 hidden lg:block">
              <FlightFilters
                flights={flightsForFilter}
                sortBy={sortBy}               setSortBy={setSortBy}
                filterStop={filterStop}       setFilterStop={setFilterStop}
                filterRef={filterRef}         setFilterRef={setFilterRef}
                filterCabin={filterCabin}     setFilterCabin={setFilterCabin}
                filterAirline={filterAirline} setFilterAirline={setFilterAirline}
                maxPrice={maxPrice}           setMaxPrice={setMaxPrice}
                hasFilters={hasFilters}
                onClear={() => { setFilterStop("all"); setFilterRef("all"); setFilterCabin("all"); setFilterAirline("all"); setMaxPrice(0); }}
              />
            </div>

            {/* RIGHT: Results */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    {filtered.length} Series Fare{filtered.length !== 1 ? "s" : ""} Found
                    {filtered.length !== flights.length && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">({flights.length} total)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {from} → {to} · {date} · {adults} adult{Number(adults) > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3 w-3"/> Exclusive Fares
                </div>
                {/* Mobile sort */}
                <div className="flex gap-1 bg-card border border-border p-1 rounded-xl shadow-sm lg:hidden">
                  {[["price","Cheapest"],["departure","Earliest"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setSortBy(v)}
                      className={cn("text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all",
                        sortBy===v?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>{l}</button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                  <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                  <p className="font-semibold text-foreground mb-1">No fares match your filters</p>
                  <button onClick={() => { setFilterStop("all"); setFilterRef("all"); setFilterCabin("all"); setFilterAirline("all"); setMaxPrice(0); }}
                    className="text-primary hover:underline text-sm mt-2">Clear filters</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((flight, i) => (
                    <SeriesFareCard key={flight.id || flight.resultToken || i} flight={flight} onBook={setSelectedFlight}/>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              {filtered.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[[Shield,"Secure Booking","SSL encrypted"],[Zap,"Instant Confirmation","E-ticket in seconds"],[CheckCircle,"24/7 Support","Always here"]].map(([Icon,t,s]:any)=>(
                    <div key={t} className="bg-card border border-border rounded-xl p-3 text-center shadow-sm">
                      <Icon className="h-5 w-5 text-primary mx-auto mb-1.5"/>
                      <p className="text-xs font-semibold text-foreground">{t}</p>
                      <p className="text-[10px] text-muted-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="space-y-3">
                {[1,2,3,4].map(n=>(
                  <div key={n} className="bg-card border border-border rounded-2xl p-5 animate-pulse shadow-sm h-28"/>
                ))}
                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin"/>Searching exclusive fares…
                </p>
              </div>
            )}
            {!loading && !searched && (
              <div className="text-center py-28">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Sparkles className="h-10 w-10 text-primary"/>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Series Fares</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Exclusive group & bulk flight inventory — enter route and date to search
                </p>
              </div>
            )}
            {searched && !loading && flights.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                <p className="font-semibold text-foreground mb-1">No series fares found</p>
                <p className="text-muted-foreground text-sm">Try different dates or routes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function SeriesFarePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCcw className="h-6 w-6 animate-spin text-primary"/></div>}>
      <SeriesFarePage/>
    </Suspense>
  );
}