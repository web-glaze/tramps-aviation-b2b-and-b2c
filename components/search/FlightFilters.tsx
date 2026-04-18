"use client";
import { useState } from "react";
import { CheckCircle, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineColor, getPrice } from "./FlightCard";

interface Props {
  flights:          any[];
  sortBy:           string;  setSortBy:        (v:string)=>void;
  filterStop:       string;  setFilterStop:    (v:string)=>void;
  filterRef:        string;  setFilterRef:     (v:string)=>void;
  filterCabin?:     string;  setFilterCabin?:  (v:string)=>void;
  filterAirline?:   string;  setFilterAirline?:(v:string)=>void;
  maxPrice?:        number;  setMaxPrice?:     (v:number)=>void;
  hasFilters:       boolean;
  onClear:          ()=>void;
}

function FilterSection({ label, children, defaultOpen=true }: { label:string; children:React.ReactNode; defaultOpen?:boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between mb-2 group">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest group-hover:text-foreground transition-colors">{label}</p>
        {open ? <ChevronUp className="h-3 w-3 text-muted-foreground"/> : <ChevronDown className="h-3 w-3 text-muted-foreground"/>}
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active:boolean; onClick:()=>void; children:React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn("w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      {active && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{children}
    </button>
  );
}

export function FlightFilters({
  flights, sortBy, setSortBy, filterStop, setFilterStop,
  filterRef, setFilterRef, filterCabin, setFilterCabin,
  filterAirline, setFilterAirline, maxPrice, setMaxPrice,
  hasFilters, onClear,
}: Props) {
  const prices   = flights.map(getPrice).filter(p=>p>0);
  const minP     = prices.length ? Math.min(...prices) : 0;
  const maxP     = prices.length ? Math.max(...prices) : 0;
  const cabins   = Array.from(new Set<string>(flights.map(f=>f.cabinClass||f.cabin||"ECONOMY").filter(Boolean)));
  const airlines = Array.from(new Set<string>(flights.map(f=>f.airline).filter(Boolean)));

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <p className="text-sm font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary"/>Filters
        </p>
        {hasFilters && <button onClick={onClear} className="text-xs text-primary hover:underline font-medium">Clear all</button>}
      </div>

      <div className="p-4 space-y-4">
        {/* Price Range */}
        {maxP > 0 && setMaxPrice && (
          <FilterSection label="Price Range">
            <div className="bg-muted/40 rounded-xl p-3 mb-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>₹{minP.toLocaleString("en-IN")}</span>
                <span className="font-semibold text-foreground">Up to ₹{(maxPrice||maxP).toLocaleString("en-IN")}</span>
              </div>
              <input type="range" min={minP} max={maxP} step={100}
                value={maxPrice||maxP} onChange={e=>setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"/>
            </div>
          </FilterSection>
        )}

        {/* Sort */}
        <FilterSection label="Sort By">
          {[["price","💰 Cheapest first"],["departure","🕐 Earliest first"],["duration","⚡ Fastest first"]].map(([v,l])=>(
            <FilterBtn key={v} active={sortBy===v} onClick={()=>setSortBy(v)}>{l}</FilterBtn>
          ))}
        </FilterSection>

        {/* Stops */}
        <FilterSection label="Stops">
          {[["all","Any stops"],["0","Non-stop only"],["1","1 stop"]].map(([v,l])=>(
            <FilterBtn key={v} active={filterStop===v} onClick={()=>setFilterStop(v)}>{l}</FilterBtn>
          ))}
        </FilterSection>

        {/* Cabin Class */}
        {cabins.length > 1 && setFilterCabin && (
          <FilterSection label="Cabin Class">
            <FilterBtn active={!filterCabin||filterCabin==="all"} onClick={()=>setFilterCabin("all")}>Any class</FilterBtn>
            {cabins.map(c=>(
              <FilterBtn key={c} active={filterCabin===c} onClick={()=>setFilterCabin(c)}>
                {c.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
              </FilterBtn>
            ))}
          </FilterSection>
        )}

        {/* Refund */}
        <FilterSection label="Refund Policy">
          {[["all","Any"],["yes","Refundable only"],["no","Non-refundable"]].map(([v,l])=>(
            <FilterBtn key={v} active={filterRef===v} onClick={()=>setFilterRef(v)}>{l}</FilterBtn>
          ))}
        </FilterSection>

        {/* Airlines */}
        {airlines.length > 0 && (
          <FilterSection label="Airlines" defaultOpen={airlines.length<=5}>
            {setFilterAirline && (
              <FilterBtn active={!filterAirline||filterAirline==="all"} onClick={()=>setFilterAirline("all")}>All airlines</FilterBtn>
            )}
            {airlines.slice(0,8).map(airline=>{
              const count   = flights.filter(f=>f.airline===airline).length;
              const minFare = Math.min(...flights.filter(f=>f.airline===airline).map(getPrice).filter(Boolean));
              return (
                <button key={airline} onClick={()=>setFilterAirline?.(airline)}
                  className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    filterAirline===airline ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                  )}>
                  <div className={cn(getAirlineColor(airline),"w-5 h-5 rounded text-white font-black text-[9px] flex items-center justify-center flex-shrink-0")}>
                    {(airline||"?")[0]}
                  </div>
                  <p className="text-xs text-foreground font-medium truncate flex-1 text-left">{airline}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-semibold" style={{color:"hsl(var(--brand-orange))"}}>
                      ₹{minFare.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{count} flight{count!==1?"s":""}</p>
                  </div>
                </button>
              );
            })}
          </FilterSection>
        )}
      </div>
    </div>
  );
}