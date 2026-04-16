"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Hotel, Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { popularApi, unwrap } from "@/lib/api/services";

function HotelCard({ hotel, onClick }: { hotel:any; onClick:()=>void }) {
  const stars = Math.min(hotel.stars||4, 5);
  return (
    <button onClick={onClick}
      className={cn(
        "group flex-shrink-0 w-44 sm:w-52 text-left rounded-2xl overflow-hidden transition-all duration-200",
        "border border-white/60 dark:border-white/10",
        "bg-white/70 dark:bg-white/5 backdrop-blur-md",
        "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        "hover:border-primary/50 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1",
        "hover:bg-white/90 dark:hover:bg-white/10"
      )}>
      {/* Image area — neutral placeholder, no colorful gradient */}
      <div className="h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        {hotel.imageUrl
          ? <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          : (
            <div className="w-full h-full flex items-center justify-center">
              <Hotel className="h-10 w-10 text-slate-300 dark:text-slate-600"/>
            </div>
          )
        }
        {/* Stars */}
        <div className="absolute bottom-2 left-2.5 flex gap-0.5">
          {Array.from({length:stars}).map((_,i)=><Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400"/>)}
        </div>
        {hotel.rating && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            ★ {hotel.rating}
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{hotel.name}</h3>
        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-1">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0"/>
          <span className="truncate">{hotel.city}{hotel.country?`, ${hotel.country}`:""}</span>
        </p>
        <div className="mt-3 pt-2.5 border-t border-border/40">
          <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider mb-0.5">from</p>
          <p className="text-sm font-black" style={{color:"hsl(var(--brand-orange))"}}>
            {hotel.pricePerNight||"₹5,000"}<span className="text-[9px] text-muted-foreground font-normal">/night</span>
          </p>
        </div>
      </div>
    </button>
  );
}

export function PopularHotels({ preloaded }: { preloaded?: any[] }) {
  const router = useRouter();
  const ref    = useRef<HTMLDivElement>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [canL,   setCanL]   = useState(false);
  const [canR,   setCanR]   = useState(true);

  useEffect(() => {
    if (preloaded !== undefined) { setHotels(preloaded.length ? preloaded : []); return; }
    popularApi.getHotels()
      .then(r => { const d = unwrap(r); setHotels(Array.isArray(d) ? d : []); })
      .catch(() => setHotels([]));
  }, []);

  if (!hotels.length) return null;

  const update = () => {
    const el = ref.current; if (!el) return;
    setCanL(el.scrollLeft > 8);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };
  const scroll = (dir:"l"|"r") => ref.current?.scrollBy({ left: dir==="l"?-320:320, behavior:"smooth" });

  return (
    <section className="py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
              <span className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Hotel className="h-4 w-4 text-amber-500"/>
              </span>
              Popular Hotels
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 ml-10">Top-rated stays across India</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>scroll("l")} disabled={!canL}
              className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm">
              <ChevronLeft className="h-4 w-4"/>
            </button>
            <button onClick={()=>scroll("r")} disabled={!canR}
              className="w-8 h-8 rounded-full border border-border bg-white dark:bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-30 transition-all shadow-sm">
              <ChevronRight className="h-4 w-4"/>
            </button>
          </div>
        </div>

        <div ref={ref} onScroll={update}
            className="flex gap-3 sm:gap-4 overflow-x-auto py-2 px-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {hotels.map((h,i)=>(
            <HotelCard key={h._id||h.name+i} hotel={h}
              onClick={()=>router.push(`/hotels?city=${encodeURIComponent(h.city)}`)}/>
          ))}
        </div>
      </div>
    </section>
  );
}