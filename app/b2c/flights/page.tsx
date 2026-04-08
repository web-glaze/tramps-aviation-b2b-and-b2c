"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane, ArrowRight, Clock, Luggage, Search,
  RefreshCcw, LogIn, X, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Star, Info
} from "lucide-react";
import { flightsApi, customerApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

// ─── Fallback mock when API is offline ───────────────────────────────────────
function makeMock(from: string, to: string) {
  return [
    { id:"F1", airline:"Air India",  flightNo:"AI-201", departure:"06:00", arrival:"08:05", duration:"2h 05m", from, to, stops:0, price:4850, cabinBaggage:"7 kg", checkinBaggage:"15 kg", refundable:true,  resultToken:"MOCK-1" },
    { id:"F2", airline:"IndiGo",    flightNo:"6E-211", departure:"09:30", arrival:"11:45", duration:"2h 15m", from, to, stops:0, price:3200, cabinBaggage:"7 kg", checkinBaggage:"15 kg", refundable:false, resultToken:"MOCK-2" },
    { id:"F3", airline:"SpiceJet",  flightNo:"SG-112", departure:"14:00", arrival:"17:30", duration:"3h 30m", from, to, stops:1, price:2800, cabinBaggage:"7 kg", checkinBaggage:"20 kg", refundable:true,  resultToken:"MOCK-3" },
    { id:"F4", airline:"Vistara",   flightNo:"UK-944", departure:"18:45", arrival:"20:55", duration:"2h 10m", from, to, stops:0, price:6500, cabinBaggage:"7 kg", checkinBaggage:"20 kg", refundable:true,  resultToken:"MOCK-4" },
    { id:"F5", airline:"Akasa Air", flightNo:"QP-403", departure:"07:15", arrival:"09:25", duration:"2h 10m", from, to, stops:0, price:3800, cabinBaggage:"7 kg", checkinBaggage:"15 kg", refundable:false, resultToken:"MOCK-5" },
  ];
}

const AIRLINE_COLORS: Record<string, string> = {
  "IndiGo":    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Air India": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "SpiceJet":  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "Vistara":   "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "Akasa Air": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

// ─── Login Prompt Modal ───────────────────────────────────────────────────────
function LoginModal({ onClose, redirectUrl }: { onClose: () => void; redirectUrl: string }) {
  const router = useRouter();
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
          <h3 className="font-bold text-xl mb-2">Login to Book</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a free account or sign in to complete your booking and get e-ticket.
          </p>
          <div className="flex gap-3">
            <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(redirectUrl)}`)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold transition-colors">
              Sign In
            </button>
            <Link href="/b2c/register"
              className="flex-1 bg-muted hover:bg-muted/80 rounded-xl py-3 text-sm font-semibold transition-colors text-center">
              Register Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Dialog ───────────────────────────────────────────────────────────
function BookingDialog({ flight, adults, from, to, date, onClose }: {
  flight: any; adults: number; from: string; to: string; date: string; onClose: () => void;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [passengers, setPassengers] = useState(
    Array.from({ length: adults }, () => ({ firstName: "", lastName: "", dob: "", gender: "M", passport: "" }))
  );
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [step, setStep]     = useState<"details" | "confirming" | "done">("details");
  const [pnr, setPnr]       = useState("");
  const [bookingRef, setBookingRef] = useState("");

  const totalFare = (flight.price || 0) * adults;

  const handleConfirm = async () => {
    if (!email || !passengers.every(p => p.firstName && p.lastName)) {
      toast.error("Fill all required passenger and contact details"); return;
    }
    setStep("confirming");
    try {
      const res = await customerApi.initiateBooking({
        resultToken: flight.resultToken || flight.id || flight.flightKey,
        tripType: "OneWay",
        adults: adults,
        passengers: passengers.map(p => ({
          title: "Mr", firstName: p.firstName, lastName: p.lastName,
          dob: p.dob || "1990-01-01", gender: p.gender || "M", passportNo: p.passport || "",
          dateOfBirth: p.dob || "1990-01-01",
        })),
        contactEmail: email,
        contactPhone: phone,
      });
      const raw  = res?.data as any;
      const data = raw?.data || raw;
      const ref  = data?.bookingRef || data?.booking?.bookingRef || "";
      const bpnr = data?.pnr        || data?.booking?.pnr        || "";
      setPnr(bpnr || ref);
      setBookingRef(ref);
      setStep("done");
      toast.success("Booking confirmed!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Booking failed. Please try again.";
      toast.error(msg);
      setStep("details");
    }
  };

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h3 className="font-bold text-xl mb-1">Booking Confirmed!</h3>
          {pnr && <p className="text-sm text-muted-foreground mb-1">PNR: <span className="font-mono font-bold text-white">{pnr}</span></p>}
          {bookingRef && <p className="text-xs text-muted-foreground mb-4">Ref: {bookingRef}</p>}
          <p className="text-sm text-muted-foreground mb-5">E-ticket has been sent to <span className="text-white">{email}</span></p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 bg-muted rounded-xl py-2.5 text-sm font-medium">Close</button>
            <button onClick={() => router.push("/b2c/my-trips")}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold">
              My Trips
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={step === "details" ? onClose : undefined} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Confirm Booking</h3>
            <p className="text-xs text-muted-foreground">{flight.airline} · {flight.flightNo} · {from} → {to}</p>
          </div>
          {step === "details" && (
            <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Fare summary */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base fare × {adults}</span><span>₹{(flight.price * adults).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxes & fees</span><span>Included</span></div>
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span>Total</span><span className="text-blue-400">₹{totalFare.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {flight.refundable ? "✓ Refundable" : "✗ Non-refundable"} · {flight.checkinBaggage} check-in baggage
            </p>
          </div>

          {/* Passengers */}
          {passengers.map((p, i) => (
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold">Passenger {i + 1} {i === 0 && <span className="text-xs text-muted-foreground font-normal">(lead passenger)</span>}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">First Name *</label>
                  <input value={p.firstName} onChange={e => { const n=[...passengers]; n[i].firstName=e.target.value; setPassengers(n) }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="First name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Last Name *</label>
                  <input value={p.lastName} onChange={e => { const n=[...passengers]; n[i].lastName=e.target.value; setPassengers(n) }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Last name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Date of Birth</label>
                  <input type="date" value={p.dob} onChange={e => { const n=[...passengers]; n[i].dob=e.target.value; setPassengers(n) }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Gender</label>
                  <select value={p.gender} onChange={e => { const n=[...passengers]; n[i].gender=e.target.value; setPassengers(n) }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">Passport / ID No <span className="text-muted-foreground">(for international)</span></label>
                  <input value={p.passport} onChange={e => { const n=[...passengers]; n[i].passport=e.target.value; setPassengers(n) }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="Optional for domestic" />
                </div>
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Contact Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="you@email.com" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="+91 98765 43210" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> E-ticket and booking confirmation will be sent to this email
            </p>
          </div>

          {/* Confirm button */}
          <button onClick={handleConfirm} disabled={step === "confirming"}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
            {step === "confirming"
              ? <><RefreshCcw className="h-4 w-4 animate-spin" /> Confirming booking…</>
              : <>Confirm & Pay ₹{totalFare.toLocaleString()} <ArrowRight className="h-4 w-4" /></>}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            Payment will be deducted from your saved payment method or you will be redirected to payment gateway
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────
function FlightCard({ flight, adults, onBook }: { flight: any; adults: number; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isCustom = flight.source === "CUSTOM" || flight.resultToken?.startsWith("CUSTOM-");

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all group
      ${isCustom ? "border-amber-400/50 shadow-sm" : "border-border hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"}`}>

      {isCustom && (
        <div className="bg-amber-500/10 border-b border-amber-400/30 px-4 py-1.5 flex items-center gap-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">Special Group Fare — {flight.airline}</span>
          <span className="ml-auto text-xs text-amber-500">{flight.refundable === false ? "Non-Refundable" : ""}</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5 flex-1">
            {/* Airline */}
            <div className="shrink-0 text-center w-20">
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${AIRLINE_COLORS[flight.airline] || "bg-muted text-slate-300"}`}>
                {flight.airline}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">{flight.flightNo}</p>
            </div>

            {/* Times */}
            <div className="flex items-center gap-3 flex-1">
              <div className="text-right">
                <p className="text-2xl font-black">{flight.departure}</p>
                <p className="text-xs text-muted-foreground font-semibold">{flight.from}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-border" />
                  <Plane className="h-3 w-3 text-muted-foreground/60 mx-1" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
                </p>
              </div>
              <div>
                <p className="text-2xl font-black">{flight.arrival}</p>
                <p className="text-xs text-muted-foreground font-semibold">{flight.to}</p>
              </div>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:shrink-0 gap-3">
            <div className="sm:text-right">
              <p className="text-2xl font-black">₹{(flight.price || 0).toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">
                per person · {adults > 1 && <span className="text-blue-400">Total ₹{((flight.price || 0) * adults).toLocaleString()} · </span>}
                {flight.refundable
                  ? <span className="text-green-400">Refundable</span>
                  : <span className="text-muted-foreground">Non-refundable</span>}
              </p>
            </div>
            <button onClick={onBook}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 whitespace-nowrap
                ${isCustom ? "bg-amber-500 hover:bg-amber-400 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}>
              Book Now
            </button>
          </div>
        </div>

        {/* Quick baggage info */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Luggage className="h-3 w-3" /> Cabin {flight.cabinBaggage || "7 kg"}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Luggage className="h-3 w-3" /> Check-in {flight.checkinBaggage || flight.baggage || "15 kg"}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {flight.duration}
          </span>
          <button onClick={() => setExpanded(e => !e)}
            className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            {expanded ? "Hide details" : "Show details"}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Flight</p>
              <p className="text-sm font-semibold">{flight.flightNo}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Cabin</p>
              <p className="text-sm font-semibold">{flight.cabinClass || "Economy"}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Stops</p>
              <p className="text-sm font-semibold">{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Refund</p>
              <p className={`text-sm font-semibold ${flight.refundable ? "text-green-400" : "text-red-400"}`}>
                {flight.refundable ? "Refundable" : "Non-refundable"}
              </p>
            </div>
            {flight.notes && (
              <div className="col-span-2 sm:col-span-4 bg-amber-500/10 border border-amber-400/20 rounded-lg p-2.5">
                <p className="text-xs text-amber-400">{flight.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function FlightsContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [from,   setFrom]   = useState(searchParams.get("from")   || "DEL");
  const [to,     setTo]     = useState(searchParams.get("to")     || "BOM");
  const [date,   setDate]   = useState(searchParams.get("date")   || "");
  const [adults, setAdults] = useState(parseInt(searchParams.get("adults") || "1"));

  const [flights,  setFlights]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy,   setSortBy]   = useState("price");

  const [showLoginModal,    setShowLoginModal]    = useState(false);
  const [bookingFlight,     setBookingFlight]     = useState<any>(null);

  // Auto-search on load if params present
  useEffect(() => {
    if (!date) {
      const d = new Date(); d.setDate(d.getDate() + 1);
      setDate(d.toISOString().split("T")[0]);
    }
    if (searchParams.get("from") && searchParams.get("to") && searchParams.get("date")) {
      handleSearch(searchParams.get("from")!, searchParams.get("to")!, searchParams.get("date")!);
    }
  }, []);

  const handleSearch = async (f = from, t = to, d = date) => {
    if (!f || !t) return toast.error("Enter origin and destination");
    if (!d)       return toast.error("Select a travel date");
    setLoading(true); setSearched(true); setFlights([]);
    try {
      const res  = await flightsApi.search({ origin: f.toUpperCase(), destination: t.toUpperCase(), departureDate: d, adults });
      const data = unwrap(res) as any;
      const list = data?.flights || [];
      setFlights(list.length > 0 ? list : makeMock(f.toUpperCase(), t.toUpperCase()));
    } catch {
      setFlights(makeMock(f.toUpperCase(), t.toUpperCase()));
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flight: any) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setBookingFlight(flight);
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "price")     return (a.price || 0) - (b.price || 0);
    if (sortBy === "departure") return (a.departure || "").localeCompare(b.departure || "");
    return (a.duration || "").localeCompare(b.duration || "");
  });

  const currentUrl = `/b2c/flights?from=${from}&to=${to}&date=${date}&adults=${adults}`;

  return (
    <>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} redirectUrl={currentUrl} />
      )}
      {bookingFlight && (
        <BookingDialog
          flight={bookingFlight} adults={adults} from={from} to={to} date={date}
          onClose={() => setBookingFlight(null)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Search bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[80px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">From</label>
              <input value={from} onChange={e => setFrom(e.target.value.toUpperCase())} maxLength={3} placeholder="DEL"
                className="w-full bg-muted font-bold text-xl uppercase font-mono tracking-widest rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border text-center" />
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">To</label>
              <input value={to} onChange={e => setTo(e.target.value.toUpperCase())} maxLength={3} placeholder="BOM"
                className="w-full bg-muted font-bold text-xl uppercase font-mono tracking-widest rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border text-center" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-muted rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border text-sm" />
            </div>
            <div className="w-20">
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Adults</label>
              <input type="number" value={adults} min={1} max={9} onChange={e => setAdults(parseInt(e.target.value) || 1)}
                className="w-full bg-muted rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 border border-border text-sm text-center font-bold" />
            </div>
            <button onClick={() => handleSearch()} disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap h-[46px]">
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Sort bar */}
        {searched && !loading && flights.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{sorted.length}</span> flights · {from} → {to}
              {!isAuthenticated && <span className="ml-2 text-xs text-amber-400">• Login required to book</span>}
            </p>
            <div className="flex gap-1.5 bg-muted/50 p-1 rounded-xl">
              {[["price","Cheapest"],["departure","Earliest"],["duration","Fastest"]].map(([v,l]) => (
                <button key={v} onClick={() => setSortBy(v)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                    ${sortBy === v ? "bg-blue-600 text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(n => (
              <div key={n} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                <div className="flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-7 w-48 bg-muted rounded" />
                    <div className="h-3 w-28 bg-muted rounded" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-8 w-20 bg-muted rounded" />
                    <div className="h-9 w-24 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 mt-2">
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> Fetching live fares…
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searched && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-bold mb-2">Search for Flights</h2>
            <p className="text-muted-foreground text-sm">Enter origin, destination and date above to find flights</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && sorted.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No flights found</p>
            <p className="text-muted-foreground text-sm">Try different dates or routes</p>
          </div>
        )}

        {/* Results */}
        {!loading && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((f, i) => (
              <FlightCard key={f.id || f.resultToken || i} flight={f} adults={adults} onBook={() => handleBook(f)} />
            ))}
          </div>
        )}
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