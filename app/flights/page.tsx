"use client";
/**
 * /flights — Public flight search page (shared by B2B + B2C)
 * B2C vs B2B detection happens ONLY at booking time:
 *   • Not logged in    → BookingRoleModal (choose Customer or Agent login)
 *   • Logged in agent  → AgentBookingDialog (wallet deduction via agentApi)
 *   • Logged in customer → BookingDialog (B2C payment via customerApi)
 */
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Plane, RefreshCcw, AlertCircle, Shield, Zap, CheckCircle,
  Filter, ArrowRight, X, Info, Star
} from "lucide-react";
import { flightsApi, customerApi, agentApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FlightSearchBar  } from "@/components/search/FlightSearchBar";
import { FlightCard, getPrice } from "@/components/search/FlightCard";
import { FlightFilters    } from "@/components/search/FlightFilters";
import { BookingRoleModal } from "@/components/search/BookingRoleModal";


// ─── Agent (B2B) Booking Dialog — wallet deduction ───────────────────────────
function AgentBookingDialog({ flight, adults, from, to, date, onClose }: {
  flight:any; adults:number; from:string; to:string; date:string; onClose:()=>void;
}) {
  const { agentId } = useAuthStore();
  const taxes = Number(flight?.fare?.taxes || flight?.taxes || 0);
  const [passengers, setPassengers] = useState(
    Array.from({length:adults}, ()=>({firstName:"",lastName:"",dob:"",gender:"M",passport:""}))
  );
  const [step, setStep] = useState<"form"|"loading"|"done">("form");
  const [pnr,  setPnr]  = useState("");
  const [ref,  setRef]  = useState("");
  const total = getPrice(flight) * adults;

  const confirm = async () => {
    if (!passengers.every(p=>p.firstName&&p.lastName)) {
      toast.error("Fill all passenger names"); return;
    }
    setStep("loading");
    try {
      const res = await agentApi.bookFlight({
        resultToken: flight.resultToken||flight.id,
        tripType: "OneWay", adults,
        passengers: passengers.map(p=>({
          title:"Mr", firstName:p.firstName, lastName:p.lastName,
          dob:p.dob||"1990-01-01", gender:p.gender||"M", passportNo:p.passport||""
        })),
        bookedVia: "B2B",
        agentId,
      });
      const d = unwrap(res) as any;
      setPnr(d?.pnr||d?.bookingRef||""); setRef(d?.bookingRef||"");
      setStep("done"); toast.success("Booking confirmed! Wallet debited.");
    } catch(err:any) {
      toast.error(err?.response?.data?.message||"Booking failed"); setStep("form");
    }
  };

  if (step==="done") return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"/>
      <div className="relative bg-card border border-border rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-9 w-9 text-emerald-600 dark:text-emerald-400"/>
        </div>
        <h3 className="font-bold text-2xl text-foreground mb-1">Booking Confirmed!</h3>
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 mb-3 inline-block">
          B2B — Wallet debited ₹{total.toLocaleString("en-IN")}
        </p>
        {pnr && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 mt-1 inline-block">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">PNR</p>
            <p className="font-mono font-black text-xl text-emerald-700 dark:text-emerald-300">{pnr}</p>
          </div>
        )}
        {ref && <p className="text-xs text-muted-foreground mt-1 mb-2">Ref: {ref}</p>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-xl py-2.5 text-sm font-medium transition-colors">Close</button>
          <button onClick={()=>{window.location.href="/b2b/bookings"}} className="flex-1 btn-primary py-2.5 text-sm">My Bookings</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={step==="form"?onClose:undefined}/>
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Agent Booking</h3>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30 px-2 py-0.5 rounded-full font-bold">B2B · Wallet</span>
            </div>
            <p className="text-xs text-muted-foreground">{flight.airline} · {from} → {to} · {date}</p>
          </div>
          {step==="form" && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4"/>
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Fare */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fare × {adults} pax</span>
              <span className="font-medium">₹{(getPrice(flight)*adults).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes & fees</span>
              <span className="font-medium">
                {taxes > 0 ? `₹${taxes.toLocaleString("en-IN")}` : "Included in fare"}
              </span>
            </div>
            <div className="flex justify-between font-bold border-t border-amber-200 dark:border-amber-700/30 pt-2">
              <span>Wallet Deduction</span>
              <span className="text-xl text-amber-600 dark:text-amber-400">₹{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              ✈ {flight.checkinBaggage||"15 KG"} check-in &nbsp;·&nbsp; 🎒 {flight.cabinBaggage||"7 KG"} cabin
            </p>
          </div>

          {/* Passengers */}
          {passengers.map((p,i)=>(
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Passenger {i+1} {i===0&&<span className="text-xs text-muted-foreground font-normal">(Primary)</span>}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[["First Name *","firstName"],["Last Name *","lastName"]].map(([lbl,k])=>(
                  <div key={k}>
                    <label className="text-xs text-muted-foreground block mb-1">{lbl}</label>
                    <input value={(p as any)[k]}
                      onChange={e=>{const n=[...passengers];(n[i] as any)[k]=e.target.value;setPassengers(n)}}
                      className="input-base" placeholder={lbl.replace(" *","")}/>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Date of Birth</label>
                  <input type="date" value={p.dob}
                    onChange={e=>{const n=[...passengers];n[i].dob=e.target.value;setPassengers(n)}}
                    className="input-base"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Gender</label>
                  <select value={p.gender}
                    onChange={e=>{const n=[...passengers];n[i].gender=e.target.value;setPassengers(n)}}
                    className="input-base">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button onClick={confirm} disabled={step==="loading"}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground disabled:opacity-60 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
            {step==="loading"
              ? <><RefreshCcw className="h-4 w-4 animate-spin"/>Confirming…</>
              : <>Confirm & Deduct from Wallet ₹{total.toLocaleString("en-IN")} <ArrowRight className="h-4 w-4"/></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── B2C Booking Dialog ───────────────────────────────────────────────────────
function BookingDialog({ flight, adults, from, to, date, onClose }: {
  flight:any; adults:number; from:string; to:string; date:string; onClose:()=>void;
}) {
  const router = useRouter();
  const taxes = Number(flight?.fare?.taxes || flight?.taxes || 0);
  const [passengers, setPassengers] = useState(
    Array.from({length:adults}, ()=>({firstName:"",lastName:"",dob:"",gender:"M",passport:""}))
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step,  setStep]  = useState<"form"|"loading"|"done">("form");
  const [pnr,   setPnr]   = useState("");
  const [ref,   setRef]   = useState("");
  const total = getPrice(flight) * adults;

  const confirm = async () => {
    if (!email || !passengers.every(p=>p.firstName&&p.lastName)) {
      toast.error("Fill all passenger names and email"); return;
    }
    setStep("loading");
    try {
      const res = await customerApi.initiateBooking({
        resultToken: flight.resultToken||flight.id,
        tripType: "OneWay", adults,
        passengers: passengers.map(p=>({
          title:"Mr", firstName:p.firstName, lastName:p.lastName,
          dob:p.dob||"1990-01-01", gender:p.gender||"M", passportNo:p.passport||""
        })),
        contactEmail: email, contactPhone: phone,
        bookedVia: "B2C",  // marks as customer booking
      });
      const d = unwrap(res) as any;
      setPnr(d?.pnr||d?.bookingRef||""); setRef(d?.bookingRef||"");
      setStep("done"); toast.success("Booking confirmed!");
    } catch(err:any) {
      toast.error(err?.response?.data?.message||"Booking failed"); setStep("form");
    }
  };

  if (step==="done") return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"/>
      <div className="relative bg-card border border-border rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl animate-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-9 w-9 text-emerald-600 dark:text-emerald-400"/>
        </div>
        <h3 className="font-bold text-2xl text-foreground mb-1">Booking Confirmed!</h3>
        {pnr && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 mt-3 inline-block">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">PNR</p>
            <p className="font-mono font-black text-xl text-emerald-700 dark:text-emerald-700 dark:text-emerald-300">{pnr}</p>
          </div>
        )}
        {ref && <p className="text-xs text-muted-foreground mt-1 mb-2">Ref: {ref}</p>}
        <p className="text-sm text-muted-foreground mt-3 mb-5">
          E-ticket sent to <span className="text-foreground font-semibold">{email}</span>
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-xl py-2.5 text-sm font-medium transition-colors">Close</button>
          <button onClick={()=>router.push("/b2c/my-trips")} className="flex-1 btn-primary py-2.5 text-sm">My Trips</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={step==="form"?onClose:undefined}/>
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-foreground">Confirm Booking</h3>
            <p className="text-xs text-muted-foreground">{flight.airline} · {flight.flightNo} · {from} → {to} · {date}</p>
          </div>
          {step==="form" && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4"/>
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Fare summary */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fare × {adults} pax</span>
              <span className="text-foreground font-medium">₹{(getPrice(flight)*adults).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes & fees</span>
              <span className="text-foreground font-medium">
                {taxes > 0 ? `₹${taxes.toLocaleString("en-IN")}` : "Included in fare"}
              </span>
            </div>
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-xl" style={{color:"hsl(var(--brand-orange))"}}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              ✈ {flight.checkinBaggage||"15 KG"} check-in &nbsp;·&nbsp; 🎒 {flight.cabinBaggage||"7 KG"} cabin
            </p>
          </div>

          {/* Passengers */}
          {passengers.map((p,i)=>(
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Passenger {i+1} {i===0&&<span className="text-xs text-muted-foreground font-normal">(Primary)</span>}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[["First Name *","firstName"],["Last Name *","lastName"]].map(([lbl,k])=>(
                  <div key={k}>
                    <label className="text-xs text-muted-foreground block mb-1">{lbl}</label>
                    <input value={(p as any)[k]}
                      onChange={e=>{const n=[...passengers];(n[i] as any)[k]=e.target.value;setPassengers(n)}}
                      className="input-base" placeholder={lbl.replace(" *","")}/>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Date of Birth</label>
                  <input type="date" value={p.dob}
                    onChange={e=>{const n=[...passengers];n[i].dob=e.target.value;setPassengers(n)}}
                    className="input-base"/>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Gender</label>
                  <select value={p.gender}
                    onChange={e=>{const n=[...passengers];n[i].gender=e.target.value;setPassengers(n)}}
                    className="input-base">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground border-b border-border pb-2">Contact Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Email *</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="input-base" placeholder="you@email.com"/>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)}
                  className="input-base" placeholder="+91 98765 43210"/>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3 text-primary flex-shrink-0"/>
              E-ticket will be sent to your email after confirmation
            </p>
          </div>

          <button onClick={confirm} disabled={step==="loading"}
            className="w-full h-12 btn-orange disabled:opacity-60 text-sm font-bold shadow-sm">
            {step==="loading"
              ? <><RefreshCcw className="h-4 w-4 animate-spin"/>Confirming…</>
              : <>Confirm & Pay ₹{total.toLocaleString("en-IN")} <ArrowRight className="h-4 w-4"/></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function FlightsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  const [tripType, setTripType] = useState<"oneway"|"roundtrip">(
    (searchParams.get("tripType") as any) || "oneway"
  );
  const [from,    setFrom]    = useState((searchParams.get("from")   || "DEL").toUpperCase());
  const [to,      setTo]      = useState((searchParams.get("to")     || "BOM").toUpperCase());
  const [date,    setDate]    = useState(searchParams.get("date")    || "");
  const [retDate, setRetDate] = useState(searchParams.get("retDate") || "");
  const [adults,  setAdults]  = useState(parseInt(searchParams.get("adults") || "1"));

  const [flights,  setFlights]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const [sortBy,      setSortBy]      = useState("price");
  const [filterStop,  setFilterStop]  = useState("all");
  const [filterRef,   setFilterRef]   = useState("all");
  const [roleModal,   setRoleModal]   = useState(false);
  const [bookFlight,      setBookFlight]      = useState<any>(null);
  const [agentBookFlight, setAgentBookFlight] = useState<any>(null);

  useEffect(() => {
    if (!date) {
      const d = new Date(); d.setDate(d.getDate()+1);
      setDate(d.toISOString().split("T")[0]);
    }
    const f = searchParams.get("from");
    const t = searchParams.get("to");
    const d = searchParams.get("date");
    if (f && t && d) doSearch(f, t, d);
  }, []);

  const doSearch = async (f=from, t=to, d=date) => {
    if (!f||!t) { toast.error("Enter origin and destination"); return; }
    // Auto-set tomorrow if no date
    if (!d) {
      const tmr = new Date(); tmr.setDate(tmr.getDate()+1);
      d = tmr.toISOString().split("T")[0];
      setDate(d);
    }
    const params = new URLSearchParams({from:f,to:t,date:d,adults:String(adults),tripType});
    window.history.replaceState(null,"",`/flights?${params}`);
    setLoading(true); setSearched(true); setFlights([]);
    try {
      const res  = await flightsApi.search({
        origin:        String(f).trim().toUpperCase(),
        destination:   String(t).trim().toUpperCase(),
        departureDate: String(d).trim(),
        adults:        Number(adults) || 1,
        tripType:      tripType==="roundtrip" ? "RoundTrip" : "OneWay",
        returnDate:    tripType==="roundtrip" && retDate ? String(retDate) : undefined,
      });
      setFlights((res as any)?.data?.flights || []);
    } catch { toast.error("Search failed — please try again"); }
    finally { setLoading(false); }
  };

  // ── B2C / B2B booking detection — happens HERE at booking time ──────────
  const handleBook = (flight: any) => {
    if (isAuthenticated && role === "agent") {
      // Logged in as agent → open agent booking dialog (wallet deduction)
      setAgentBookFlight(flight);
      return;
    }
    if (isAuthenticated) {
      // Logged in as customer → open B2C booking dialog
      setBookFlight(flight);
      return;
    }
    // Guest → show role picker modal
    setRoleModal(true);
  };

  const filtered = flights
    .filter(f => {
      const seatsAvailable =
        typeof f.seatsAvailable === "number" && f.seatsAvailable > 0
          ? f.seatsAvailable
          : null;
      if (seatsAvailable !== null && seatsAvailable < adults) return false;
      if (filterStop==="0" && f.stops!==0) return false;
      if (filterStop==="1" && f.stops===0) return false;
      if (filterRef==="yes" && !f.refundable) return false;
      if (filterRef==="no"  &&  f.refundable) return false;
      return true;
    })
    .sort((a,b) => {
      if (sortBy==="price")     return getPrice(a)-getPrice(b);
      if (sortBy==="departure") return (a.departure||"").localeCompare(b.departure||"");
      if (sortBy==="duration")  return (a.duration ||"").localeCompare(b.duration ||"");
      return 0;
    });

  const hasFilters   = filterStop!=="all"||filterRef!=="all";
  const customCount  = flights.filter(f=>f.source==="CUSTOM"||f.resultToken?.startsWith("TRAMPS-")).length;
  const currentUrl   = `/flights?from=${from}&to=${to}&date=${date}&adults=${adults}`;

  return (
    <>
      {roleModal  && (
        <BookingRoleModal
          b2cRedirectUrl={currentUrl}
          b2bRedirectUrl={`/b2b/login?redirect=${encodeURIComponent(`/flights?from=${from}&to=${to}&date=${date}`)}`}
          context={`${from} → ${to} · ${date}`}
          onClose={()=>setRoleModal(false)}
        />
      )}
      {agentBookFlight && (
        <AgentBookingDialog
          flight={agentBookFlight} adults={adults} from={from} to={to} date={date}
          onClose={()=>setAgentBookFlight(null)}
        />
      )}
      {bookFlight && (
        <BookingDialog
          flight={bookFlight} adults={adults} from={from} to={to} date={date}
          onClose={()=>setBookFlight(null)}
        />
      )}

      {/* ── Search Bar ── */}
      <FlightSearchBar
        from={from} setFrom={setFrom}
        to={to}     setTo={setTo}
        date={date} setDate={setDate}
        retDate={retDate} setRetDate={setRetDate}
        adults={adults}   setAdults={setAdults}
        tripType={tripType} setTripType={setTripType}
        onSearch={doSearch} loading={loading}
        showTripType
      />

      {/* ── Status banner ── */}
      {!isAuthenticated && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-500/20">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <Info className="h-3.5 w-3.5 flex-shrink-0"/>
            Search is free. Login required to book — choose Customer or Agent at booking time.
          </div>
        </div>
      )}
      {isAuthenticated && role==="agent" && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-500/20">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0"/>
            Agent Mode — Booking will go through B2B portal (wallet deduction)
          </div>
        </div>
      )}

      {/* ── Results ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {searched && !loading && flights.length > 0 ? (
          <div className="flex gap-5">
            {/* Filter sidebar */}
            <div className="w-56 flex-shrink-0 hidden lg:block">
              <FlightFilters
                flights={flights}
                sortBy={sortBy}         setSortBy={setSortBy}
                filterStop={filterStop} setFilterStop={setFilterStop}
                filterRef={filterRef}   setFilterRef={setFilterRef}
                hasFilters={hasFilters} onClear={()=>{setFilterStop("all");setFilterRef("all");}}
              />
            </div>

            {/* Flight list */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{filtered.length}</span> flight{filtered.length!==1?"s":""} ·{" "}
                    <span className="font-semibold text-foreground">{from} → {to}</span>
                    {filtered.length!==flights.length&&<span className="text-muted-foreground"> ({flights.length} total)</span>}
                  </p>
                  {customCount>0&&(
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-500"/>
                      {customCount} Tramps Aviation special fare{customCount!==1?"s":""}
                    </p>
                  )}
                </div>
                {/* Mobile sort */}
                <div className="flex gap-1 bg-card border border-border p-1 rounded-xl shadow-sm lg:hidden">
                  {[["price","Cheapest"],["departure","Earliest"],["duration","Fastest"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setSortBy(v)}
                      className={cn("text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all",
                        sortBy===v?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>{l}</button>
                  ))}
                </div>
              </div>

              {filtered.length===0 && (
                <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                  <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                  <p className="font-semibold text-foreground mb-1">No flights match your filters or seat requirement</p>
                  <button onClick={()=>{setFilterStop("all");setFilterRef("all");}} className="text-primary hover:underline text-sm mt-2">Clear filters</button>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map((f,i)=>(
                  <FlightCard key={f.id||f.resultToken||i} flight={f} adults={adults} onBook={()=>handleBook(f)}/>
                ))}
              </div>

              {/* Trust badges */}
              {filtered.length>0&&(
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
        ):(
          <div className="max-w-4xl mx-auto">
            {/* Loading */}
            {loading&&(
              <div className="space-y-3">
                {[1,2,3,4].map(n=>(
                  <div key={n} className="bg-card border border-border rounded-2xl p-5 animate-pulse shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-muted rounded-xl"/>
                      <div className="flex-1 space-y-2"><div className="h-6 w-48 bg-muted rounded"/><div className="h-3 w-32 bg-muted rounded"/></div>
                      <div className="space-y-2 text-right"><div className="h-7 w-24 bg-muted rounded"/><div className="h-9 w-24 bg-muted rounded-xl"/></div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin"/>Searching best fares…
                </p>
              </div>
            )}
            {!loading&&!searched&&(
              <div className="text-center py-28">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Plane className="h-10 w-10 text-primary"/>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Find Your Flight</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">Enter origin, destination and date above to search flights</p>
              </div>
            )}
            {searched&&!loading&&flights.length===0&&(
              <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                <p className="font-semibold text-foreground mb-1">No flights found</p>
                <p className="text-muted-foreground text-sm">Try different dates or routes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground"/>
      </div>
    }>
      <FlightsContent/>
    </Suspense>
  );
}
