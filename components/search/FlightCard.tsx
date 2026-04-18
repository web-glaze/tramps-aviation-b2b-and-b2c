"use client";
/**
 * FlightCard — reusable flight result card
 * Used on /flights, /b2b/flights, /b2c/flights
 * Orange: price + Book Now ONLY
 */
import { useState } from "react";
import { Plane, Luggage, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const AIRLINE_COLOR: Record<string,string> = {
  "IndiGo":"bg-indigo-600","Air India":"bg-red-600","SpiceJet":"bg-orange-500",
  "Vistara":"bg-purple-600","Akasa Air":"bg-yellow-500","Go First":"bg-sky-500",
  "Air India Express":"bg-red-500","AirAsia":"bg-red-700","GoAir":"bg-sky-600",
};
export const getAirlineColor = (n:string) => AIRLINE_COLOR[n] || "bg-primary";

export function getPrice(f: any): number {
  const p = f.price;
  if (typeof p === "number" && p > 0) return p;
  if (typeof p === "object" && p !== null) return p.total || p.grandTotal || 0;
  return f.fare?.total || f.fare?.totalFare || 0;
}

interface Props {
  flight: any;
  adults: number;
  onBook: () => void;
  /** Label on book button, e.g. "Book Now" or "Select for B2B" */
  bookLabel?: string;
}

export function FlightCard({ flight, adults, onBook, bookLabel = "Book Now" }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isCustom = flight.source === "CUSTOM" || flight.resultToken?.startsWith("TRAMPS-");
  const price = getPrice(flight);
  const code  = flight.airlineCode || (flight.airline || "?")[0];
  const color = getAirlineColor(flight.airline);
  const seatsAvailable =
    typeof flight.seatsAvailable === "number" && flight.seatsAvailable > 0
      ? flight.seatsAvailable
      : null;
  const hasEnoughSeats = seatsAvailable === null || seatsAvailable >= adults;

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-200",
      "border shadow-sm hover:shadow-md hover:-translate-y-0.5",
      "backdrop-blur-sm",
      isCustom ? "bg-amber-50/80 dark:bg-amber-900/10 border-amber-300/60 dark:border-amber-700/40" : "bg-card/90 border-border/60 hover:border-primary/30"
    )}>
      {/* Special fare badge */}
      {isCustom && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-1.5 flex items-center gap-2">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0"/>
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Tramps Aviation Special · {flight.airline}
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center sm:gap-4">
          {/* Airline */}
          <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0 mx-auto lg:mx-0">
            <div className={cn(color, "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm")}>
              {code}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-center leading-tight">{flight.flightNo}</p>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">{flight.departure || "—"}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">{flight.from}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-muted-foreground">{flight.duration || "—"}</p>
              <div className="flex items-center w-full gap-1">
                <div className="flex-1 h-px bg-border"/>
                <Plane className="h-3 w-3 text-primary"/>
                <div className="flex-1 h-px bg-border"/>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">{flight.arrival || "—"}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">{flight.to}</p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="flex w-full flex-col gap-2 border-t border-border pt-3 text-center lg:w-auto lg:flex-shrink-0 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0 lg:text-right">
            <p className="text-[10px] text-muted-foreground">per person</p>
            <p className="text-2xl font-black leading-tight" style={{color:"hsl(var(--brand-orange))"}}>
              ₹{price.toLocaleString("en-IN")}
            </p>
            {adults > 1 && (
              <p className="text-[10px] text-primary font-medium">
                ₹{(price * adults).toLocaleString("en-IN")} total
              </p>
            )}
            {seatsAvailable !== null && (
              <p className={cn(
                "text-[10px] font-semibold",
                hasEnoughSeats
                  ? seatsAvailable <= 4
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}>
                {hasEnoughSeats ? `${seatsAvailable} seat${seatsAvailable === 1 ? "" : "s"} left` : `Only ${seatsAvailable} seat${seatsAvailable === 1 ? "" : "s"} left`}
              </p>
            )}
            <p className={cn("text-[10px] mt-0.5",
              flight.refundable ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}>
              {flight.refundable ? "✓ Refundable" : "Non-refundable"}
            </p>
            <button onClick={onBook}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap shadow-sm"
              style={{background:"hsl(var(--brand-orange))"}}>
              {bookLabel}
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Luggage className="h-3 w-3"/>{flight.checkinBaggage || "15 KG"} check-in
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Luggage className="h-3 w-3"/>{flight.cabinBaggage || "7 KG"} cabin
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3"/>{flight.duration || "—"}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto font-medium">{flight.airline}</span>
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors">
            {expanded ? "Hide" : "Details"}
            {expanded ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
          </button>
        </div>

        {/* Expanded */}
          {expanded && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["Flight",  flight.flightNo],
              ["Class",   flight.cabinClass || "Economy"],
              ["Stops",   flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`],
              ["Refund",  flight.refundable ? "Refundable" : "Non-refundable"],
              ...(seatsAvailable !== null ? [["Seats", `${seatsAvailable} available`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="bg-muted/60 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{k}</p>
                <p className={cn("text-sm font-bold",
                  k === "Refund"
                    ? flight.refundable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                )}>{v}</p>
              </div>
            ))}
            {flight.notes && (
              <div className="col-span-2 sm:col-span-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">{flight.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
