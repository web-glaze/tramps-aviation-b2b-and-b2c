"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane, ArrowRight, Clock, Luggage, Search, RefreshCcw, X,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle, Users,
  Building2, Shield, Zap, Filter, SlidersHorizontal, ArrowLeftRight,
  Info, Star, Repeat2
} from "lucide-react";
import { flightsApi, customerApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

// ─── Trip type ────────────────────────────────────────────────────────────────
type TripType = "oneway" | "roundtrip";

// ─── Airline colors ───────────────────────────────────────────────────────────
const AIRLINE_COLOR: Record<string, string> = {
  "IndiGo":"bg-indigo-600","Air India":"bg-red-600","SpiceJet":"bg-orange-500",
  "Vistara":"bg-purple-600","Akasa Air":"bg-yellow-500","Go First":"bg-sky-500",
  "Air India Express":"bg-red-500","AirAsia":"bg-red-700","GoAir":"bg-sky-600",
};
const airlineColor = (name: string) => AIRLINE_COLOR[name] || "bg-slate-600";

// ─── Role Modal ───────────────────────────────────────────────────────────────
function RoleModal({ from, to, date, onClose }: { from:string; to:string; date:string; onClose:()=>void }) {
  const router = useRouter();
  const url = `/b2c/flights?from=${from}&to=${to}&date=${date}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-4 w-4"/></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plane className="h-7 w-7 text-blue-400"/>
          </div>
          <h3 className="font-bold text-xl text-white mb-1">How would you like to book?</h3>
          <p className="text-slate-400 text-sm">{from} → {to} · {date}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(url)}`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5 text-blue-400"/></div>
            <div className="flex-1"><p className="font-semibold text-sm text-white">Book as Customer</p><p className="text-xs text-slate-400">Personal travel · Pay by card / UPI</p></div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400"/>
          </button>
          <button onClick={() => router.push(`/b2b/login?redirect=${encodeURIComponent(`/b2b/flights?origin=${from}&destination=${to}&date=${date}`)}`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-amber-400"/></div>
            <div className="flex-1"><p className="font-semibold text-sm text-white">Book as Travel Agent</p><p className="text-xs text-slate-400">B2B portal · Wallet payment · Better rates</p></div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400"/>
          </button>
        </div>
        <p className="text-xs text-center text-slate-500 mt-4">Already have an account? <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(url)}`)} className="text-blue-400 hover:underline">Sign in</button></p>
      </div>
    </div>
  );
}

// ─── Booking Dialog ───────────────────────────────────────────────────────────
function BookingDialog({ flight, adults, from, to, date, onClose }: { flight:any; adults:number; from:string; to:string; date:string; onClose:()=>void }) {
  const router = useRouter();
  const [passengers, setPassengers] = useState(Array.from({length:adults}, ()=>({firstName:"",lastName:"",dob:"",gender:"M",passport:""})));
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep]   = useState<"details"|"confirming"|"done">("details");
  const [pnr,  setPnr]   = useState("");
  const [ref,  setRef]   = useState("");
  const total = (flight.price||0) * adults;

  const confirm = async () => {
    if (!email || !passengers.every(p=>p.firstName&&p.lastName)) { toast.error("Fill all passenger names and email"); return; }
    setStep("confirming");
    try {
      const res = await customerApi.initiateBooking({ resultToken:flight.resultToken||flight.id, tripType:"OneWay", adults, passengers:passengers.map(p=>({title:"Mr",firstName:p.firstName,lastName:p.lastName,dob:p.dob||"1990-01-01",gender:p.gender||"M",passportNo:p.passport||""})), contactEmail:email, contactPhone:phone });
      const d = unwrap(res) as any;
      setPnr(d?.pnr||d?.bookingRef||""); setRef(d?.bookingRef||"");
      setStep("done"); toast.success("Booking confirmed!");
    } catch(err:any) { toast.error(err?.response?.data?.message||"Booking failed"); setStep("details"); }
  };

  if (step==="done") return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80"/>
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl p-7 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-9 w-9 text-green-400"/></div>
        <h3 className="font-bold text-2xl text-white mb-1">Confirmed!</h3>
        {pnr && <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 mt-3 inline-block"><p className="text-xs text-green-400 mb-0.5">PNR</p><p className="font-mono font-bold text-lg text-green-300">{pnr}</p></div>}
        {ref && <p className="text-xs text-slate-500 mt-1 mb-3">Ref: {ref}</p>}
        <p className="text-sm text-slate-400 mb-5">E-ticket sent to <span className="text-white">{email}</span></p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-sm font-medium">Close</button>
          <button onClick={()=>router.push("/b2c/my-trips")} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold">My Trips</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={step==="details"?onClose:undefined}/>
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0f172a] border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div><h3 className="font-bold text-white text-lg">Confirm Booking</h3><p className="text-xs text-slate-400">{flight.airline} · {flight.flightNo} · {from} → {to}</p></div>
          {step==="details" && <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4"/></button>}
        </div>
        <div className="p-5 space-y-5">
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-700/50">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Fare × {adults} pax</span><span className="text-white">₹{((flight.price||0)*adults).toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Taxes & fees</span><span className="text-white">Included</span></div>
            <div className="flex justify-between font-bold border-t border-slate-700 pt-2"><span className="text-white">Total</span><span className="text-blue-400 text-lg">₹{total.toLocaleString()}</span></div>
            <p className="text-xs text-slate-500 flex gap-3 pt-1"><span>{flight.checkinBaggage||"15 KG"} check-in</span><span>{flight.cabinBaggage||"7 KG"} cabin</span></p>
          </div>
          {passengers.map((p,i)=>(
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold text-white">Passenger {i+1}</p>
              <div className="grid grid-cols-2 gap-3">
                {[["First Name *","firstName"],["Last Name *","lastName"]].map(([lbl,k])=>(
                  <div key={k}><label className="text-xs text-slate-400 block mb-1">{lbl}</label>
                  <input value={(p as any)[k]} onChange={e=>{const n=[...passengers];(n[i] as any)[k]=e.target.value;setPassengers(n)}} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder={lbl.replace(" *","")}/></div>
                ))}
                <div><label className="text-xs text-slate-400 block mb-1">Date of Birth</label><input type="date" value={p.dob} onChange={e=>{const n=[...passengers];n[i].dob=e.target.value;setPassengers(n)}} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"/></div>
                <div><label className="text-xs text-slate-400 block mb-1">Gender</label><select value={p.gender} onChange={e=>{const n=[...passengers];n[i].gender=e.target.value;setPassengers(n)}} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"><option value="M">Male</option><option value="F">Female</option></select></div>
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Contact Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-400 block mb-1">Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder="you@email.com"/></div>
              <div><label className="text-xs text-slate-400 block mb-1">Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500" placeholder="+91 98765 43210"/></div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5"><Info className="h-3 w-3"/>E-ticket sent to your email</p>
          </div>
          <button onClick={confirm} disabled={step==="confirming"} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            {step==="confirming" ? <><RefreshCcw className="h-4 w-4 animate-spin"/>Confirming…</> : <>Confirm & Pay ₹{total.toLocaleString()} <ArrowRight className="h-4 w-4"/></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Flight Card — vertical format ───────────────────────────────────────────
function FlightCard({ flight, adults, onBook }: { flight:any; adults:number; onBook:()=>void }) {
  const [exp, setExp] = useState(false);
  const isCustom = flight.source==="CUSTOM"||flight.resultToken?.startsWith("TRAMPS-");
  const price = (() => {
    const p = flight.price;
    if (typeof p === 'number' && p > 0) return p;
    if (typeof p === 'object' && p !== null) return p.total || p.grandTotal || 0;
    return flight.fare?.total || flight.fare?.totalFare || 0;
  })();
  const code  = flight.airlineCode || "?";
  const color = airlineColor(flight.airline);

  return (
    <div className={`bg-[#0f172a] border rounded-2xl overflow-hidden transition-all duration-200
      ${isCustom?"border-amber-500/40 shadow-amber-500/5 shadow-lg":"border-slate-700/80 hover:border-slate-600"}`}>

      {isCustom && (
        <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center gap-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0"/>
          <span className="text-xs font-semibold text-amber-400">Tramps Aviation Ticket — {flight.airline}</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Main row */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Airline */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 w-14">
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm`}>{code}</div>
            <p className="text-[10px] text-slate-500 font-mono text-center leading-tight">{flight.flightNo}</p>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-white">{flight.departure||"—"}</p>
              <p className="text-xs font-bold text-slate-400">{flight.from}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
              <p className="text-[10px] text-slate-500">{flight.duration||"—"}</p>
              <div className="flex items-center w-full gap-1">
                <div className="flex-1 h-px bg-slate-700"/>
                <Plane className="h-3 w-3 text-slate-600"/>
                <div className="flex-1 h-px bg-slate-700"/>
              </div>
              <p className="text-[10px] text-slate-500">{flight.stops===0?"Non-stop":`${flight.stops} stop`}</p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-white">{flight.arrival||"—"}</p>
              <p className="text-xs font-bold text-slate-400">{flight.to}</p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] text-slate-500">per person</p>
            <p className={`text-2xl font-black ${isCustom?"text-amber-400":"text-white"}`}>₹{price.toLocaleString()}</p>
            {adults>1 && <p className="text-[10px] text-blue-400">Total ₹{(price*adults).toLocaleString()}</p>}
            <p className={`text-[10px] mt-0.5 ${flight.refundable?"text-green-400":"text-slate-500"}`}>
              {flight.refundable?"✓ Refundable":"Non-refundable"}
            </p>
            <button onClick={onBook}
              className={`mt-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                ${isCustom?"bg-amber-500 hover:bg-amber-400 text-black":"bg-blue-600 hover:bg-blue-500 text-white"}`}>
              Book Now
            </button>
          </div>
        </div>

        {/* Quick strip */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1 text-[11px] text-slate-500"><Luggage className="h-3 w-3"/>{flight.checkinBaggage||"15 KG"} check-in</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500"><Luggage className="h-3 w-3"/>{flight.cabinBaggage||"7 KG"} cabin</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500"><Clock className="h-3 w-3"/>{flight.duration||"—"}</span>
          <span className="text-[11px] text-slate-500 ml-auto">{flight.airline}</span>
          <button onClick={()=>setExp(e=>!e)} className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
            {exp?"Hide":"Details"} {exp?<ChevronUp className="h-3 w-3"/>:<ChevronDown className="h-3 w-3"/>}
          </button>
        </div>

        {exp && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[["Flight",flight.flightNo],["Class",flight.cabinClass||"Economy"],["Stops",flight.stops===0?"Non-stop":`${flight.stops} stop`],["Refund",flight.refundable?"Refundable":"Non-refundable"]].map(([k,v])=>(
              <div key={k} className="bg-slate-800/60 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{k}</p>
                <p className={`text-sm font-bold ${k==="Refund"?(flight.refundable?"text-green-400":"text-red-400"):"text-white"}`}>{v}</p>
              </div>
            ))}
            {flight.notes && <div className="col-span-2 sm:col-span-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3"><p className="text-xs text-amber-400">{flight.notes}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Left Filter Panel ────────────────────────────────────────────────────────
function FilterPanel({ flights, filterStop, setFilterStop, filterRef, setFilterRef, sortBy, setSortBy, onClear, hasFilters }:any) {
  const getPrice = (f:any) => {
    const p = f.price;
    if (typeof p === 'number' && p > 0) return p;
    if (typeof p === 'object' && p) return p.total||p.grandTotal||0;
    return f.fare?.total||f.fare?.totalFare||0;
  };
  const minP = flights.length > 0 ? Math.min(...flights.map(getPrice).filter(Boolean)) : 0;
  const maxP = flights.length > 0 ? Math.max(...flights.map(getPrice)) : 0;

  return (
    <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-4 space-y-5 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-white text-sm flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-blue-400"/>Filters</p>
        {hasFilters && <button onClick={onClear} className="text-xs text-blue-400 hover:underline">Clear all</button>}
      </div>

      {/* Price range info */}
      {flights.length > 0 && (
        <div className="bg-slate-800/60 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Price Range</p>
          <p className="text-sm text-white font-bold">₹{minP.toLocaleString()} — ₹{maxP.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">per person</p>
        </div>
      )}

      {/* Sort */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Sort by</p>
        <div className="space-y-1">
          {[["price","💰 Cheapest first"],["departure","🕐 Earliest first"],["duration","⚡ Fastest first"]].map(([v,l])=>(
            <button key={v} onClick={()=>setSortBy(v)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium
                ${sortBy===v?"bg-blue-600 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Stops</p>
        <div className="space-y-1">
          {[["all","Any stops"],["0","Non-stop only"],["1","1 stop"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilterStop(v)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2
                ${filterStop===v?"bg-blue-600 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              {filterStop===v && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}
            </button>
          ))}
        </div>
      </div>

      {/* Refund */}
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Refund Policy</p>
        <div className="space-y-1">
          {[["all","Any"],["yes","Refundable only"],["no","Non-refundable"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilterRef(v)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2
                ${filterRef===v?"bg-blue-600 text-white":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
              {filterRef===v && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}
            </button>
          ))}
        </div>
      </div>

      {/* Airlines */}
      {flights.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Airlines</p>
          <div className="space-y-1">
            {Array.from(new Set<string>(flights.map((f:any)=>f.airline).filter(Boolean))).slice(0,6).map((airline:string)=>{
              const count = flights.filter((f:any)=>f.airline===airline).length;
              const minFare = Math.min(...flights.filter((f:any)=>f.airline===airline).map(getPrice).filter(Boolean));
              return (
                <div key={airline} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className={`${airlineColor(airline)} w-5 h-5 rounded text-white font-black text-[9px] flex items-center justify-center flex-shrink-0`}>
                      {(airline||"?")[0]}
                    </div>
                    <p className="text-xs text-slate-300 font-medium leading-tight">{airline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-blue-400 font-semibold">₹{minFare.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-600">{count} flight{count!==1?"s":""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function FlightsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  // Search state
  const [tripType, setTripType] = useState<TripType>((searchParams.get("tripType") as TripType)||"oneway");
  const [from,   setFrom]   = useState((searchParams.get("from")   ||"DEL").toUpperCase());
  const [to,     setTo]     = useState((searchParams.get("to")     ||"BOM").toUpperCase());
  const [date,   setDate]   = useState(searchParams.get("date")    ||"");
  const [retDate,setRetDate]= useState(searchParams.get("retDate") ||"");
  const [adults, setAdults] = useState(parseInt(searchParams.get("adults")||"1"));

  // Results
  const [flights,  setFlights]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  // Filters
  const [sortBy,     setSortBy]     = useState("price");
  const [filterStop, setFilterStop] = useState<"all"|"0"|"1">("all");
  const [filterRef,  setFilterRef]  = useState<"all"|"yes"|"no">("all");

  // Modals
  const [roleModal,    setRoleModal]     = useState(false);
  const [bookingFlight,setBookingFlight] = useState<any>(null);

  useEffect(() => {
    if (!date) { const d=new Date(); d.setDate(d.getDate()+1); setDate(d.toISOString().split("T")[0]); }
    if (searchParams.get("from") && searchParams.get("to") && searchParams.get("date")) {
      doSearch(searchParams.get("from")!, searchParams.get("to")!, searchParams.get("date")!);
    }
  }, []);

  const swapFromTo = () => { setFrom(to); setTo(from); };

  const doSearch = async (f=from, t=to, d=date) => {
    if (!f||!t) { toast.error("Enter origin and destination"); return; }
    if (!d)     { toast.error("Select a travel date"); return; }
    setLoading(true); setSearched(true); setFlights([]);
    try {
      const res  = await flightsApi.search({ origin:f.toUpperCase(), destination:t.toUpperCase(), departureDate:d, adults, tripType:tripType==="roundtrip"?"RoundTrip":"OneWay", returnDate:tripType==="roundtrip"?retDate:undefined });
      const data = (res as any).data as any;
      setFlights(data?.flights||[]);
    } catch { toast.error("Search failed — please try again"); }
    finally { setLoading(false); }
  };

  const handleBook = (flight:any) => {
    if (isAuthenticated && role==="agent") { router.push(`/b2b/flights?origin=${from}&destination=${to}&date=${date}`); return; }
    if (isAuthenticated) { setBookingFlight(flight); return; }
    setRoleModal(true);
  };

  const filtered = flights.filter(f=>{
    if (filterStop==="0" && f.stops!==0) return false;
    if (filterStop==="1" && f.stops===0) return false;
    if (filterRef==="yes" && !f.refundable) return false;
    if (filterRef==="no"  &&  f.refundable) return false;
    return true;
  }).sort((a,b)=>{
    if (sortBy==="price") {
      const pa = typeof a.price==='number'?a.price:(typeof a.price==='object'&&a.price?a.price.total||0:a.fare?.total||0);
      const pb = typeof b.price==='number'?b.price:(typeof b.price==='object'&&b.price?b.price.total||0:b.fare?.total||0);
      return pa-pb;
    }
    if (sortBy==="departure") return (a.departure||"").localeCompare(b.departure||"");
    if (sortBy==="duration")  return (a.duration||"").localeCompare(b.duration||"");
    return 0;
  });

  const hasFilters = filterStop!=="all"||filterRef!=="all";
  const customCount = flights.filter(f=>f.source==="CUSTOM"||f.resultToken?.startsWith("TRAMPS-")).length;

  return (
    <>
      {roleModal    && <RoleModal from={from} to={to} date={date} onClose={()=>setRoleModal(false)}/>}
      {bookingFlight && <BookingDialog flight={bookingFlight} adults={adults} from={from} to={to} date={date} onClose={()=>setBookingFlight(null)}/>}

      <div className="min-h-screen bg-[#060e1e]">
        {/* ── Search Bar ── */}
        <div className="bg-gradient-to-b from-[#0a1628] to-[#060e1e] border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-6">

            {/* Trip type toggle */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
                {([["oneway","One Way"],["roundtrip","Round Trip"]] as const).map(([v,l])=>(
                  <button key={v} onClick={()=>setTripType(v)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${tripType===v?"bg-blue-600 text-white":"text-slate-400 hover:text-white"}`}>
                    {v==="roundtrip" && <Repeat2 className="h-3.5 w-3.5"/>}{l}
                  </button>
                ))}
              </div>
              {!isAuthenticated && <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">Login required to book</span>}
            </div>

            {/* Search form */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className={`grid gap-3 ${tripType==="roundtrip"?"grid-cols-2 sm:grid-cols-3 lg:grid-cols-6":"grid-cols-2 sm:grid-cols-4 lg:grid-cols-5"}`}>
                {/* From */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">From</label>
                  <input value={from} onChange={e=>setFrom(e.target.value.toUpperCase())} maxLength={3} placeholder="DEL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white font-black text-xl tracking-widest text-center uppercase outline-none focus:border-blue-500 transition-all"/>
                </div>

                {/* Swap + To */}
                <div className="relative">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">To</label>
                  <div className="relative">
                    <input value={to} onChange={e=>setTo(e.target.value.toUpperCase())} maxLength={3} placeholder="BOM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white font-black text-xl tracking-widest text-center uppercase outline-none focus:border-blue-500 transition-all"/>
                    <button onClick={swapFromTo}
                      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hidden sm:flex">
                      <ArrowLeftRight className="h-3 w-3 text-white"/>
                    </button>
                  </div>
                </div>

                {/* Depart */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Departure</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all"/>
                </div>

                {/* Return date (only roundtrip) */}
                {tripType==="roundtrip" && (
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Return</label>
                    <input type="date" value={retDate} onChange={e=>setRetDate(e.target.value)} min={date||new Date().toISOString().split("T")[0]}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all"/>
                  </div>
                )}

                {/* Adults */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Adults</label>
                  <input type="number" value={adults} min={1} max={9} onChange={e=>setAdults(parseInt(e.target.value)||1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white font-bold text-xl text-center outline-none focus:border-blue-500 transition-all"/>
                </div>

                {/* Search button */}
                <div className={`flex items-end ${tripType==="roundtrip"?"col-span-2 sm:col-span-3 lg:col-span-1":""}`}>
                  <button onClick={()=>doSearch()} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 h-[50px] transition-all">
                    {loading?<RefreshCcw className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}
                    {loading?"Searching…":"Search"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results layout: left filter panel + right results ── */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {searched && !loading && flights.length > 0 ? (
            <div className="flex gap-5">
              {/* ── LEFT: Filter panel (always visible, sticky) ── */}
              <div className="w-56 flex-shrink-0 hidden lg:block">
                <FilterPanel
                  flights={flights}
                  filterStop={filterStop} setFilterStop={setFilterStop}
                  filterRef={filterRef}   setFilterRef={setFilterRef}
                  sortBy={sortBy}         setSortBy={setSortBy}
                  hasFilters={hasFilters}
                  onClear={()=>{setFilterStop("all");setFilterRef("all");}}
                />
              </div>

              {/* ── RIGHT: Results ── */}
              <div className="flex-1 min-w-0">
                {/* Results header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-slate-400">
                      <span className="font-bold text-white">{filtered.length}</span> flight{filtered.length!==1?"s":""} · <span className="font-semibold text-white">{from} → {to}</span>
                      {filtered.length!==flights.length && <span className="text-slate-500"> ({flights.length} total)</span>}
                    </p>
                    {customCount>0 && <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5"><Star className="h-3 w-3 fill-amber-400"/>{customCount} special fare{customCount!==1?"s":""}</p>}
                  </div>

                  {/* Mobile sort */}
                  <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 lg:hidden">
                    {[["price","Cheapest"],["departure","Earliest"],["duration","Fastest"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setSortBy(v)} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${sortBy===v?"bg-blue-600 text-white":"text-slate-400 hover:text-white"}`}>{l}</button>
                    ))}
                  </div>

                  {/* Mobile filter toggle */}
                  <button onClick={()=>{}} className="lg:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-slate-700/50 bg-slate-800/60 text-slate-400">
                    <Filter className="h-3.5 w-3.5"/>Filters {hasFilters && <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{(filterStop!=="all"?1:0)+(filterRef!=="all"?1:0)}</span>}
                  </button>
                </div>

                {/* No results after filter */}
                {filtered.length===0 && (
                  <div className="text-center py-12 bg-[#0f172a] border border-slate-800 rounded-2xl">
                    <Filter className="h-8 w-8 text-slate-600 mx-auto mb-3"/>
                    <p className="font-semibold text-white mb-1">No flights match your filters</p>
                    <button onClick={()=>{setFilterStop("all");setFilterRef("all");}} className="text-blue-400 hover:underline text-sm mt-2">Clear filters</button>
                  </div>
                )}

                {/* Flight cards */}
                <div className="space-y-3">
                  {filtered.map((f,i)=>(
                    <FlightCard key={f.id||f.resultToken||i} flight={f} adults={adults} onBook={()=>handleBook(f)}/>
                  ))}
                </div>

                {/* Trust bar */}
                {filtered.length>0 && (
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[[Shield,"Secure Booking","SSL encrypted"],[Zap,"Instant Confirmation","E-ticket in seconds"],[CheckCircle,"24/7 Support","Always here"]].map(([Icon,t,s]:any)=>(
                      <div key={t} className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-center">
                        <Icon className="h-5 w-5 text-blue-400 mx-auto mb-1.5"/>
                        <p className="text-xs font-semibold text-white">{t}</p>
                        <p className="text-[10px] text-slate-500">{s}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Loading */}
              {loading && (
                <div className="space-y-3">
                  {[1,2,3,4].map(n=>(
                    <div key={n} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 animate-pulse">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-slate-800 rounded-xl"/>
                        <div className="flex-1 space-y-2"><div className="h-6 w-48 bg-slate-800 rounded"/><div className="h-3 w-32 bg-slate-800 rounded"/></div>
                        <div className="space-y-2 text-right"><div className="h-8 w-24 bg-slate-800 rounded"/><div className="h-9 w-24 bg-slate-800 rounded-xl"/></div>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-sm text-slate-500 flex items-center justify-center gap-2 mt-3"><RefreshCcw className="h-3.5 w-3.5 animate-spin"/>Searching best fares…</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && !searched && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5"><Plane className="h-10 w-10 text-blue-400"/></div>
                  <h2 className="text-2xl font-bold text-white mb-2">Find Your Flight</h2>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">Enter origin, destination and date to search</p>
                </div>
              )}

              {/* No results */}
              {searched && !loading && flights.length===0 && (
                <div className="text-center py-12 bg-[#0f172a] border border-slate-800 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-3"/>
                  <p className="font-semibold text-white mb-1">No flights found</p>
                  <p className="text-slate-500 text-sm">Try different dates or routes</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function B2CFlightsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#060e1e]"><RefreshCcw className="h-5 w-5 animate-spin text-slate-500"/></div>}>
      <FlightsContent/>
    </Suspense>
  );
}
