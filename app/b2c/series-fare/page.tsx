"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane, ArrowRight, Clock, Luggage, Search, RefreshCcw, MapPin,
  Calendar, Users, X, AlertCircle, Sparkles, Star, Shield, Tag,
  Info, ChevronDown, Building2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Airline color map
const AIRLINE_COLOR: Record<string, string> = {
  "IndiGo": "bg-indigo-600", "Air India": "bg-red-600", "SpiceJet": "bg-orange-500",
  "Vistara": "bg-purple-600", "Akasa Air": "bg-yellow-500", "Go First": "bg-sky-500",
};
const airlineColor = (name: string) => AIRLINE_COLOR[name] || "bg-[#208dcb]";

// Use the same API URL as the rest of the app (NEXT_PUBLIC_API_URL, default 8080)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ─── Series Fare Card ──────────────────────────────────────────────────────────
function SeriesFareCard({ flight, onBook }: { flight: any; onBook: (f: any) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/30">
      {/* Exclusive badge */}
      <div className="bg-primary/5 border-b border-border/50 px-4 py-1.5 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-[#e44b0f]" />
        <span className="text-[10px] font-bold text-[#e44b0f] uppercase tracking-widest">
          Tramps Aviation Exclusive · Series Fare
        </span>
        {flight.isRefundable === false && (
          <span className="ml-auto text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-semibold">
            Non-Refundable
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Airline badge */}
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center text-foreground font-bold text-xs flex-shrink-0",
            airlineColor(flight.airline)
          )}>
            {(flight.airlineCode || flight.airline || "TA").slice(0, 2).toUpperCase()}
          </div>

          {/* Route */}
          <div className="flex-1 grid grid-cols-3 items-center gap-2">
            <div>
              <p className="text-xl font-bold font-display">{flight.origin}</p>
              <p className="text-xs text-muted-foreground">
                {flight.departureTime || "--:--"}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane className="h-3 w-3 text-primary rotate-0" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold font-display">{flight.destination}</p>
              <p className="text-xs text-muted-foreground">
                {flight.arrivalTime || "--:--"}
              </p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="text-right pl-3 border-l border-border flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-0.5">per person</p>
            <p className="text-2xl font-bold text-[#e44b0f] font-display">
              ₹{Number(flight.price || flight.fare?.totalFare || 0).toLocaleString("en-IN")}
            </p>
            <button
              onClick={() => onBook(flight)}
              className="mt-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Details row */}
        <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Luggage className="h-3 w-3" />
            {flight.baggage || "30KG"} check-in
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {flight.isRefundable === false ? "Non-Refundable" : "Refundable"}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-primary" />
            {flight.cabinClass || "ECONOMY"}
          </span>
          {flight.flightNumber && (
            <span className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              {flight.flightNumber}
            </span>
          )}
          {flight.airline && (
            <span className="font-medium text-foreground">{flight.airline}</span>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-primary hover:underline"
          >
            {expanded ? "Hide" : "Details"}
            <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/60 bg-muted/30 rounded-xl p-3 space-y-2 text-xs">
            {flight.notes && (
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{flight.notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-semibold text-foreground mb-1">Fare Breakdown</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>Base Fare: ₹{Number(flight.fare?.baseFare || flight.price || 0).toLocaleString("en-IN")}</p>
                  <p>Taxes: ₹{Number(flight.fare?.taxes || 0).toLocaleString("en-IN")}</p>
                  <p className="font-semibold text-foreground">
                    Total: ₹{Number(flight.fare?.totalFare || flight.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Policies</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>Cancellation: {flight.isRefundable === false ? "Not allowed" : "Charges apply"}</p>
                  <p>Date Change: {flight.isChangeable === false ? "Not allowed" : "Charges apply"}</p>
                  <p>Baggage: {flight.baggage || "30KG"} + {flight.cabinBaggage || "7KG"} cabin</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-lg px-3 py-2">
              <p className="text-amber-700 dark:text-amber-400 font-medium">
                📞 Contact Tramps Aviation for group/bulk bookings on this series fare.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ flight, from, to, date, onClose }: {
  flight: any; from: string; to: string; date: string; onClose: () => void;
}) {
  const router = useRouter();
  const url = `/b2c/series-fare?from=${from}&to=${to}&date=${date}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-1">Book Series Fare</h3>
          <p className="text-muted-foreground text-sm">
            {from} → {to} · ₹{Number(flight.price || 0).toLocaleString("en-IN")} per person
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(url)}`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Customer</p>
              <p className="text-xs text-muted-foreground">Personal travel · Card / UPI</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </button>
          <button
            onClick={() => router.push(`/b2b/login`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Agent (B2B)</p>
              <p className="text-xs text-muted-foreground">Agent portal · Wallet · Best rates</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500" />
          </button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          For bulk/group bookings{" "}
          <a href="tel:+911800001234" className="text-primary hover:underline">call us</a>
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function SeriesFarePage() {
  const router = useRouter();
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get("from") || "DEL");
  const [to, setTo] = useState(params.get("to") || "BOM");
  const [date, setDate] = useState(params.get("date") || "");
  const [adults, setAdults] = useState(params.get("adults") || "1");

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Auto-search if params present
  useEffect(() => {
    if (params.get("from") && params.get("to") && params.get("date")) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!from || !to) { toast.error("Please enter origin and destination"); return; }
    if (!date) { toast.error("Please select a travel date"); return; }

    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(
        `${API_BASE}/flights/series?origin=${from.toUpperCase()}&destination=${to.toUpperCase()}&departureDate=${date}&adults=${adults}`
      );
      const data = await res.json();
      setFlights(data?.data || data?.results || []);
      setSearched(true);
      if ((data?.data || data?.results || []).length === 0) {
        toast.info("No series fares found for this route on selected date.");
      }
    } catch (err) {
      toast.error("Failed to load series fares. Please try again.");
      setFlights([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero search bar ─── */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-primary/3 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display">Series Fares</h1>
              <p className="text-xs text-muted-foreground">Exclusive Tramps Aviation bulk & group flight inventory</p>
            </div>
          </div>

          {/* Search form */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
              {/* From */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</label>
                <div className="field-wrapper">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none"
                    placeholder="DEL"
                    value={from}
                    onChange={e => setFrom(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Swap */}
              <div className="flex justify-center items-end pb-1">
                <button
                  onClick={swap}
                  className="h-8 w-8 rounded-full border border-border hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                >
                  ⇄
                </button>
              </div>

              {/* To */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To</label>
                <div className="field-wrapper">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none"
                    placeholder="BOM"
                    value={to}
                    onChange={e => setTo(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Travel Date</label>
                <div className="field-wrapper">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="date"
                    className="flex-1 bg-transparent text-sm outline-none"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
              >
                {loading
                  ? <RefreshCcw className="h-4 w-4 animate-spin" />
                  : <Search className="h-4 w-4" />
                }
                {loading ? "Searching…" : "Search"}
              </button>
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-2.5 border border-border/60">
            <Info className="h-3.5 w-3.5 text-[#208dcb] flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-foreground">Series Fares</strong> are Tramps Aviation's exclusive bulk inventory — separate from regular TBO fares.
              These offer special rates for group and series bookings. Contact us for volume discounts.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!loading && searched && flights.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">No Series Fares Found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              No exclusive series fares available for{" "}
              <strong>{from} → {to}</strong> on <strong>{date}</strong>.
              Try a different date or route, or search regular flights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push(`/b2c/flights?from=${from}&to=${to}&date=${date}&adults=${adults}`)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
              >
                Search Regular Flights
              </button>
              <button
                onClick={() => { setDate(""); setSearched(false); }}
                className="px-6 py-2.5 border border-border rounded-xl font-semibold text-sm hover:bg-muted transition-all"
              >
                Clear & Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && flights.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold font-display">
                  {flights.length} Series Fare{flights.length > 1 ? "s" : ""} Found
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {from} → {to} · {date} · {adults} adult{Number(adults) > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                Exclusive Fares
              </div>
            </div>

            {flights.map((flight, i) => (
              <SeriesFareCard
                key={flight.id || flight.resultToken || i}
                flight={flight}
                onBook={setSelectedFlight}
              />
            ))}

            {/* CTA to contact */}
            <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center">
              <h3 className="font-bold mb-1">Need Bulk Booking?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Contact Tramps Aviation directly for group rates and series booking discounts.
              </p>
              <a
                href="tel:+911800001234"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#208dcb] text-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
              >
                📞 1800-001-2345 (Toll Free)
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Book Modal */}
      {selectedFlight && (
        <BookModal
          flight={selectedFlight}
          from={from}
          to={to}
          date={date}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
}

export default function SeriesFarePageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <SeriesFarePage />
    </Suspense>
  );
}
