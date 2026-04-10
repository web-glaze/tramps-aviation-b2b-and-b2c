"use client";
/**
 * FlightFilters — reusable left panel
 * Used on all flight search pages
 */
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineColor, getPrice } from "./FlightCard";

interface Props {
  flights:       any[];
  sortBy:        string;      setSortBy:     (v:string)=>void;
  filterStop:    string;      setFilterStop: (v:string)=>void;
  filterRef:     string;      setFilterRef:  (v:string)=>void;
  hasFilters:    boolean;
  onClear:       ()=>void;
}

export function FlightFilters({ flights, sortBy, setSortBy, filterStop, setFilterStop, filterRef, setFilterRef, hasFilters, onClear }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-5 sticky top-20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Filters</p>
        {hasFilters && <button onClick={onClear} className="text-xs text-primary hover:underline">Clear all</button>}
      </div>

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

      {/* Refund */}
      <FilterSection label="Refund Policy">
        {[["all","Any"],["yes","Refundable only"],["no","Non-refundable"]].map(([v,l])=>(
          <FilterBtn key={v} active={filterRef===v} onClick={()=>setFilterRef(v)}>{l}</FilterBtn>
        ))}
      </FilterSection>

      {/* Airlines */}
      {flights.length > 0 && (
        <FilterSection label="Airlines">
          {Array.from(new Set<string>(flights.map(f=>f.airline).filter(Boolean))).slice(0,7).map(airline=>{
            const count   = flights.filter(f=>f.airline===airline).length;
            const minFare = Math.min(...flights.filter(f=>f.airline===airline).map(getPrice).filter(Boolean));
            return (
              <div key={airline} className="flex items-center justify-between px-2 py-1.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={cn(getAirlineColor(airline), "w-4 h-4 rounded text-white font-black text-[8px] flex items-center justify-center flex-shrink-0")}>
                    {(airline||"?")[0]}
                  </div>
                  <p className="text-xs text-foreground font-medium">{airline}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold" style={{color:"hsl(var(--brand-orange))"}}>₹{minFare.toLocaleString("en-IN")}</p>
                  <p className="text-[9px] text-muted-foreground">{count} flight{count!==1?"s":""}</p>
                </div>
              </div>
            );
          })}
        </FilterSection>
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active:boolean; onClick:()=>void; children:React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn("w-full text-left text-xs px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      {active && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{children}
    </button>
  );
}
