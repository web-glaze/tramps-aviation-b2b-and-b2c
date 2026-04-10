"use client";
import { useState } from "react";
import { Search, RefreshCcw, ArrowLeftRight, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TripType = "oneway" | "roundtrip";

interface Props {
  from: string; setFrom: (v:string)=>void;
  to:   string; setTo:   (v:string)=>void;
  date: string; setDate: (v:string)=>void;
  retDate?: string; setRetDate?: (v:string)=>void;
  adults: number; setAdults: (v:number)=>void;
  tripType?: TripType; setTripType?: (v:TripType)=>void;
  onSearch: ()=>void;
  loading?: boolean;
  showTripType?: boolean;
}

export function FlightSearchBar({
  from,setFrom,to,setTo,date,setDate,
  retDate="",setRetDate,adults,setAdults,
  tripType="oneway",setTripType,
  onSearch,loading=false,showTripType=true
}: Props) {
  const swap = () => { const t=from; setFrom(to); setTo(t); };

  return (
    <div className="search-hero">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Trip type */}
        {showTripType && setTripType && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1 bg-white/10 rounded-xl p-1">
              {([["oneway","One Way"],["roundtrip","Round Trip"]] as const).map(([v,l])=>(
                <button key={v} onClick={()=>setTripType(v)}
                  className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                    tripType===v ? "bg-white text-primary shadow-sm" : "text-white/80 hover:text-white hover:bg-white/10"
                  )}>
                  {v==="roundtrip" && <Repeat2 className="h-3.5 w-3.5"/>}{l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className={cn("grid gap-3",
          tripType==="roundtrip"
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5"
        )}>
          {/* From */}
          <div>
            <label className="search-label">From</label>
            <input value={from} onChange={e=>setFrom(e.target.value.toUpperCase())} maxLength={3} placeholder="DEL"
              className="search-input w-full font-black text-xl tracking-widest text-center uppercase"/>
          </div>
          {/* Swap + To */}
          <div className="relative">
            <label className="search-label">To</label>
            <div className="relative">
              <input value={to} onChange={e=>setTo(e.target.value.toUpperCase())} maxLength={3} placeholder="BOM"
                className="search-input w-full font-black text-xl tracking-widest text-center uppercase"/>
              <button onClick={swap}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 hidden sm:flex">
                <ArrowLeftRight className="h-3 w-3 text-primary"/>
              </button>
            </div>
          </div>
          {/* Depart */}
          <div>
            <label className="search-label">Departure</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="search-input-date w-full text-sm"/>
          </div>
          {/* Return */}
          {tripType==="roundtrip" && setRetDate && (
            <div>
              <label className="search-label">Return</label>
              <input type="date" value={retDate} onChange={e=>setRetDate(e.target.value)}
                min={date||new Date().toISOString().split("T")[0]}
                className="search-input-date w-full text-sm"/>
            </div>
          )}
          {/* Adults */}
          <div>
            <label className="search-label">Adults</label>
            <input type="number" value={adults} min={1} max={9}
              onChange={e=>setAdults(parseInt(e.target.value)||1)}
              className="search-input w-full font-bold text-xl text-center"/>
          </div>
          {/* Button */}
          <div className={cn("flex items-end", tripType==="roundtrip"?"col-span-2 sm:col-span-3 lg:col-span-1":"")}>
            <button onClick={onSearch} disabled={loading}
              className="w-full h-[50px] bg-white text-primary hover:bg-white/90 disabled:opacity-60 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[.98]">
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
              {loading ? "Searching…" : "Search Flights"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
