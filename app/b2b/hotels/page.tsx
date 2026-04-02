"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TEXT, SPACING } from "@/config/design-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { hotelsApi } from "@/lib/api/services";
import { Hotel, Search, RefreshCcw, Star, ArrowRight, Wifi, Coffee } from "lucide-react";

const MOCK_HOTELS = [
  { id: "H1", name: "Taj Mahal Palace", city: "Mumbai", stars: 5, image: "🏰", price: 12000, amenities: ["Wifi", "Pool", "Gym", "Spa"], refundable: true, hotelCode: "TBO-H001" },
  { id: "H2", name: "ITC Maratha", city: "Mumbai", stars: 5, image: "🏛️", price: 8500, amenities: ["Wifi", "Pool", "Restaurant"], refundable: true, hotelCode: "TBO-H002" },
  { id: "H3", name: "The Leela Mumbai", city: "Mumbai", stars: 5, image: "🏨", price: 10000, amenities: ["Wifi", "Pool", "Gym", "Bar"], refundable: false, hotelCode: "TBO-H003" },
  { id: "H4", name: "Courtyard Marriott", city: "Mumbai", stars: 4, image: "🏢", price: 5500, amenities: ["Wifi", "Gym", "Restaurant"], refundable: true, hotelCode: "TBO-H004" },
];

export default function B2bHotelsPage() {
  const [form, setForm] = useState({
    city: "", cityCode: "115286", checkIn: "2025-03-20", checkOut: "2025-03-23",
    rooms: "1", adults: "2", minStarRating: "0",
  });
  const [hotels, setHotels] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cityQuery, setCityQuery] = useState("Mumbai");

  const handleSearch = async () => {
    if (!form.checkIn || !form.checkOut) { toast.error('Select check-in and check-out dates'); return; }
    setLoading(true);
    try {
      const res = await hotelsApi.search({
        cityCode:  form.cityCode || cityQuery.toUpperCase().slice(0, 3),
        cityName:  cityQuery,
        checkIn:   form.checkIn,
        checkOut:  form.checkOut,
        adults:    parseInt(form.adults) || 2,
        rooms:     parseInt(form.rooms) || 1,
        ratings:   form.minStarRating ? [parseInt(form.minStarRating), parseInt(form.minStarRating)+1, parseInt(form.minStarRating)+2].filter(r => r <= 5) : [3,4,5],
      });
      const data = res.data as any;
      const list = data.hotels || data.results || [];
      const filtered = form.minStarRating
        ? list.filter((h: any) => (h.stars || h.StarRating || 0) >= parseInt(form.minStarRating))
        : list;
      setHotels(filtered.length > 0 ? filtered : MOCK_HOTELS);
      setSearched(true);
      if (!filtered.length) toast.info('No hotels found. Showing sample results.');
    } catch (err: any) {
      toast.error('Search failed, showing sample hotels');
      setHotels(MOCK_HOTELS);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const nights = Math.max(1, Math.round((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000));

  const handleBookHotel = async (hotel: any) => {
    toast.success(`Loading room rates for ${hotel.name}...`);
    // In prod: navigate to hotel detail / room selection
  };

  return (
    <div className={cn(SPACING.section)}>
      <PageHeader title="Hotel Search" subtitle="Search and book hotels via TBO" />

      {/* Search Form */}
      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Label className={TEXT.label}>City</Label>
            <Input placeholder="Mumbai, Delhi..." value={cityQuery}
              onChange={e => setCityQuery(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Check-in</Label>
            <Input type="date" value={form.checkIn}
              onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Check-out</Label>
            <Input type="date" value={form.checkOut}
              onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Rooms / Adults</Label>
            <div className="flex gap-2 mt-1.5">
              <Select value={form.rooms} onValueChange={v => setForm(f => ({ ...f, rooms: v }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}R</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.adults} onValueChange={v => setForm(f => ({ ...f, adults: v }))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4].map(n => <SelectItem key={n} value={String(n)}>{n}A</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className={TEXT.label}>Min Stars</Label>
            <Select value={form.minStarRating} onValueChange={v => setForm(f => ({ ...f, minStarRating: v }))}>
              <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                {[3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}+ ⭐</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
          {loading ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Search Hotels
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={TEXT.h3}>{hotels.length} hotels in {cityQuery}</h2>
            <p className={TEXT.caption}>{form.checkIn} → {form.checkOut} · {nights} night{nights > 1 ? "s" : ""}</p>
          </div>

          {hotels.map(hotel => (
            <div key={hotel.id} className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-3xl">
                    {hotel.image}
                  </div>
                  <div>
                    <p className={TEXT.h4}>{hotel.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className={TEXT.caption}>{hotel.city}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hotel.amenities.map((a: string) => (
                        <span key={a} className="text-xs bg-muted px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  {hotel.refundable && (
                    <span className="text-green-600 text-xs font-medium">✓ Free cancellation</span>
                  )}
                  <div className="text-right">
                    <p className={cn(TEXT.caption, "line-through text-muted-foreground")}>
                      ₹{(hotel.price * 1.15).toFixed(0)}
                    </p>
                    <p className={TEXT.h2}>₹{hotel.price.toLocaleString()}</p>
                    <p className={TEXT.caption}>per night · {nights}N total: ₹{(hotel.price * nights).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => handleBookHotel(hotel)}>
                    Select Room <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
