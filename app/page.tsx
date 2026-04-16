"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Hotel,
  Shield,
  Users,
  TrendingUp,
  ArrowRight,
  Search,
  MapPin,
  Zap,
  Clock,
  HeartHandshake,
  BadgeCheck,
  Building2,
  CreditCard,
  BarChart3,
  Lock,
  Award,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { publicApiClient } from "@/lib/api/client";
import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";
import { PopularFlights } from "@/components/home/PopularFlights";
import { PopularHotels } from "@/components/home/PopularHotels";
import { PopularCities } from "@/components/home/PopularCities";
import { PopularCountries } from "@/components/home/PopularCountries";
import { PopularRoutes } from "@/components/home/PopularRoutes";
import { UserReviews } from "@/components/home/UserReviews";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Search state
  const [activeTab, setActiveTab] = useState<
    "flights" | "hotels" | "insurance" | "series-fare"
  >("flights");
  const [from, setFrom] = useState("DEL");
  const [to, setTo] = useState("BOM");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState("1");
  const [hotelCity, setHotelCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState("1");

  // Popular data — ONE fetch, split to components
  const [popularFlights, setPopularFlights] = useState<any[]>([]);
  const [popularHotels, setPopularHotels] = useState<any[]>([]);
  const [popularCities, setPopularCities] = useState<any[]>([]);
  const [popularCountries, setPopularCountries] = useState<any[]>([]);
  const [popularAirlines, setPopularAirlines] = useState<string[]>([]);
  const [dataReady, setDataReady] = useState(false);

  // Set default dates
  useEffect(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setDate(tmr.toISOString().split("T")[0]);
    const today = new Date().toISOString().split("T")[0];
    const nxt = new Date();
    nxt.setDate(nxt.getDate() + 1);
    setCheckIn(today);
    setCheckOut(nxt.toISOString().split("T")[0]);
  }, []);

  // Fetch ALL popular data ONCE — no auth needed (publicApiClient)
  const fetchPopular = useCallback(async () => {
    try {
      const res = await publicApiClient.get("/popular/homepage");
      const body = res.data;
      const data = body?.data ?? body ?? {};

      const flights = Array.isArray(data.flights)
        ? data.flights.filter((f: any) => f.isActive !== false)
        : [];
      const hotels = Array.isArray(data.hotels)
        ? data.hotels.filter((h: any) => h.isActive !== false)
        : [];
      const cities = Array.isArray(data.cities)
        ? data.cities.filter((c: any) => c.isActive !== false)
        : [];
      const countries = Array.isArray(data.countries)
        ? data.countries.filter((c: any) => c.isActive !== false)
        : [];

      setPopularFlights(flights);
      setPopularHotels(hotels);
      setPopularCities(cities);
      setPopularCountries(countries);

      const STATIC = [
        "IndiGo",
        "Air India",
        "SpiceJet",
        "Vistara",
        "GoFirst",
        "AirAsia",
      ];
      const dynamic = Array.from(
        new Set<string>(
          flights
            .filter((f: any) => f.airline)
            .map((f: any) => f.airline as string),
        ),
      );
      setPopularAirlines(dynamic.length > 0 ? dynamic : STATIC);
    } catch {
      const STATIC = [
        "IndiGo",
        "Air India",
        "SpiceJet",
        "Vistara",
        "GoFirst",
        "AirAsia",
      ];
      setPopularAirlines(STATIC);
    } finally {
      setDataReady(true);
    }
  }, []);

  useEffect(() => {
    fetchPopular();
  }, []);

  const handleSearch = () => {
    if (activeTab === "hotels") {
      if (!hotelCity) {
        toast.error("Please enter a city");
        return;
      }
      if (!checkIn) {
        toast.error("Please select check-in date");
        return;
      }
      router.push(
        `/hotels?city=${encodeURIComponent(hotelCity)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`,
      );
      return;
    }
    if (activeTab === "insurance") {
      router.push("/insurance");
      return;
    }
    if (activeTab === "series-fare") {
      router.push(
        `/series-fare?from=${from.toUpperCase()}&to=${to.toUpperCase()}&date=${date}&adults=${adults}`,
      );
      return;
    }
    if (!from || !to) {
      toast.error("Please enter origin and destination");
      return;
    }
    if (!date) {
      toast.error("Please select a travel date");
      return;
    }
    router.push(
      `/flights?from=${from.toUpperCase()}&to=${to.toUpperCase()}&date=${date}&adults=${adults}`,
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CommonHeader variant="home" />

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-6 sm:pb-10 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/map-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
          }}
        />
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/6 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto w-full text-center space-y-5">
          <div className="space-y-6 animate-in stagger-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold font-display tracking-tight leading-[1.08]">
              Tramps Aviation Smarter,
              <br className="hidden sm:block" />
              <span className="gradient-text-animated">Book Faster</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Flights, hotels & travel insurance for travelers and travel
              agents. Best prices, instant confirmation, 24/7 support.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-card/85 glass border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/10 max-w-3xl mx-auto text-left animate-in stagger-2">
            {/* Search Tabs */}
            <div
              className="flex gap-1 mb-5 bg-muted/40 border border-border/60 rounded-xl p-1 w-full sm:w-fit overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {(
                [
                  { key: "flights", label: "Flights", icon: "✈️" },
                  { key: "hotels", label: "Hotels", icon: "🏨" },
                  { key: "insurance", label: "Insurance", icon: "🛡️" },
                  { key: "series-fare", label: "Series Fare", icon: "🎫" },
                ] as const
              ).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0",
                    activeTab === key
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="text-sm leading-none">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* Flights */}
            {activeTab === "flights" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField
                  label="From"
                  icon={MapPin}
                  placeholder="Delhi (DEL)"
                  value={from}
                  onChange={setFrom}
                />
                <SearchField
                  label="To"
                  icon={MapPin}
                  placeholder="Mumbai (BOM)"
                  value={to}
                  onChange={setTo}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Departure Date
                  </label>
                  <div className="field-wrapper">
                    <input
                      type="date"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Adults
                  </label>
                  <div className="field-wrapper">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="number"
                      min="1"
                      max="9"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Hotels */}
            {activeTab === "hotels" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField
                  label="City / Destination"
                  icon={MapPin}
                  placeholder="Mumbai, Goa..."
                  value={hotelCity}
                  onChange={setHotelCity}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Check-in
                  </label>
                  <div className="field-wrapper">
                    <input
                      type="date"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Check-out
                  </label>
                  <div className="field-wrapper">
                    <input
                      type="date"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Rooms
                  </label>
                  <div className="field-wrapper">
                    <Hotel className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="number"
                      min="1"
                      max="9"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Insurance */}
            {activeTab === "insurance" && (
              <div className="py-4 text-center space-y-3">
                <p className="text-muted-foreground text-sm">
                  Get travel insurance for flights, trips and medical
                  emergencies
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                  {[
                    "Medical Emergency Cover",
                    "Trip Cancellation",
                    "Baggage Loss",
                    "Flight Delay",
                  ].map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 bg-muted/50 px-3 py-1.5 rounded-full"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Series Fare */}
            {activeTab === "series-fare" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField
                  label="From"
                  icon={MapPin}
                  placeholder="Delhi (DEL)"
                  value={from}
                  onChange={setFrom}
                />
                <SearchField
                  label="To"
                  icon={MapPin}
                  placeholder="Mumbai (BOM)"
                  value={to}
                  onChange={setTo}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Departure Date
                  </label>
                  <div className="field-wrapper">
                    <input
                      type="date"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Adults
                  </label>
                  <div className="field-wrapper">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="number"
                      min="1"
                      max="9"
                      className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99]"
            >
              <Search className="h-4 w-4" />
              {activeTab === "flights"
                ? "Search Flights"
                : activeTab === "hotels"
                  ? "Search Hotels"
                  : activeTab === "series-fare"
                    ? "Search Series Fares"
                    : "Get Insurance Plans"}
            </button>
          </div>

          <div className="div-spacing">
            <PopularRoutes routes={popularFlights} date={date} />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap animate-in stagger-4 pt-2">
            {[
              { value: "2L+", label: "Happy Travelers", color: "text-primary" },
              {
                value: "500+",
                label: "Travel Agents",
                color: "text-[#208dcb]",
              },
              { value: "200+", label: "Airlines", color: "text-primary" },
              {
                value: "₹50Cr+",
                label: "Bookings Processed",
                color: "text-[#208dcb]",
              },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold font-display ${color}`}>
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Airlines */}
      {popularAirlines.length > 0 && (
        <div className="px-4 sm:px-6 mt-6 mb-2 relative z-10">
          <div className="max-w-4xl mx-auto bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 py-4 px-6">
            <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              We cover all major airlines
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {popularAirlines.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plane className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-sm font-semibold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-16"></div>

      {/* ── POPULAR FLIGHTS CAROUSEL ── */}
      <div className="div-spacing">
        {dataReady && <PopularFlights preloaded={popularFlights} />}
      </div>

      {/* ── POPULAR HOTELS CAROUSEL ── */}
      <div className="div-spacing">
        {dataReady && <PopularHotels preloaded={popularHotels} />}
      </div>

      {/* ── POPULAR CITIES + COUNTRIES ── */}
      <div className="div-spacing">
        {dataReady && <PopularCities preloaded={popularCities} />}
      </div>
      <div className="div-spacing">
        {dataReady && <PopularCountries preloaded={popularCountries} />}
      </div>

      {/* FEATURES */}
      <section id="features" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10 animate-in">
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20">
              Why Tramps Aviation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mt-4 mb-3">
              Everything you need to travel
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From booking to boarding — we've got you covered at every step of
              your journey.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Plane,
                title: "Flight Booking",
                desc: "Real-time search across 200+ airlines with instant PNR and e-ticket delivery in minutes.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                icon: Hotel,
                title: "Hotel Booking",
                desc: "Thousands of hotels globally with best price guarantee and flexible cancellation.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: Shield,
                title: "Travel Insurance",
                desc: "Comprehensive plans from Bajaj Allianz starting ₹799 with cashless claim support.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                icon: HeartHandshake,
                title: "B2B Agent Portal",
                desc: "Exclusive agent rates, structured commissions, credit wallet and dedicated support.",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Immediate confirmation, instant ticket delivery with complete PNR details.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Round-the-clock customer support for all your travel needs, wherever you are.",
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
              },
            ].map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div
                key={title}
                className={cn(
                  "bg-card border border-border rounded-2xl p-6 card-hover group animate-in",
                  `stagger-${i + 1}`,
                )}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    bg,
                  )}
                >
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <h3 className="font-bold font-display text-base mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="relative max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "2,00,000+", label: "Happy Travelers", icon: Users },
            { value: "500+", label: "Agent Partners", icon: BadgeCheck },
            { value: "200+", label: "Airlines", icon: Plane },
            { value: "₹50Cr+", label: "Bookings Processed", icon: TrendingUp },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <Icon className="h-6 w-6 mx-auto text-primary" />
              <p className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                {value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* B2B SECTION */}
      <section id="agents" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary">
                <Building2 className="h-3.5 w-3.5" /> For Travel Professionals
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display leading-snug">
                Grow your travel business with our{" "}
                <span className="gradient-text">B2B Agent Portal</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Join hundreds of travel agents who trust Tramps Aviation for
                competitive rates, powerful management tools, and dedicated
                support.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: CreditCard,
                    text: "Wallet system with credit limit up to ₹5 Lakh",
                    color: "text-emerald-500",
                  },
                  {
                    icon: BarChart3,
                    text: "Commission dashboard with real-time earnings",
                    color: "text-primary",
                  },
                  {
                    icon: Lock,
                    text: "KYC-verified secure platform with fraud protection",
                    color: "text-violet-500",
                  },
                  {
                    icon: Award,
                    text: "Exclusive B2B rates not available to consumers",
                    color: "text-amber-500",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5",
                        color,
                      )}
                    >
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <p className="text-sm text-muted-foreground pt-1.5">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/b2b/register">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Register as Agent <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/b2c/login">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 font-semibold text-sm transition-all w-full sm:w-auto">
                    Agent Login
                  </button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Commission Earned",
                  value: "₹4.8L",
                  sub: "This month",
                  icon: TrendingUp,
                  color: "bg-emerald-500/10",
                  ic: "text-emerald-600",
                },
                {
                  label: "Active Bookings",
                  value: "284",
                  sub: "This month",
                  icon: Plane,
                  color: "bg-primary/10",
                  ic: "text-primary",
                },
                {
                  label: "Wallet Balance",
                  value: "₹2.1L",
                  sub: "Available",
                  icon: CreditCard,
                  color: "bg-violet-500/10",
                  ic: "text-violet-600",
                },
                {
                  label: "Partner Agents",
                  value: "500+",
                  sub: "Nationwide",
                  icon: Users,
                  color: "bg-amber-500/10",
                  ic: "text-amber-600",
                },
              ].map(({ label, value, sub, icon: Icon, color, ic }) => (
                <div
                  key={label}
                  className="bg-card border border-border rounded-2xl p-5 card-hover group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center mb-4",
                      color,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", ic)} />
                  </div>
                  <p className="text-2xl font-bold font-display gradient-text">
                    {value}
                  </p>
                  <p className="text-xs font-semibold mt-1">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <UserReviews />

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-card border border-border overflow-hidden p-8 sm:p-10">
            <div className="absolute inset-0 mesh-bg opacity-60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative">
              {/* Heading — center */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary mb-4">
                  <Zap className="h-3.5 w-3.5 fill-current" /> We are here to
                  help you
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-display mb-3">
                  Have questions? Let's talk.
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Whether you're a traveler or a travel agent — our team is
                  available 24/7 to assist you with bookings, refunds, or
                  anything else.
                </p>
              </div>

              {/* 2 contact cards — equal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/919115500112"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-[#25D366]/8 border border-[#25D366]/25 hover:bg-[#25D366]/15 hover:border-[#25D366]/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/25 transition-colors">
                    <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#25D366] uppercase tracking-wide mb-0.5">
                      WhatsApp
                    </p>
                    <p className="text-base font-bold text-foreground">
                      Chat with Us
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quick replies • Available now
                    </p>
                  </div>
                </a>

                {/* Contact Us */}
                <Link
                  href="/contact"
                  className="flex items-center gap-4 p-5 rounded-2xl bg-primary/8 border border-primary/25 hover:bg-primary/15 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
                      Email / Form
                    </p>
                    <p className="text-base font-bold text-foreground">
                      Contact Us
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      We reply within 24 hours
                    </p>
                  </div>
                </Link>
              </div>

              {/* Bottom link */}
              <div className="flex items-center justify-center mt-8 pt-6 border-t border-border">
                <Link
                  href="/flights"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 text-sm font-semibold transition-all"
                >
                  Search Flights <Search className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CommonFooter />
    </div>
  );
}

function SearchField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  icon: any;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="field-wrapper">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0 truncate"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
