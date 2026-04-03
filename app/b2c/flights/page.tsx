"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane, ArrowRight, Clock, Luggage, Filter, Search,
  ArrowUpDown, RefreshCcw, LogIn, X, SlidersHorizontal
} from "lucide-react";
import { flightsApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const AIRLINE_COLORS: Record<string, string> = {
  "IndiGo":    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Air India": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "SpiceJet":  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "Vistara":   "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "Akasa Air": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

const MOCK_FLIGHTS = [
  { id: "F1", airline: "Air India",  flightNo: "AI-201", departure: "06:00", arrival: "08:05", duration: "2h 05m", from: "DEL", to: "BOM", stops: 0, price: 4850, cabinBaggage: "7kg", checkinBaggage: "15kg", refundable: true,  resultToken: "tok_1" },
  { id: "F2", airline: "IndiGo",    flightNo: "6E-211", departure: "09:30", arrival: "11:45", duration: "2h 15m", from: "DEL", to: "BOM", stops: 0, price: 3200, cabinBaggage: "7kg", checkinBaggage: "15kg", refundable: false, resultToken: "tok_2" },
  { id: "F3", airline: "SpiceJet",  flightNo: "SG-112", departure: "14:00", arrival: "17:30", duration: "3h 30m", from: "DEL", to: "BOM", stops: 1, price: 2800, cabinBaggage: "7kg", checkinBaggage: "20kg", refundable: true,  resultToken: "tok_3" },
  { id: "F4", airline: "Vistara",   flightNo: "UK-944", departure: "18:45", arrival: "20:55", duration: "2h 10m", from: "DEL", to: "BOM", stops: 0, price: 6500, cabinBaggage: "7kg", checkinBaggage: "20kg", refundable: true,  resultToken: "tok_4" },
  { id: "F5", airline: "Akasa Air", flightNo: "QP-403", departure: "07:15", arrival: "09:25", duration: "2h 10m", from: "DEL", to: "BOM", stops: 0, price: 3800, cabinBaggage: "7kg", checkinBaggage: "15kg", refundable: false, resultToken: "tok_5" },
];

function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="font-bold text-xl text-white mb-2">Login to Book</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a free account or login to complete your booking.
          </p>
          <div className="flex gap-3">
            <button onClick={onLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              Login
            </button>
            <Link href="/b2c/register"
              className="flex-1 bg-muted hover:bg-slate-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors text-center">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlightsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [from, setFrom]     = useState(searchParams.get("from") || "DEL");
  const [to, setTo]         = useState(searchParams.get("to")   || "BOM");
  const [date, setDate]     = useState(searchParams.get("date") || "");
  const [adults, setAdults] = useState("1");
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy]     = useState("price");
  const [filterStops, setFilterStops] = useState("all");
  const [bookingId, setBookingId]     = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingFlight, setPendingFlight]   = useState<any>(null);

  // Auto-search if params provided
  useEffect(() => {
    if (searchParams.get("from") && searchParams.get("to") && searchParams.get("date")) {
      handleSearch();
    }
    // Set default date
    if (!date) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setDate(d.toISOString().split("T")[0]);
    }
  }, []);

  const handleSearch = async () => {
    if (!from || !to) return toast.error("Enter origin and destination");
    if (!date) return toast.error("Select a travel date");
    setLoading(true);
    setSearched(true);
    setFlights([]);
    try {
      const res = await flightsApi.search({
        origin: from.toUpperCase(), destination: to.toUpperCase(),
        departureDate: date, adults: parseInt(adults),
      });
      const data = unwrap(res) as any;
      const list = data?.flights || data?.data?.flights || [];
      setFlights(list.length > 0 ? list : MOCK_FLIGHTS.map(f => ({ ...f, from: from.toUpperCase(), to: to.toUpperCase() })));
    } catch {
      setFlights(MOCK_FLIGHTS.map(f => ({ ...f, from: from.toUpperCase(), to: to.toUpperCase() })));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight: any) => {
    if (!isAuthenticated) {
      setPendingFlight(flight);
      setShowLoginModal(true);
      return;
    }
    setBookingId(flight.id);
    setTimeout(() => {
      setBookingId(null);
      router.push(`/b2c/booking/FL-${Date.now()}`);
    }, 1200);
  };

  const sorted = [...flights]
    .filter(f => filterStops === "all" ? true : filterStops === "nonstop" ? f.stops === 0 : f.stops > 0)
    .sort((a, b) =>
      sortBy === "price"     ? a.price - b.price :
      sortBy === "departure" ? a.departure.localeCompare(b.departure) :
      (a.duration || "").localeCompare(b.duration || "")
    );

  return (
    <>
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            const url = pendingFlight
              ? `/b2c/login?redirect=${encodeURIComponent(`/b2c/flights?from=${from}&to=${to}&date=${date}`)}`
              : "/b2c/login";
            router.push(url);
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[100px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">From</label>
              <input
                value={from}
                onChange={e => setFrom(e.target.value.toUpperCase())}
                className="w-full bg-muted text-white font-bold text-xl uppercase tracking-widest rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border"
                maxLength={3}
                placeholder="DEL"
              />
            </div>
            <button
              onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
              className="p-2.5 rounded-xl bg-muted hover:bg-slate-700 text-muted-foreground hover:text-white transition-colors self-end mb-0.5"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-[100px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">To</label>
              <input
                value={to}
                onChange={e => setTo(e.target.value.toUpperCase())}
                className="w-full bg-muted text-white font-bold text-xl uppercase tracking-widest rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border"
                maxLength={3}
                placeholder="BOM"
              />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-muted text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-border"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Adults</label>
              <select
                value={adults}
                onChange={e => setAdults(e.target.value)}
                className="w-full bg-muted text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-border"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center gap-2 self-end"
            >
              {loading
                ? <><RefreshCcw className="h-4 w-4 animate-spin" /> Searching</>
                : <><Search className="h-4 w-4" /> Search</>
              }
            </button>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Filters sidebar */}
          {searched && (
            <aside className="w-48 shrink-0 hidden lg:block">
              <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 mb-4">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" /> Filters
                </h3>

                <div className="mb-5">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">Stops</p>
                  {[["all","All Flights"],["nonstop","Non-stop Only"],["stops","With Stops"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                      <input type="radio" name="stops" value={v} checked={filterStops === v}
                        onChange={() => setFilterStops(v)} className="accent-blue-500" />
                      <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">{l}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-2">Sort By</p>
                  {[["price","Cheapest First"],["departure","Earliest Depart"],["duration","Shortest Flight"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                      <input type="radio" name="sort" value={v} checked={sortBy === v}
                        onChange={() => setSortBy(v)} className="accent-blue-500" />
                      <span className="text-sm text-muted-foreground group-hover:text-white transition-colors">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {!searched && !loading && (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Search for Flights</h2>
                <p className="text-muted-foreground text-sm">Enter origin, destination and date above</p>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                {[1,2,3,4].map(n => (
                  <div key={n} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-7 w-56 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="h-8 w-24 bg-muted rounded" />
                        <div className="h-9 w-28 bg-muted rounded-xl" />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  Fetching live fares…
                </p>
              </div>
            )}

            {searched && !loading && (
              <>
                {/* Results header */}
                {sorted.length > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-white">{sorted.length}</span> flights ·{" "}
                      {from.toUpperCase()} → {to.toUpperCase()}
                      {!isAuthenticated && (
                        <span className="ml-2 text-xs text-amber-400">• Login required to book</span>
                      )}
                    </p>
                    {/* Mobile sort/filter */}
                    <div className="flex gap-1 lg:hidden">
                      {[["price","₹"],["departure","🕐"],["duration","⚡"]].map(([v,l]) => (
                        <button key={v} onClick={() => setSortBy(v)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${sortBy === v ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sorted.length === 0 && (
                  <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <Plane className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-muted-foreground">No flights found. Try different dates or routes.</p>
                  </div>
                )}

                {/* Flight Cards */}
                <div className="space-y-3">
                  {sorted.map(f => (
                    <div key={f.id}
                      className="bg-card border border-border hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 rounded-xl p-4 sm:p-5 transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 sm:gap-5 flex-1">
                          {/* Airline */}
                          <div className="shrink-0 text-center">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${AIRLINE_COLORS[f.airline] || "bg-muted text-slate-300"}`}>
                              {f.airline}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-1">{f.flightNo}</p>
                          </div>

                          {/* Times + Route */}
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className="text-right">
                              <p className="text-2xl font-black text-white">{f.departure}</p>
                              <p className="text-xs text-muted-foreground">{f.from}</p>
                            </div>
                            <div className="flex-1 text-center">
                              <p className="text-xs text-muted-foreground mb-1">{f.duration}</p>
                              <div className="flex items-center">
                                <div className="flex-1 h-px bg-slate-700" />
                                <Plane className="h-3.5 w-3.5 text-muted-foreground/60 mx-1" />
                                <div className="flex-1 h-px bg-slate-700" />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-black text-white">{f.arrival}</p>
                              <p className="text-xs text-muted-foreground">{f.to}</p>
                            </div>
                          </div>
                        </div>

                        {/* Price + Book */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:text-right sm:shrink-0 gap-3 sm:gap-1">
                          <div>
                            <p className="text-2xl font-black text-white">₹{f.price.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">
                              per person ·{" "}
                              {f.refundable
                                ? <span className="text-green-400">Refundable</span>
                                : <span className="text-muted-foreground">Non-refundable</span>
                              }
                            </p>
                          </div>
                          <button
                            onClick={() => handleBook(f)}
                            disabled={bookingId === f.id}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 whitespace-nowrap"
                          >
                            {bookingId === f.id
                              ? <span className="flex items-center gap-2"><RefreshCcw className="h-3.5 w-3.5 animate-spin" /> Booking…</span>
                              : "Book Now"
                            }
                          </button>
                        </div>
                      </div>

                      {/* Baggage Info */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Luggage className="h-3 w-3" /> Cabin {f.cabinBaggage}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Luggage className="h-3 w-3" /> Check-in {f.checkinBaggage}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {f.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function B2CFlightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
