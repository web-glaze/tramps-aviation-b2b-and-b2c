"use client";

import { useState } from "react";
import Link from "next/link";
import { Hotel, Search, Star, MapPin, Wifi, RefreshCcw, LogIn } from "lucide-react";
import { hotelsApi, unwrap } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const MOCK_HOTELS = [
  { id: "H1", name: "Taj Mahal Palace",     city: "Mumbai", stars: 5, price: 12000, rating: 4.8, reviews: 2341, image: "🏰", amenities: ["Pool","Spa","Gym","Restaurant"] },
  { id: "H2", name: "The Leela Palace",     city: "Delhi",  stars: 5, price: 15000, rating: 4.9, reviews: 1892, image: "🏛️", amenities: ["Pool","Spa","Concierge"] },
  { id: "H3", name: "ITC Maratha",          city: "Mumbai", stars: 5, price: 9500,  rating: 4.7, reviews: 3102, image: "🏨", amenities: ["Pool","Gym","Bar"] },
  { id: "H4", name: "Radisson Blu",         city: "Goa",    stars: 4, price: 6500,  rating: 4.5, reviews: 1456, image: "🌴", amenities: ["Beach","Pool","Restaurant"] },
  { id: "H5", name: "Courtyard Marriott",   city: "Bangalore", stars: 4, price: 4500, rating: 4.3, reviews: 987, image: "🏢", amenities: ["Gym","Restaurant","Wifi"] },
  { id: "H6", name: "Hyatt Regency",        city: "Delhi",  stars: 5, price: 11000, rating: 4.6, reviews: 2100, image: "✨", amenities: ["Pool","Spa","Gym","Bar"] },
];

export default function B2CHotelsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [city, setCity]       = useState("");
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms]       = useState("1");
  const [guests, setGuests]     = useState("2");
  const [hotels, setHotels]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!city) return toast.error("Enter city name");
    setLoading(true);
    setSearched(true);
    try {
      const citiesRes = await hotelsApi.searchCities(city);
      const data = unwrap(citiesRes) as any;
      const cities = data?.cities || data?.data || [];
      if (cities.length > 0) {
        const res = await hotelsApi.search({ cityCode: cities[0].code, checkIn, checkOut, rooms, adults: guests });
        const d = unwrap(res) as any;
        const list = d?.hotels || d?.data?.hotels || [];
        setHotels(list.length > 0 ? list : MOCK_HOTELS.filter(h => h.city.toLowerCase().includes(city.toLowerCase())));
      } else {
        const filtered = MOCK_HOTELS.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
        setHotels(filtered.length > 0 ? filtered : MOCK_HOTELS);
      }
    } catch {
      const filtered = MOCK_HOTELS.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
      setHotels(filtered.length > 0 ? filtered : MOCK_HOTELS);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (hotel: any) => {
    if (!isAuthenticated) {
      router.push(`/b2c/login?redirect=${encodeURIComponent("/b2c/hotels")}`);
      return;
    }
    toast.success(`Booking ${hotel.name}...`);
    router.push(`/b2c/booking/HT-${Date.now()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Search */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 bg-amber-500/15 rounded-2xl items-center justify-center mb-4">
          <Hotel className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Find Hotels</h1>
        <p className="text-muted-foreground text-sm">Best rates · Instant confirmation · Free cancellation on select rooms</p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-8">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">City / Destination</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Mumbai, Delhi, Goa…"
              className="w-full bg-muted text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-border placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Check-In</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              className="w-full bg-muted text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-border" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Check-Out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              className="w-full bg-muted text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500 border border-border" />
          </div>
          <div className="w-24">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Rooms</label>
            <select value={rooms} onChange={e => setRooms(e.target.value)}
              className="w-full bg-muted text-white rounded-xl px-3 py-3 text-sm outline-none border border-border">
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mb-1.5">Guests</label>
            <select value={guests} onChange={e => setGuests(e.target.value)}
              className="w-full bg-muted text-white rounded-xl px-3 py-3 text-sm outline-none border border-border">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} disabled={loading}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {!searched && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_HOTELS.map(h => <HotelCard key={h.id} hotel={h} onBook={handleBook} />)}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(n => (
            <div key={n} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-32 bg-muted rounded-xl mb-4" />
              <div className="h-5 w-3/4 bg-muted rounded mb-2" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {searched && !loading && hotels.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            <span className="text-white font-bold">{hotels.length}</span> hotels found
            {!isAuthenticated && <span className="ml-2 text-amber-400 text-xs">• Login to book</span>}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {hotels.map((h, i) => <HotelCard key={h.id || i} hotel={h} onBook={handleBook} />)}
          </div>
        </>
      )}
    </div>
  );
}

function HotelCard({ hotel, onBook }: { hotel: any; onBook: (h: any) => void }) {
  return (
    <div className="bg-card border border-border hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-amber-500/5 group">
      <div className="h-36 bg-gradient-to-br from-amber-900/30 to-slate-800 flex items-center justify-center text-5xl">
        {hotel.image || "🏨"}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-white text-sm leading-tight">{hotel.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5" /> {hotel.city}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({length: hotel.stars || 4}).map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        {hotel.amenities && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.slice(0,3).map((a: string) => (
              <span key={a} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{a}</span>
            ))}
          </div>
        )}
        {hotel.rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-lg">{hotel.rating}</span>
            <span className="text-xs text-muted-foreground">{hotel.reviews?.toLocaleString()} reviews</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-white">₹{(hotel.price || hotel.pricePerNight || 5000).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">per night</p>
          </div>
          <button onClick={() => onBook(hotel)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl text-xs transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
