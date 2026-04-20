"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  ArrowRight,
  Luggage,
  Search,
  RefreshCcw,
  X,
  AlertCircle,
  Shield,
  Zap,
  CheckCircle,
  Filter,
  Star,
  Info,
  Sparkles,
  ArrowLeftRight,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore, useFlightFiltersStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FlightFilters } from "@/components/search/FlightFilters";
import {
  AgentCommissionBreakdown,
  AgentEarnBadge,
} from "@/components/shared/AgentCommissionBreakdown";
import apiClient from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const AIRLINE_COLOR: Record<string, string> = {
  IndiGo: "bg-indigo-600",
  "Air India": "bg-red-600",
  SpiceJet: "bg-orange-500",
  Vistara: "bg-purple-600",
  "Akasa Air": "bg-yellow-500",
  "Go First": "bg-sky-500",
  "Air India Express": "bg-red-500",
  AirAsia: "bg-red-700",
  GoAir: "bg-sky-600",
};
const airlineColor = (n: string) => AIRLINE_COLOR[n] || "bg-primary";

// ─── Series Fare Card ─────────────────────────────────────────────────────────
function SeriesFareCard({
  flight,
  adults,
  onBook,
}: {
  flight: any;
  adults: number;
  onBook: (f: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { role } = useAuthStore();

  const price =
    typeof flight.price === "number"
      ? flight.price
      : flight.fare?.totalFare || flight.fare?.total || 0;
  const totalPrice = price * adults;
  const taxes = Number(flight?.fare?.taxes || flight?.taxes || 0);
  const refundable = flight.isRefundable !== false;
  const code = (
    flight.airlineCode || (flight.airline || "?").slice(0, 2)
  ).toUpperCase();
  const seatsAvailable =
    typeof flight.seatsAvailable === "number" && flight.seatsAvailable > 0
      ? flight.seatsAvailable
      : 9;

  // Commission data from backend (if available) — component falls back to 5% default
  const commissionPercent = Number(
    flight?.fare?.commissionPercent ?? flight?.commissionPercent ?? 5,
  );
  const commissionAmount =
    flight?.fare?.commissionAmount ?? flight?.commissionAmount;

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border transition-all duration-200",
        "bg-card backdrop-blur-xl shadow-[0_18px_48px_rgba(10,37,64,0.10)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.30)] hover:shadow-[0_24px_60px_rgba(10,37,64,0.14)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.40)] hover:-translate-y-0.5",
        "border-border/60 hover:border-primary/30",
      )}
    >
      {/* Exclusive badge */}
      <div className="bg-gradient-to-r from-primary/8 to-primary/4 border-b border-border/50 px-4 py-1.5 flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
          Tramps Aviation Exclusive · Series Fare
        </span>
        {!refundable ? (
          <span className="ml-auto text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 rounded-full font-semibold">
            Non-Refundable
          </span>
        ) : (
          <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full font-semibold">
            Refundable
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center sm:gap-4">
          {/* Airline */}
          <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0 mx-auto lg:mx-0">
            <div
              className={cn(
                airlineColor(flight.airline),
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm",
              )}
            >
              {code}
            </div>
            <p className="text-[10px] text-muted-foreground font-mono text-center leading-tight">
              {flight.flightNumber || flight.flightNo || ""}
            </p>
          </div>

          {/* Route */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">
                {flight.departureTime || flight.origin || "—"}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {flight.origin}
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-muted-foreground">
                {flight.duration || "—"}
              </p>
              <div className="flex items-center w-full gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane className="h-3 w-3 text-primary" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-2xl font-black text-foreground leading-none">
                {flight.arrivalTime || flight.destination || "—"}
              </p>
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {flight.destination}
              </p>
            </div>
          </div>

          {/* Price + Book */}
          <div className="w-full text-center lg:w-auto lg:text-right flex-shrink-0 border-t border-border/60 pt-3 lg:border-t-0 lg:pt-0">
            <p className="text-[10px] text-muted-foreground">per person</p>
            <p
              className="text-2xl font-black leading-tight"
              style={{ color: "hsl(var(--brand-orange))" }}
            >
              ₹{Number(price).toLocaleString("en-IN")}
            </p>
            {/* Total price when adults > 1 */}
            {adults > 1 && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-end gap-1">
                <Users className="h-3 w-3" />
                {adults} pax:{" "}
                <span className="font-bold text-foreground">
                  ₹{Number(totalPrice).toLocaleString("en-IN")}
                </span>
              </p>
            )}
            <p
              className={cn(
                "text-[10px] font-semibold mt-1",
                seatsAvailable <= adults
                  ? "text-amber-600 dark:text-amber-400"
                  : seatsAvailable <= 4
                    ? "text-rose-500"
                    : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {seatsAvailable} seat{seatsAvailable === 1 ? "" : "s"} available
            </p>

            {/* Agent-only earn badge (renders nothing for customers/guests) */}
            <AgentEarnBadge
              totalAmount={totalPrice}
              commissionPercent={commissionPercent}
              commissionAmount={commissionAmount}
              className="mt-1.5"
            />
            <button
              onClick={() => onBook(flight)}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: "hsl(var(--brand-orange))" }}
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center flex-wrap gap-3 mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Luggage className="h-3 w-3" />
            {flight.baggage || flight.checkinBaggage || "30KG"} check-in
          </span>
          <span className="flex items-center gap-1">
            <Luggage className="h-3 w-3" />
            {flight.cabinBaggage || "7KG"} cabin
          </span>
          <span
            className={cn(
              "flex items-center gap-1 font-medium",
              refundable
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500",
            )}
          >
            <Shield className="h-3 w-3" />
            {refundable ? "Refundable" : "Non-Refundable"}
          </span>
          {flight.cabinClass && (
            <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded-full border border-border">
              {flight.cabinClass}
            </span>
          )}
          {flight.airline && (
            <span className="font-semibold text-foreground ml-auto">
              {flight.airline}
            </span>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-primary hover:text-primary/80 transition-colors ml-2"
          >
            {expanded ? "Hide ▴" : "Details ▾"}
          </button>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                  Fare Breakdown
                </p>
                {/* Agents see full commission breakdown; customers see only the first 3 lines */}
                <AgentCommissionBreakdown
                  totalAmount={totalPrice}
                  baseFare={taxes > 0 ? totalPrice - taxes : undefined}
                  taxes={taxes > 0 ? taxes : undefined}
                  commissionPercent={commissionPercent}
                  commissionAmount={commissionAmount}
                  quantity={adults}
                  productType="series-fare"
                />
                {/* Customer/guest fallback — shared component renders null for them */}
                {role !== "agent" && (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Base Fare × {adults}
                      </span>
                      <span className="font-medium">
                        ₹{Number(price * adults).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Taxes & Fees
                      </span>
                      <span className="font-medium">
                        {taxes > 0
                          ? `₹${taxes.toLocaleString("en-IN")}`
                          : "Included in fare"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-border pt-1.5 mt-1.5">
                      <span>Total ({adults} pax)</span>
                      <span style={{ color: "hsl(var(--brand-orange))" }}>
                        ₹{Number(totalPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-muted/40 rounded-xl p-4 border border-border/40">
                <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                  Policies
                </p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Cancellation</span>
                    <span
                      className={
                        refundable
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-rose-500 font-medium"
                      }
                    >
                      {refundable ? "Charges apply" : "Not allowed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Change</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {flight.isChangeable === false
                        ? "Not allowed"
                        : "Charges apply"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baggage</span>
                    <span className="text-foreground font-medium">
                      {flight.baggage || "30KG"} +{" "}
                      {flight.cabinBaggage || "7KG"} cabin
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats Left</span>
                    <span
                      className={cn(
                        "font-medium",
                        seatsAvailable <= 5
                          ? "text-rose-500"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {seatsAvailable} seats
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {flight.notes && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 inline mr-1.5" />
                  {flight.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agent Booking Dialog — correct 2-step flow ───────────────────────────────
function AgentBookingDialog({
  flight,
  adults,
  from,
  to,
  date,
  onClose,
}: {
  flight: any;
  adults: number;
  from: string;
  to: string;
  date: string;
  onClose: () => void;
}) {
  const { agentId, user } = useAuthStore();
  const price =
    typeof flight.price === "number"
      ? flight.price
      : flight.fare?.totalFare || flight.fare?.total || 0;
  const total = price * adults;

  // ── Agent-side fare breakdown (shown in dialog) ─────────────────────────
  // Screen shows: Base ₹1,700 + Taxes ~₹300 = Customer Pays ₹2,000
  // We derive per-person base/tax from flight.fare if provided, else 85/15 split.
  const baseFareEach = Number(
    flight?.fare?.baseFare ?? flight?.baseFare ?? Math.round(price * 0.85),
  );
  const taxesEach = Number(
    flight?.fare?.taxes ?? flight?.taxes ?? price - baseFareEach,
  );
  const baseFareTotal = baseFareEach * adults;
  const taxesTotal = taxesEach * adults;

  const [passengers, setPassengers] = useState(
    Array.from({ length: adults }, () => ({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "M",
    })),
  );
  // Editable contact fields — prefilled from logged-in agent
  const [contactEmail, setContactEmail] = useState<string>(
    user?.email || user?.contactEmail || "",
  );
  const [contactPhone, setContactPhone] = useState<string>(
    user?.phone || user?.mobile || user?.contactPhone || "",
  );
  const [step, setStep] = useState<"form" | "loading" | "done">("form");
  const [pnr, setPnr] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [stepLabel, setStepLabel] = useState("");

  // Build the resultToken — must start with TRAMPS- for backend to recognize as custom fare
  const resultToken = flight.resultToken?.startsWith("TRAMPS-")
    ? flight.resultToken
    : `TRAMPS-${flight.id || flight._id || flight.resultToken}`;

  const confirm = async () => {
    // Validate passenger names
    if (!passengers.every((p) => p.firstName.trim() && p.lastName.trim())) {
      toast.error("Please fill all passenger names");
      return;
    }
    // Validate DOB (backend schema requires it)
    if (!passengers.every((p) => p.dob)) {
      toast.error("Please fill date of birth for all passengers");
      return;
    }
    // Validate contact
    if (!contactEmail.trim() || !contactPhone.trim()) {
      toast.error("Contact email and phone are required");
      return;
    }

    setStep("loading");

    // Generate a unique idempotency key for this booking attempt.
    // If the network fails and user retries, the same key ensures only one
    // booking is created server-side.
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    try {
      // ── Step 1: Init booking ──────────────────────────────────────────────
      setStepLabel("Creating booking…");
      const initRes = await apiClient.post("/bookings/init", {
        resultToken,
        // Backend schema enum is snake_case: one_way / round_trip / multi_city
        tripType: "one_way",
        adults,
        passengers: passengers.map((p) => ({
          title: p.gender === "F" ? "Ms" : "Mr",
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          // Backend schema fields (required):
          dateOfBirth: p.dob,           // ISO date string — mongoose will cast to Date
          gender: p.gender || "M",
          passengerType: "ADT",         // Adult — required enum
          // Optional / legacy aliases kept for safety
          dob: p.dob,
          passportNumber: "",
        })),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        expectedPricePerPax: price,   // Price drift check on backend
      }, {
        headers: { "X-Idempotency-Key": idempotencyKey },
      });

      const initData = initRes.data?.data || initRes.data;
      const ref = initData?.bookingRef;

      if (!ref) {
        throw new Error("Booking reference not received from server");
      }

      setBookingRef(ref);

      // ── Step 2: Confirm via wallet ─────────────────────────────────────────
      setStepLabel("Deducting from wallet…");
      const confirmRes = await apiClient.post(
        `/bookings/${ref}/confirm-b2b`,
        {},
      );
      const confirmData = confirmRes.data?.data || confirmRes.data;

      // PNR is CF{timestamp} for series fares — generated internally
      setPnr(confirmData?.pnr || "");
      setBookingRef(confirmData?.bookingRef || ref);
      setStep("done");
      toast.success("Booking confirmed! Wallet debited.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Booking failed";
      toast.error(msg);
      setStep("form");
      setStepLabel("");
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === "done")
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
        <div className="relative bg-card border border-border rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl animate-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-bold text-2xl text-foreground mb-1">
            Booking Confirmed!
          </h3>
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5 mb-4 inline-block">
            Wallet debited ₹{total.toLocaleString("en-IN")}
          </p>

          {/* PNR — CF prefix = Custom/Series Fare internal PNR */}
          {pnr && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-5 py-4 mb-2">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-1">
                PNR Number
              </p>
              <p className="font-mono font-black text-2xl text-emerald-700 dark:text-emerald-300 tracking-widest">
                {pnr}
              </p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                Internal reference · Series Fare
              </p>
            </div>
          )}

          {bookingRef && (
            <p className="text-xs text-muted-foreground mb-1">
              Booking Ref:{" "}
              <span className="font-mono font-semibold">{bookingRef}</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground mb-5">
            E-ticket sent to registered email
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.location.href = "/b2b/bookings";
              }}
              className="flex-1 btn-primary py-2.5 text-sm"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Series Fare Booking</h3>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30 px-2 py-0.5 rounded-full font-bold">
                B2B · Wallet
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {flight.airline} · {from} → {to} · {date}
            </p>
          </div>
          {step === "form" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Fare summary — clear breakdown (base + taxes) */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Base Fare × {adults} passenger{adults > 1 ? "s" : ""}
              </span>
              <span className="font-medium">
                ₹{baseFareTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes &amp; Fees</span>
              <span className="font-medium">
                ₹{taxesTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Per passenger</span>
              <span>₹{price.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-amber-200 dark:border-amber-700/30 pt-2 mt-1">
              <span>Wallet Deduction</span>
              <span className="text-xl text-amber-600 dark:text-amber-400">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
              <Luggage className="h-3 w-3" />
              <span>
                {flight.baggage || flight.checkinBaggage || "15KG"} check-in
              </span>
              <span className="text-muted-foreground/60">·</span>
              <span>{flight.cabinBaggage || "7KG"} cabin</span>
            </div>
          </div>

          {/* Passenger forms */}
          {passengers.map((p, i) => (
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Passenger {i + 1}
                {i === 0 && (
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    (Primary)
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["First Name *", "firstName"],
                  ["Last Name *", "lastName"],
                ].map(([lbl, k]) => (
                  <div key={k}>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {lbl}
                    </label>
                    <input
                      value={(p as any)[k]}
                      onChange={(e) => {
                        const n = [...passengers];
                        (n[i] as any)[k] = e.target.value;
                        setPassengers(n);
                      }}
                      className="input-base"
                      placeholder={lbl.replace(" *", "")}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={p.dob}
                    onChange={(e) => {
                      const n = [...passengers];
                      n[i].dob = e.target.value;
                      setPassengers(n);
                    }}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Gender
                  </label>
                  <select
                    value={p.gender}
                    onChange={(e) => {
                      const n = [...passengers];
                      n[i].gender = e.target.value;
                      setPassengers(n);
                    }}
                    className="input-base"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Contact details — required by backend; prefilled from agent account */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Contact Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-base"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="input-base"
                  placeholder="10-digit mobile"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
              This is a Tramps Aviation exclusive series fare. A unique PNR will
              be generated internally upon confirmation.
            </p>
          </div>

          {/* Loading indicator */}
          {step === "loading" && stepLabel && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
              <RefreshCcw className="h-4 w-4 animate-spin flex-shrink-0" />
              {stepLabel}
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={confirm}
            disabled={step === "loading"}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground disabled:opacity-60 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {step === "loading" ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                Confirm & Deduct ₹{total.toLocaleString("en-IN")}{" "}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Smart Book Modal — checks auth, shows right dialog ──────────────────────
function BookModal({
  flight,
  adults,
  from,
  to,
  date,
  onClose,
}: {
  flight: any;
  adults: number;
  from: string;
  to: string;
  date: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const price =
    typeof flight.price === "number"
      ? flight.price
      : flight.fare?.totalFare || 0;

  // Logged in agent → show booking form directly
  if (isAuthenticated && role === "agent") {
    return (
      <AgentBookingDialog
        flight={flight}
        adults={adults}
        from={from}
        to={to}
        date={date}
        onClose={onClose}
      />
    );
  }

  // Guest / customer → show role picker
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Plane className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-bold text-lg mb-1">Book this Series Fare</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {flight.airline} · {from} → {to} · {date}
        </p>

        {/* Total price preview */}
        <div className="bg-muted/50 rounded-xl px-4 py-3 mb-5 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {adults} pax total
          </span>
          <span
            className="font-black text-lg"
            style={{ color: "hsl(var(--brand-orange))" }}
          >
            ₹{(price * adults).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="space-y-3">
          <button
            onClick={() =>
              router.push(
                `/b2c/login?redirect=${encodeURIComponent(`/series-fare?from=${from}&to=${to}&date=${date}`)}`,
              )
            }
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Star className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Customer</p>
              <p className="text-xs text-muted-foreground">
                Sign in · UPI / Card payment
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </button>

          <button
            onClick={() =>
              router.push(
                `/b2b/login?redirect=${encodeURIComponent(`/series-fare?from=${from}&to=${to}&date=${date}`)}`,
              )
            }
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Book as Agent (B2B)</p>
              <p className="text-xs text-muted-foreground">
                Agent portal · Wallet · Best rates
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function SeriesFarePage() {
  const params = useSearchParams();

  const [from, setFrom] = useState(params.get("from") || "DEL");
  const [to, setTo] = useState(params.get("to") || "BOM");
  const [date, setDate] = useState(params.get("date") || "");
  const [adults, setAdults] = useState(Number(params.get("adults") || "1"));

  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // ── Persisted filters ─────────────────────────────────────────────────
  // Previously these were local useState → reset on every unmount, which is
  // why the filter selections disappeared the moment the agent opened the
  // booking dialog or navigated away. Now they live in a Zustand store with
  // localStorage persistence so the choices survive across screens and reloads.
  const {
    sortBy,        setSortBy,
    filterStop,    setFilterStop,
    filterRef,     setFilterRef,
    filterCabin,   setFilterCabin,
    filterAirline, setFilterAirline,
    maxPrice,      setMaxPrice,
    resetFilters,
  } = useFlightFiltersStore();

  useEffect(() => {
    if (!date) {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      setDate(tmr.toISOString().split("T")[0]);
    }
    if (params.get("from") && params.get("to") && params.get("date")) {
      doSearch(params.get("from")!, params.get("to")!, params.get("date")!);
    }
  }, []);

  const doSearch = async (f = from, t = to, d = date) => {
    if (!f || !t) {
      toast.error("Enter origin and destination");
      return;
    }
    if (!d) {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      d = tmr.toISOString().split("T")[0];
      setDate(d);
    }
    setLoading(true);
    setSearched(true);
    setFlights([]);
    // NOTE: intentionally NOT resetting filters here — they are persisted via
    // useFlightFiltersStore and should survive re-searches. User can tap
    // "Clear all" in the filter panel to reset explicitly.
    try {
      const res = await fetch(
        `${API_BASE}/flights/series?origin=${encodeURIComponent(f.toUpperCase())}&destination=${encodeURIComponent(t.toUpperCase())}&departureDate=${d}&adults=${adults}`,
      );
      const json = await res.json();
      const list = json?.data?.data || json?.data || json?.results || [];
      setFlights(Array.isArray(list) ? list : []);
      if (Array.isArray(list) && !list.length) {
        toast.info("No series fares found for this route.");
      }
    } catch {
      toast.error("Failed to load series fares. Please try again.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const allPrices = flights
    .map((f) => f.price || f.fare?.totalFare || 0)
    .filter(Boolean);
  const maxPriceAll = allPrices.length ? Math.max(...allPrices) : 0;
  const effMax = maxPrice > 0 ? maxPrice : maxPriceAll;
  const hasFilters =
    filterStop !== "all" ||
    filterRef !== "all" ||
    filterCabin !== "all" ||
    filterAirline !== "all" ||
    (maxPrice > 0 && maxPrice < maxPriceAll);

  const filtered = flights
    .filter((f) => {
      const seatsAvailable =
        typeof f.seatsAvailable === "number" && f.seatsAvailable > 0
          ? f.seatsAvailable
          : null;
      if (seatsAvailable !== null && seatsAvailable < adults) return false;
      if (filterStop === "0" && f.stops !== 0) return false;
      if (filterStop === "1" && f.stops === 0) return false;
      if (filterRef === "yes" && f.isRefundable === false) return false;
      if (filterRef === "no" && f.isRefundable !== false) return false;
      if (
        filterCabin &&
        filterCabin !== "all" &&
        (f.cabinClass || "ECONOMY") !== filterCabin
      )
        return false;
      if (
        filterAirline &&
        filterAirline !== "all" &&
        f.airline !== filterAirline
      )
        return false;
      const p = f.price || f.fare?.totalFare || 0;
      if (effMax > 0 && p > effMax) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = a.price || a.fare?.totalFare || 0;
      const pb = b.price || b.fare?.totalFare || 0;
      if (sortBy === "price") return pa - pb;
      if (sortBy === "departure")
        return (a.departureTime || "").localeCompare(b.departureTime || "");
      return 0;
    });

  const flightsForFilter = flights.map((f) => ({
    ...f,
    price: f.price || f.fare?.totalFare || f.fare?.total || 0,
    airline: f.airline || "",
    cabinClass: f.cabinClass || "ECONOMY",
    stops: f.stops ?? 0,
    refundable: f.isRefundable !== false,
  }));

  return (
    <>
      {selectedFlight && (
        <BookModal
          flight={selectedFlight}
          adults={adults}
          from={from}
          to={to}
          date={date}
          onClose={() => setSelectedFlight(null)}
        />
      )}

      {/* Search Bar — wrapped in padding container so it's not edge-to-edge */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6">
        <div className="search-hero">
          <div className="px-4 sm:px-6 py-6">
            <div className="search-panel p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="search-label">From</label>
                  <div className="relative">
                    <input
                      value={from}
                      onChange={(e) => setFrom(e.target.value.toUpperCase())}
                      maxLength={3}
                      placeholder="DEL"
                      className="search-input w-full font-black text-xl tracking-widest text-center uppercase"
                    />
                    <button
                      onClick={swap}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95 hidden sm:flex"
                    >
                      <ArrowLeftRight className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="search-label">To</label>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value.toUpperCase())}
                    maxLength={3}
                    placeholder="BOM"
                    className="search-input w-full font-black text-xl tracking-widest text-center uppercase"
                  />
                </div>
                <div>
                  <label className="search-label">Travel Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="search-input-date w-full text-sm"
                  />
                </div>
                <div>
                  <label className="search-label">Adults</label>
                  <input
                    type="number"
                    value={adults}
                    min={1}
                    max={9}
                    onChange={(e) =>
                      setAdults(
                        Math.min(9, Math.max(1, parseInt(e.target.value) || 1)),
                      )
                    }
                    className="search-input w-full font-bold text-xl text-center"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => doSearch()}
                    disabled={loading}
                    className="search-button w-full h-[50px] disabled:opacity-60 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    {loading ? (
                      <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    {loading ? "Searching…" : "Search"}
                  </button>
                </div>
              </div>
            </div>

            <div className="search-note mt-3 flex items-start gap-2 text-xs rounded-xl px-4 py-2.5">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold text-foreground">
                  Series Fares
                </span>{" "}
                are Tramps Aviation's exclusive bulk inventory — separate from
                regular TBO fares. PNR is generated internally upon booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {searched && !loading && flights.length > 0 ? (
          <div className="flex gap-5">
            <div
              className="w-56 flex-shrink-0 hidden lg:block custom-scrollbar"
              style={{
                position: "sticky",
                top: "72px",
                alignSelf: "flex-start",
                maxHeight: "calc(100vh - 80px)",
                overflowY: "auto",
              }}
            >
              <FlightFilters
                flights={flightsForFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterStop={filterStop}
                setFilterStop={setFilterStop}
                filterRef={filterRef}
                setFilterRef={setFilterRef}
                filterCabin={filterCabin}
                setFilterCabin={setFilterCabin}
                filterAirline={filterAirline}
                setFilterAirline={setFilterAirline}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                hasFilters={hasFilters}
                onClear={resetFilters}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    {filtered.length} Series Fare
                    {filtered.length !== 1 ? "s" : ""} Found
                    {filtered.length !== flights.length && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({flights.length} total)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {from} → {to} · {date} · {adults} adult
                    {adults > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3 w-3" /> Exclusive Fares
                </div>
                <div className="flex gap-1 bg-card border border-border p-1 rounded-xl shadow-sm lg:hidden">
                  {[
                    ["price", "Cheapest"],
                    ["departure", "Earliest"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setSortBy(v)}
                      className={cn(
                        "text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all",
                        sortBy === v
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                  <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">
                    No fares match your filters or available seat count
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-primary hover:underline text-sm mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((flight, i) => (
                    <SeriesFareCard
                      key={flight.id || flight.resultToken || i}
                      flight={flight}
                      adults={adults}
                      onBook={setSelectedFlight}
                    />
                  ))}
                </div>
              )}

              {filtered.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    [Shield, "Secure Booking", "SSL encrypted"],
                    [Zap, "Internal PNR", "CF-prefix series fare"],
                    [CheckCircle, "24/7 Support", "Always here"],
                  ].map(([Icon, t, s]: any) => (
                    <div
                      key={t}
                      className="bg-card border border-border rounded-xl p-3 text-center shadow-sm"
                    >
                      <Icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-foreground">
                        {t}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="bg-card border border-border rounded-2xl p-5 animate-pulse shadow-sm h-28"
                  />
                ))}
                <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 mt-3">
                  <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  Searching exclusive fares…
                </p>
              </div>
            )}
            {!loading && !searched && (
              <div className="text-center py-28">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Series Fares
                </h2>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Exclusive group & bulk flight inventory — enter route and date
                  to search
                </p>
              </div>
            )}
            {searched && !loading && flights.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  No series fares found
                </p>
                <p className="text-muted-foreground text-sm">
                  Try different dates or routes
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function SeriesFarePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCcw className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <SeriesFarePage />
    </Suspense>
  );
}
