"use client";
/**
 * /hotels — Public hotel search (common for B2C + B2B)
 * B2C vs B2B detection at booking time only.
 */
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Hotel, Search, Star, MapPin, Wifi, RefreshCcw, X,
  Coffee, Dumbbell, Waves, CheckCircle, ChevronDown, ChevronUp,
  Shield, Info, ArrowRight, Users, Building2, AlertCircle
} from "lucide-react";
import { hotelsApi, customerApi, agentApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookingRoleModal } from "@/components/search/BookingRoleModal";

const CITIES = ["Mumbai","Delhi","Goa","Bangalore","Chennai","Kolkata","Hyderabad","Jaipur","Pune","Kochi"];
const AMENITY_ICON: Record<string,any> = {
  "WiFi":Wifi,"Pool":Waves,"Gym":Dumbbell,"Restaurant":Coffee,
  "Spa":Star,"Beach":Waves,"Bar":Coffee,"Concierge":Star,
};
const FALLBACK_HOTELS = [
  {id:"H1",name:"Taj Mahal Palace",city:"Mumbai",stars:5,pricePerNight:12000,rating:4.8,reviews:2341,amenities:["WiFi","Pool","Spa","Restaurant"],cancellation:"FREE_CANCELLATION",mealPlan:"BREAKFAST_INCLUDED",resultToken:"MOCK-H1"},
  {id:"H2",name:"The Leela Palace",city:"Delhi",stars:5,pricePerNight:15000,rating:4.9,reviews:1892,amenities:["WiFi","Pool","Spa","Concierge"],cancellation:"FREE_CANCELLATION",mealPlan:"ROOM_ONLY",resultToken:"MOCK-H2"},
  {id:"H3",name:"ITC Maratha",city:"Mumbai",stars:5,pricePerNight:9500,rating:4.7,reviews:3102,amenities:["WiFi","Pool","Gym","Bar"],cancellation:"NON_REFUNDABLE",mealPlan:"BREAKFAST_INCLUDED",resultToken:"MOCK-H3"},
  {id:"H4",name:"Radisson Blu",city:"Goa",stars:4,pricePerNight:6500,rating:4.5,reviews:1456,amenities:["WiFi","Beach","Pool","Restaurant"],cancellation:"FREE_CANCELLATION",mealPlan:"BREAKFAST_INCLUDED",resultToken:"MOCK-H4"},
  {id:"H5",name:"Courtyard Marriott",city:"Bangalore",stars:4,pricePerNight:4500,rating:4.3,reviews:987,amenities:["WiFi","Gym","Restaurant"],cancellation:"FREE_CANCELLATION",mealPlan:"ROOM_ONLY",resultToken:"MOCK-H5"},
  {id:"H6",name:"Hyatt Regency",city:"Delhi",stars:5,pricePerNight:11000,rating:4.6,reviews:2100,amenities:["WiFi","Pool","Spa","Gym"],cancellation:"NON_REFUNDABLE",mealPlan:"BREAKFAST_INCLUDED",resultToken:"MOCK-H6"},
  {id:"H7",name:"Lemon Tree Premier",city:"Chennai",stars:4,pricePerNight:3800,rating:4.1,reviews:654,amenities:["WiFi","Pool","Restaurant"],cancellation:"FREE_CANCELLATION",mealPlan:"ROOM_ONLY",resultToken:"MOCK-H7"},
  {id:"H8",name:"Holiday Inn",city:"Jaipur",stars:4,pricePerNight:5200,rating:4.2,reviews:1234,amenities:["WiFi","Pool","Gym"],cancellation:"FREE_CANCELLATION",mealPlan:"BREAKFAST_INCLUDED",resultToken:"MOCK-H8"},
];

function HotelCard({ hotel, nights, onBook }: { hotel:any; nights:number; onBook:()=>void }) {
  const [exp, setExp] = useState(false);
  const ppn   = hotel.pricePerNight || hotel.price || 0;
  const total = ppn * Math.max(nights, 1);
  const free  = hotel.cancellation === "FREE_CANCELLATION";
  const stars = hotel.stars || 3;
  const ratingNum = parseFloat(hotel.rating || "4");
  const ratingLabel = ratingNum >= 4.7 ? "Exceptional" : ratingNum >= 4.4 ? "Excellent" : "Very Good";

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image placeholder */}
          <div className="w-full sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-primary/15 via-primary/10 to-blue-500/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-primary/10">
            <Hotel className="h-8 w-8 text-primary/60 mb-1"/>
            <div className="flex">
              {Array.from({length:stars}).map((_,i)=>(
                <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400"/>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h3 className="font-bold text-foreground text-base leading-tight">{hotel.name}</h3>
              {free && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                  Free cancellation
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <MapPin className="h-3 w-3"/>{hotel.city}
            </p>
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-lg">
                {hotel.rating || "4.0"}
              </div>
              <span className="text-xs font-semibold text-foreground">{ratingLabel}</span>
              <span className="text-xs text-muted-foreground">· {(hotel.reviews||0).toLocaleString("en-IN")} reviews</span>
            </div>
            {/* Amenities */}
            <div className="flex flex-wrap gap-1.5">
              {(hotel.amenities||[]).slice(0,4).map((a:string) => {
                const Icon = AMENITY_ICON[a] || Wifi;
                return (
                  <span key={a} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-lg border border-border">
                    <Icon className="h-2.5 w-2.5"/>{a}
                  </span>
                );
              })}
              {(hotel.amenities||[]).length > 4 && (
                <span className="text-[10px] text-muted-foreground px-2 py-1">+{(hotel.amenities||[]).length-4} more</span>
              )}
            </div>
          </div>

          {/* Price & Book */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-border gap-3">
            <div className="sm:text-right">
              <p className="text-[10px] text-muted-foreground">per night</p>
              <p className="text-2xl font-black leading-tight" style={{color:"hsl(var(--brand-orange))"}}>
                ₹{ppn.toLocaleString("en-IN")}
              </p>
              {nights > 1 && (
                <p className="text-xs text-primary font-medium">₹{total.toLocaleString("en-IN")} · {nights} nights</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hotel.mealPlan === "BREAKFAST_INCLUDED" ? "Breakfast included" : "Room only"}
              </p>
            </div>
            <button onClick={onBook}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap shadow-sm"
              style={{background:"hsl(var(--brand-orange))"}}>
              Book Now
            </button>
          </div>
        </div>

        {/* Expand */}
        <button onClick={()=>setExp(e=>!e)}
          className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
          {exp ? "Hide details" : "Show details"}
          {exp ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
        </button>
        {exp && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Check-in", "2:00 PM"],["Check-out", "12:00 PM"],
              ["Cancellation", free?"Free":"Non-refundable"],
              ["Meal", hotel.mealPlan==="BREAKFAST_INCLUDED"?"Breakfast":"Room only"],
            ].map(([k,v])=>(
              <div key={k} className="bg-muted/60 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{k}</p>
                <p className={cn("text-sm font-bold",
                  k==="Cancellation" && free ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                )}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HotelsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  const [city,     setCity]     = useState(searchParams.get("city")     || "");
  const [checkIn,  setCheckIn]  = useState(searchParams.get("checkIn")  || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [rooms,    setRooms]    = useState(parseInt(searchParams.get("rooms") || "1"));

  const [hotels,   setHotels]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterStar, setFilterStar] = useState("all");
  const [roleModal, setRoleModal] = useState(false);
  const [bookHotel, setBookHotel] = useState<any>(null);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1;

  useEffect(()=>{
    const today = new Date().toISOString().split("T")[0];
    const tmr   = new Date(); tmr.setDate(tmr.getDate()+1);
    if (!checkIn)  setCheckIn(today);
    if (!checkOut) setCheckOut(tmr.toISOString().split("T")[0]);
    if (searchParams.get("city")) doSearch(searchParams.get("city")!);
  },[]);

  const doSearch = async (c=city) => {
    if (!c.trim()) { toast.error("Enter a city or destination"); return; }
    const params = new URLSearchParams({city:c,checkIn,checkOut,rooms:String(rooms)});
    window.history.replaceState(null,"",`/hotels?${params}`);
    setLoading(true); setSearched(true); setHotels([]);
    try {
      const res  = await hotelsApi.search({cityName:c,checkIn,checkOut,rooms,adults:rooms});
      const data = (res as any)?.data;
      const list = data?.hotels || data?.Hotels || (Array.isArray(data)?data:[]);
      setHotels(list.length > 0 ? list : FALLBACK_HOTELS.filter(h=>h.city.toLowerCase()===c.toLowerCase()));
    } catch {
      setHotels(FALLBACK_HOTELS.filter(h=>h.city.toLowerCase()===c.toLowerCase()));
    }
    setLoading(false);
  };

  const handleBook = (hotel: any) => {
    if (isAuthenticated && role === "agent") {
      // Agent — book inline with wallet deduction
      setBookHotel(hotel);
      return;
    }
    if (isAuthenticated) { setBookHotel(hotel); return; }
    setRoleModal(true);
  };

  const filtered = hotels.filter(h => filterStar === "all" || h.stars >= parseInt(filterStar));
  const currentUrl = `/hotels?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}`;

  return (
    <>
      {roleModal && (
        <BookingRoleModal
          b2cRedirectUrl={currentUrl}
          b2bRedirectUrl={`/b2b/login?redirect=${encodeURIComponent(`/hotels?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}`)}`}
          context={`Hotels in ${city} · ${checkIn} → ${checkOut}`}
          onClose={()=>setRoleModal(false)}
        />
      )}

      {/* Search bar */}
      <div className="search-hero">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="search-label">City / Destination</label>
              <div className="relative">
                <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Mumbai, Delhi, Goa…"
                  className="search-input w-full pr-8" list="city-list"/>
                <datalist id="city-list">{CITIES.map(c=><option key={c} value={c}/>)}</datalist>
              </div>
            </div>
            <div>
              <label className="search-label">Check-in</label>
              <input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]} className="search-input-date w-full"/>
            </div>
            <div>
              <label className="search-label">Check-out</label>
              <input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)}
                min={checkIn} className="search-input-date w-full"/>
            </div>
            <div className="flex flex-col">
              <label className="search-label">Rooms</label>
              <div className="flex gap-2 flex-1 items-end">
                <input type="number" value={rooms} min={1} max={9} onChange={e=>setRooms(parseInt(e.target.value)||1)}
                  className="search-input w-20 font-bold text-xl text-center flex-shrink-0"/>
                <button onClick={()=>doSearch()} disabled={loading}
                  className="flex-1 h-[50px] bg-white text-primary hover:bg-white/90 disabled:opacity-60 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
                  {loading?<RefreshCcw className="h-4 w-4 animate-spin"/>:<Search className="h-4 w-4"/>}
                  {loading?"Searching…":"Search"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {searched && !loading && hotels.length > 0 ? (
          <div className="flex gap-5">
            {/* Filter sidebar */}
            <div className="w-48 flex-shrink-0 hidden lg:block">
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm sticky top-20">
                <p className="text-sm font-bold text-foreground mb-4">Filters</p>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Star Rating</p>
                  <div className="space-y-1">
                    {[["all","Any rating"],["5","5 star"],["4","4 star+"],["3","3 star+"]].map(([v,l])=>(
                      <button key={v} onClick={()=>setFilterStar(v)}
                        className={cn("w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2",
                          filterStar===v?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}>
                        {filterStar===v&&<CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{filtered.length}</span> hotel{filtered.length!==1?"s":""} in{" "}
                  <span className="font-semibold text-foreground">{city}</span>
                </p>
                <div className="flex gap-1 bg-card border border-border p-1 rounded-xl lg:hidden">
                  {[["all","Any"],["5","5★"],["4","4★+"]].map(([v,l])=>(
                    <button key={v} onClick={()=>setFilterStar(v)}
                      className={cn("text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all",
                        filterStar===v?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.map((h,i)=>(
                  <HotelCard key={h.id||h.resultToken||i} hotel={h} nights={nights} onBook={()=>handleBook(h)}/>
                ))}
              </div>
            </div>
          </div>
        ):(
          <div className="max-w-3xl mx-auto">
            {loading && (
              <div className="space-y-3">
                {[1,2,3].map(n=>(
                  <div key={n} className="bg-card border border-border rounded-2xl p-5 animate-pulse shadow-sm h-32"/>
                ))}
                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin"/>Searching hotels…
                </p>
              </div>
            )}
            {!loading && !searched && (
              <div className="text-center py-28">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Hotel className="h-10 w-10 text-primary"/>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Find Hotels</h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">Enter a city and dates to search hotels</p>
              </div>
            )}
            {searched && !loading && hotels.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
                <p className="font-semibold text-foreground mb-1">No hotels found in {city}</p>
                <p className="text-muted-foreground text-sm">Try a different city or dates</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground"/></div>}>
      <HotelsContent/>
    </Suspense>
  );
}