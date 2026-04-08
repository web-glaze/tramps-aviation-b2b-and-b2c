"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Hotel, Search, Star, MapPin, Wifi, RefreshCcw, X,
  Users, Building2, ArrowRight, Coffee, Dumbbell, Waves,
  CheckCircle, ChevronDown, ChevronUp, SlidersHorizontal,
  Shield, Info, Filter
} from "lucide-react";
import { hotelsApi, customerApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const CITIES = ["Mumbai","Delhi","Goa","Bangalore","Chennai","Kolkata","Hyderabad","Jaipur","Pune","Kochi","Chandigarh","Ahmedabad"];

const AMENITY_ICON: Record<string,any> = {
  "WiFi": Wifi, "Pool": Waves, "Gym": Dumbbell, "Restaurant": Coffee,
  "Spa": Star, "Beach": Waves, "Bar": Coffee, "Concierge": Star,
};

const FALLBACK_HOTELS = [
  { id:"H1", name:"Taj Mahal Palace",   city:"Mumbai",    stars:5, pricePerNight:12000, price:12000, rating:4.8, reviews:2341, amenities:["WiFi","Pool","Spa","Restaurant"], cancellation:"FREE_CANCELLATION", mealPlan:"BREAKFAST_INCLUDED", resultToken:"MOCK-H1" },
  { id:"H2", name:"The Leela Palace",   city:"Delhi",     stars:5, pricePerNight:15000, price:15000, rating:4.9, reviews:1892, amenities:["WiFi","Pool","Spa","Concierge"],  cancellation:"FREE_CANCELLATION", mealPlan:"ROOM_ONLY",           resultToken:"MOCK-H2" },
  { id:"H3", name:"ITC Maratha",        city:"Mumbai",    stars:5, pricePerNight:9500,  price:9500,  rating:4.7, reviews:3102, amenities:["WiFi","Pool","Gym","Bar"],        cancellation:"NON_REFUNDABLE",    mealPlan:"BREAKFAST_INCLUDED", resultToken:"MOCK-H3" },
  { id:"H4", name:"Radisson Blu",       city:"Goa",       stars:4, pricePerNight:6500,  price:6500,  rating:4.5, reviews:1456, amenities:["WiFi","Beach","Pool","Restaurant"],cancellation:"FREE_CANCELLATION", mealPlan:"BREAKFAST_INCLUDED", resultToken:"MOCK-H4" },
  { id:"H5", name:"Courtyard Marriott", city:"Bangalore", stars:4, pricePerNight:4500,  price:4500,  rating:4.3, reviews:987,  amenities:["WiFi","Gym","Restaurant"],        cancellation:"FREE_CANCELLATION", mealPlan:"ROOM_ONLY",           resultToken:"MOCK-H5" },
  { id:"H6", name:"Hyatt Regency",      city:"Delhi",     stars:5, pricePerNight:11000, price:11000, rating:4.6, reviews:2100, amenities:["WiFi","Pool","Spa","Gym","Bar"],   cancellation:"NON_REFUNDABLE",    mealPlan:"BREAKFAST_INCLUDED", resultToken:"MOCK-H6" },
  { id:"H7", name:"Lemon Tree Premier", city:"Chennai",   stars:4, pricePerNight:3800,  price:3800,  rating:4.1, reviews:654,  amenities:["WiFi","Pool","Restaurant"],        cancellation:"FREE_CANCELLATION", mealPlan:"ROOM_ONLY",           resultToken:"MOCK-H7" },
  { id:"H8", name:"Holiday Inn",        city:"Jaipur",    stars:4, pricePerNight:5200,  price:5200,  rating:4.2, reviews:1234, amenities:["WiFi","Pool","Gym"],              cancellation:"FREE_CANCELLATION", mealPlan:"BREAKFAST_INCLUDED", resultToken:"MOCK-H8" },
];

// ─── Role Modal ───────────────────────────────────────────────────────────────
function RoleModal({ city, checkIn, checkOut, onClose }: { city:string; checkIn:string; checkOut:string; onClose:()=>void }) {
  const router = useRouter();
  const url    = `/b2c/hotels?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="h-4 w-4"/></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Hotel className="h-7 w-7 text-blue-400"/>
          </div>
          <h3 className="font-bold text-xl text-white mb-1">Login to Book Hotel</h3>
          <p className="text-slate-400 text-sm">{city} · {checkIn} → {checkOut}</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(url)}`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5 text-blue-400"/></div>
            <div className="flex-1"><p className="font-semibold text-sm text-white">Book as Customer</p><p className="text-xs text-slate-400">Personal travel · Pay online</p></div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400"/>
          </button>
          <button onClick={() => router.push(`/b2b/login?redirect=${encodeURIComponent(`/b2b/hotels?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}`)}`)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-amber-400"/></div>
            <div className="flex-1"><p className="font-semibold text-sm text-white">Book as Travel Agent</p><p className="text-xs text-slate-400">B2B portal · Wallet payment · Better rates</p></div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400"/>
          </button>
        </div>
        <p className="text-xs text-center text-slate-500 mt-4">
          Already have an account?{" "}
          <button onClick={() => router.push(`/b2c/login?redirect=${encodeURIComponent(url)}`)} className="text-blue-400 hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}

// ─── Hotel Card ───────────────────────────────────────────────────────────────
function HotelCard({ hotel, nights, onBook }: { hotel:any; nights:number; onBook:()=>void }) {
  const [exp, setExp] = useState(false);
  const ppn   = hotel.pricePerNight || hotel.price || 0;
  const total = ppn * Math.max(nights, 1);
  const free  = hotel.cancellation === "FREE_CANCELLATION";
  const stars = hotel.stars || 3;

  return (
    <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Image placeholder with stars */}
          <div className="w-full sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
            <Hotel className="h-8 w-8 text-slate-500 mb-1"/>
            <div className="flex">{Array.from({length:stars}).map((_,i)=><Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400"/>)}</div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h3 className="font-bold text-white text-base leading-tight">{hotel.name}</h3>
              {free && <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Free cancellation</span>}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3"/>{hotel.city}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">{hotel.rating||"4.0"}</div>
              <div>
                <span className="text-xs font-semibold text-white">
                  {parseFloat(hotel.rating||"4")>=4.7?"Exceptional":parseFloat(hotel.rating||"4")>=4.4?"Excellent":"Very Good"}
                </span>
                <span className="text-xs text-slate-500 ml-1">· {(hotel.reviews||0).toLocaleString()} reviews</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5">
              {(hotel.amenities||[]).slice(0,4).map((a:string)=>{
                const Icon = AMENITY_ICON[a] || Wifi;
                return <span key={a} className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                  <Icon className="h-2.5 w-2.5"/>{a}
                </span>;
              })}
              {(hotel.amenities||[]).length>4 && <span className="text-[10px] text-slate-500 px-2 py-1">+{(hotel.amenities||[]).length-4} more</span>}
            </div>
          </div>

          {/* Price & Book */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800 gap-3">
            <div className="sm:text-right">
              <p className="text-[10px] text-slate-500">per night</p>
              <p className="text-2xl font-black text-white">₹{ppn.toLocaleString()}</p>
              {nights>1 && <p className="text-xs text-blue-400 font-medium">₹{total.toLocaleString()} total · {nights} nights</p>}
              <p className="text-[10px] text-slate-500 mt-0.5">{hotel.mealPlan==="BREAKFAST_INCLUDED"?"Breakfast included":"Room only"}</p>
            </div>
            <button onClick={onBook}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 whitespace-nowrap">
              Book Now
            </button>
          </div>
        </div>

        {/* Expand */}
        <button onClick={()=>setExp(e=>!e)}
          className="mt-3 pt-3 w-full border-t border-slate-800 flex items-center justify-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
          {exp?"Hide details":"Show details"}
          {exp?<ChevronUp className="h-3 w-3"/>:<ChevronDown className="h-3 w-3"/>}
        </button>

        {exp && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Stars</p><p className="text-sm font-bold text-white">{stars} Star</p></div>
            <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Cancellation</p><p className={`text-sm font-bold ${free?"text-green-400":"text-red-400"}`}>{free?"Free":"Non-refundable"}</p></div>
            <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Meal Plan</p><p className="text-sm font-bold text-white">{hotel.mealPlan==="BREAKFAST_INCLUDED"?"Breakfast":"Room Only"}</p></div>
            <div className="bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total ({nights}N)</p><p className="text-sm font-bold text-white">₹{total.toLocaleString()}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function HotelsContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  const [city,     setCity]    = useState(searchParams.get("city")    || "");
  const [checkIn,  setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut]= useState(searchParams.get("checkOut")|| "");
  const [rooms,    setRooms]   = useState(searchParams.get("rooms")   || "1");

  const [hotels,   setHotels]  = useState<any[]>([]);
  const [loading,  setLoading] = useState(false);
  const [searched, setSearched]= useState(false);

  // Filters
  const [filterStar, setFilterStar] = useState<"all"|"5"|"4"|"3">("all");
  const [filterRef,  setFilterRef]  = useState<"all"|"free"|"non">("all");
  const [filterMeal, setFilterMeal] = useState<"all"|"yes"|"no">("all");
  const [sortBy,     setSortBy]     = useState<"price"|"rating">("price");
  const [showFilter, setShowFilter] = useState(false);

  // Modals
  const [roleModal,     setRoleModal]     = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000))
    : 1;

  useEffect(() => {
    if (!checkIn) { const d=new Date(); d.setDate(d.getDate()+1); setCheckIn(d.toISOString().split("T")[0]); }
    if (!checkOut){ const d=new Date(); d.setDate(d.getDate()+2); setCheckOut(d.toISOString().split("T")[0]); }
    if (searchParams.get("city") && searchParams.get("checkIn")) {
      doSearch(searchParams.get("city")!, searchParams.get("checkIn")!, searchParams.get("checkOut")||"");
    }
  }, []);

  const doSearch = async (c=city, ci=checkIn, co=checkOut) => {
    if (!c) return toast.error("Enter a city or destination");
    setLoading(true); setSearched(true); setHotels([]);
    try {
      const res  = await hotelsApi.search({ cityCode:c, city:c, checkIn:ci, checkOut:co, rooms:parseInt(rooms), nights });
      const data = (res as any).data as any;
      const list = data?.hotels || [];
      setHotels(list.length>0 ? list : FALLBACK_HOTELS.filter(h=>h.city.toLowerCase().includes(c.toLowerCase()) || c.length<3));
    } catch {
      setHotels(FALLBACK_HOTELS);
    } finally { setLoading(false); }
  };

  const handleBook = (hotel: any) => {
    if (isAuthenticated && role==="agent") { router.push("/b2b/hotels"); return; }
    if (isAuthenticated) { toast.info("Booking flow — confirm hotel booking"); return; }
    setSelectedHotel(hotel); setRoleModal(true);
  };

  const filtered = hotels.filter(h => {
    if (filterStar!=="all" && (h.stars||3)!==parseInt(filterStar)) return false;
    if (filterRef==="free" && h.cancellation!=="FREE_CANCELLATION") return false;
    if (filterRef==="non"  && h.cancellation==="FREE_CANCELLATION") return false;
    if (filterMeal==="yes" && h.mealPlan!=="BREAKFAST_INCLUDED") return false;
    if (filterMeal==="no"  && h.mealPlan==="BREAKFAST_INCLUDED") return false;
    return true;
  }).sort((a,b) => sortBy==="price" ? (a.pricePerNight||a.price||0)-(b.pricePerNight||b.price||0) : parseFloat(b.rating||"4")-parseFloat(a.rating||"4"));

  const hasFilters = filterStar!=="all"||filterRef!=="all"||filterMeal!=="all";
  const minPrice = hotels.length>0 ? Math.min(...hotels.map(h=>h.pricePerNight||h.price||0)) : 0;

  return (
    <>
      {roleModal && selectedHotel && <RoleModal city={city} checkIn={checkIn} checkOut={checkOut} onClose={()=>setRoleModal(false)}/>}

      <div className="min-h-screen bg-[#060e1e]">
        {/* Search Hero */}
        <div className="bg-gradient-to-b from-[#0a1628] to-[#060e1e] border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
              <Hotel className="h-5 w-5 text-blue-400"/>
              <span className="text-sm font-medium text-slate-400">Search Hotels</span>
              {!isAuthenticated && <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">Login required to book</span>}
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="col-span-2 sm:col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">City / Destination</label>
                  <div className="relative">
                    <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Mumbai, Goa, Delhi…"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all" list="city-list"/>
                    <datalist id="city-list">{CITIES.map(c=><option key={c} value={c}/>)}</datalist>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Check-in</label>
                  <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all"/>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Check-out</label>
                  <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} min={checkIn}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all"/>
                </div>
                <div className="flex items-end">
                  <button onClick={()=>doSearch()} disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all h-[50px]">
                    {loading?<RefreshCcw className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}
                    {loading?"Searching…":"Search"}
                  </button>
                </div>
              </div>
              {nights>1 && checkIn && checkOut && <p className="text-xs text-blue-400 mt-2 text-center">{nights} nights · {checkIn} → {checkOut}</p>}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(n=>(
                <div key={n} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-xl flex-shrink-0"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-slate-800 rounded"/>
                      <div className="h-3 w-24 bg-slate-800 rounded"/>
                      <div className="h-3 w-32 bg-slate-800 rounded"/>
                    </div>
                    <div className="space-y-2"><div className="h-8 w-28 bg-slate-800 rounded"/><div className="h-10 w-24 bg-slate-800 rounded-xl"/></div>
                  </div>
                </div>
              ))}
              <p className="text-center text-sm text-slate-500 flex items-center justify-center gap-2 mt-3"><RefreshCcw className="h-3.5 w-3.5 animate-spin"/>Searching best rates…</p>
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Hotel className="h-10 w-10 text-blue-400"/>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Find Your Hotel</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Enter a destination and dates to search available hotels</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {CITIES.slice(0,6).map(c=>(
                  <button key={c} onClick={()=>{setCity(c);doSearch(c,checkIn,checkOut)}}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 transition-all">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && searched && filtered.length>0 && (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-400">
                    <span className="font-bold text-white">{filtered.length}</span> hotel{filtered.length!==1?"s":""} in{" "}
                    <span className="font-semibold text-white">{city}</span>
                    {filtered.length!==hotels.length && <span className="text-slate-500"> (filtered from {hotels.length})</span>}
                  </p>
                  {minPrice>0 && <p className="text-xs text-slate-500 mt-0.5">From <span className="text-green-400 font-semibold">₹{minPrice.toLocaleString()}</span>/night</p>}
                </div>
                <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
                  {[["price","Cheapest"],["rating","Top Rated"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setSortBy(v as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${sortBy===v?"bg-blue-600 text-white":"text-slate-400 hover:text-white"}`}>{l}</button>
                  ))}
                </div>
                <button onClick={()=>setShowFilter(f=>!f)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all
                    ${hasFilters?"bg-blue-600/20 border-blue-500/50 text-blue-400":"bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white"}`}>
                  <SlidersHorizontal className="h-3.5 w-3.5"/>Filters
                  {hasFilters && <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{(filterStar!=="all"?1:0)+(filterRef!=="all"?1:0)+(filterMeal!=="all"?1:0)}</span>}
                </button>
              </div>

              {showFilter && (
                <div className="bg-[#0f172a] border border-slate-700/60 rounded-2xl p-4 mb-4 grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Stars</p>
                    <div className="flex flex-wrap gap-2">
                      {[["all","Any"],["5","5★"],["4","4★"],["3","3★"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setFilterStar(v as any)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${filterStar===v?"bg-blue-600 border-blue-600 text-white":"border-slate-700 text-slate-400 hover:border-slate-500"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Cancellation</p>
                    <div className="flex flex-wrap gap-2">
                      {[["all","Any"],["free","Free Cancel"],["non","Non-refundable"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setFilterRef(v as any)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${filterRef===v?"bg-blue-600 border-blue-600 text-white":"border-slate-700 text-slate-400 hover:border-slate-500"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-2">Meal Plan</p>
                    <div className="flex flex-wrap gap-2">
                      {[["all","Any"],["yes","Breakfast"],["no","Room Only"]].map(([v,l])=>(
                        <button key={v} onClick={()=>setFilterMeal(v as any)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${filterMeal===v?"bg-blue-600 border-blue-600 text-white":"border-slate-700 text-slate-400 hover:border-slate-500"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map((h,i)=><HotelCard key={h.id||h.resultToken||i} hotel={h} nights={nights} onBook={()=>handleBook(h)}/>)}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  [Shield,"Best Price","Price match guarantee"],
                  [CheckCircle,"Verified Hotels","Hand-picked properties"],
                  [Info,"Free Support","24/7 customer help"],
                ].map(([Icon,t,s]:any)=>(
                  <div key={t} className="bg-[#0f172a] border border-slate-800 rounded-xl p-3 text-center">
                    <Icon className="h-5 w-5 text-blue-400 mx-auto mb-1.5"/>
                    <p className="text-xs font-semibold text-white">{t}</p>
                    <p className="text-[10px] text-slate-500">{s}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {searched && !loading && filtered.length===0 && hotels.length>0 && (
            <div className="text-center py-12 bg-[#0f172a] border border-slate-800 rounded-2xl">
              <Filter className="h-8 w-8 text-slate-600 mx-auto mb-3"/>
              <p className="font-semibold text-white mb-1">No hotels match your filters</p>
              <button onClick={()=>{setFilterStar("all");setFilterRef("all");setFilterMeal("all")}} className="text-blue-400 hover:underline text-sm mt-2">Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function B2CHotelsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#060e1e]"><RefreshCcw className="h-5 w-5 animate-spin text-slate-500"/></div>}>
      <HotelsContent/>
    </Suspense>
  );
}