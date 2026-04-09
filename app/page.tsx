"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  Hotel,
  Shield,
  Star,
  Users,
  TrendingUp,
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Zap,
  Clock,
  HeartHandshake,
  BadgeCheck,
  Sparkles,
  Award,
  Building2,
  CreditCard,
  BarChart3,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { CommonHeader } from "@/components/layout/CommonHeader";
import { CommonFooter } from "@/components/layout/CommonFooter";

const POPULAR_ROUTES = [
  {
    from: "DEL",
    fromCity: "Delhi",
    to: "BOM",
    toCity: "Mumbai",
    price: "₹2,199",
  },
  {
    from: "BOM",
    fromCity: "Mumbai",
    to: "BLR",
    toCity: "Bangalore",
    price: "₹1,899",
  },
  { from: "DEL", fromCity: "Delhi", to: "GOI", toCity: "Goa", price: "₹2,499" },
  {
    from: "BLR",
    fromCity: "Bangalore",
    to: "HYD",
    toCity: "Hyderabad",
    price: "₹1,299",
  },
  {
    from: "MAA",
    fromCity: "Chennai",
    to: "DEL",
    toCity: "Delhi",
    price: "₹2,799",
  },
  {
    from: "BOM",
    fromCity: "Mumbai",
    to: "CCU",
    toCity: "Kolkata",
    price: "₹2,399",
  },
];

const AIRLINES = [
  "IndiGo",
  "Air India",
  "SpiceJet",
  "Vistara",
  "GoFirst",
  "AirAsia",
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Frequent Traveler",
    city: "Mumbai",
    stars: 5,
    text: "Best platform for booking flights! The prices are unbeatable and the booking process is super smooth. Highly recommended.",
  },
  {
    name: "Rajesh Kumar",
    role: "Travel Agent",
    city: "Delhi",
    stars: 5,
    text: "The B2B portal has completely transformed my business. Commission structure is excellent and wallet system works perfectly.",
  },
  {
    name: "Anita Verma",
    role: "Freelance Traveler",
    city: "Bangalore",
    stars: 4,
    text: "Great customer support and instant ticket delivery. Had an issue once and they resolved it within 30 minutes!",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "insurance" | "series-fare">("flights");
  // Flight search state
  const [from, setFrom] = useState("DEL");
  const [to, setTo] = useState("BOM");
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState("1");
  // Hotel search state
  const [hotelCity, setHotelCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState("1");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((v) => (v + 1) % TESTIMONIALS.length),
      4500,
    );
    return () => clearInterval(t);
  }, []);

  const handleSearch = () => {
    if (activeTab === "hotels") {
      if (!hotelCity) { alert("Please enter a city"); return; }
      if (!checkIn)   { alert("Please select check-in date"); return; }
      router.push(`/b2c/hotels?city=${encodeURIComponent(hotelCity)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`);
      return;
    }
    if (activeTab === "insurance") {
      router.push("/b2c/insurance");
      return;
    }
    if (activeTab === "series-fare") {
      router.push(`/b2c/series-fare?from=${from.toUpperCase()}&to=${to.toUpperCase()}&date=${date}&adults=${adults}`);
      return;
    }
    // Flights — no auth check, just search
    if (!from || !to) { alert("Please enter origin and destination"); return; }
    if (!date)         { alert("Please select a travel date"); return; }
    router.push(`/b2c/flights?from=${from.toUpperCase()}&to=${to.toUpperCase()}&date=${date}&adults=${adults}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* COMMON HEADER */}
      <CommonHeader variant="home" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/6 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-[8%] text-primary/15 text-5xl font-black select-none hidden lg:block animate-float">
          ✦
        </div>
        <div
          className="absolute bottom-40 right-[6%] text-primary/10 text-4xl font-black select-none hidden lg:block animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          ◆
        </div>

        <div className="relative max-w-5xl mx-auto w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary animate-in">
            <Sparkles className="h-3 w-3 fill-current" />
            India's Most Trusted B2B & B2C Tramps Aviation
            <Sparkles className="h-3 w-3 fill-current" />
          </div>

          <div className="space-y-3 animate-in stagger-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold font-display tracking-tight leading-[1.08]">
              Tramps Aviation Smarter, <br className="hidden sm:block" />
              <span className="gradient-text-animated">Book Faster</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Flights, hotels & travel insurance for travelers and travel
              agents. Best prices, instant confirmation, 24/7 support.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-card/85 glass border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/10 max-w-3xl mx-auto text-left animate-in stagger-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-muted/60 rounded-xl p-1 w-fit">
              {([
                { key: "flights",   label: "✈ Flights",   },
                { key: "hotels",    label: "🏨 Hotels",    },
                { key: "insurance", label: "🛡 Insurance", },
                { key: "series-fare", label: "🎫 Series Fare", },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab===key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {label}
                </button>
              ))}
            </div>

            {/* Flight search */}
            {activeTab === "flights" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField label="From" icon={MapPin} placeholder="Delhi (DEL)" value={from} onChange={setFrom}/>
                <SearchField label="To"   icon={MapPin} placeholder="Mumbai (BOM)" value={to}   onChange={setTo}/>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Departure Date</label>
                  <div className="field-wrapper">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="date" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adults</label>
                  <div className="field-wrapper">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="number" min="1" max="9" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={adults} onChange={e=>setAdults(e.target.value)} placeholder="1"/>
                  </div>
                </div>
              </div>
            )}

            {/* Hotel search */}
            {activeTab === "hotels" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField label="City / Destination" icon={MapPin} placeholder="Mumbai, Goa, Delhi…" value={hotelCity} onChange={setHotelCity}/>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Check-in</label>
                  <div className="field-wrapper">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="date" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={checkIn} onChange={e=>setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]}/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Check-out</label>
                  <div className="field-wrapper">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="date" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={checkOut} onChange={e=>setCheckOut(e.target.value)} min={checkIn||new Date().toISOString().split("T")[0]}/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rooms</label>
                  <div className="field-wrapper">
                    <Hotel className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="number" min="1" max="9" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={rooms} onChange={e=>setRooms(e.target.value)} placeholder="1"/>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance */}
            {activeTab === "insurance" && (
              <div className="py-4 text-center space-y-3">
                <p className="text-muted-foreground text-sm">Get travel insurance for flights, trips and medical emergencies</p>
                <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
                  {["Medical Emergency Cover","Trip Cancellation","Baggage Loss","Flight Delay"].map(f=>(
                    <span key={f} className="flex items-center gap-1 bg-muted/50 px-3 py-1.5 rounded-full">✓ {f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Series Fare — Tramps Aviation exclusive fares */}
            {activeTab === "series-fare" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchField label="From" icon={MapPin} placeholder="Delhi (DEL)" value={from} onChange={setFrom}/>
                <SearchField label="To"   icon={MapPin} placeholder="Mumbai (BOM)" value={to}   onChange={setTo}/>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Departure Date</label>
                  <div className="field-wrapper">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="date" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adults</label>
                  <div className="field-wrapper">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                    <input type="number" min="1" max="9" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                      value={adults} onChange={e=>setAdults(e.target.value)} placeholder="1"/>
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <span className="text-base">✈</span>
                    <span><strong>Series Fare</strong> — Exclusive Tramps Aviation fares with bulk booking discounts. Group & series inventory at special rates.</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSearch}
              className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99]">
              <Search className="h-4 w-4"/>
              {activeTab==="flights" ? "Search Flights" : activeTab==="hotels" ? "Search Hotels" : activeTab==="series-fare" ? "Search Series Fares" : "Get Insurance Plans"}
            </button>
          </div>

          {/* Popular Routes */}
          <div className="animate-in stagger-3">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              ✈ Popular Routes
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={r.from + r.to}
                  onClick={() =>
                    router.push(`/b2c/flights?from=${r.from}&to=${r.to}`)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-medium text-muted-foreground hover:text-primary transition-all"
                >
                  {r.fromCity} → {r.toCity}
                  <span className="text-[#e44b0f] font-semibold">{r.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap animate-in stagger-4">
            {[
              { value: "2L+",     label: "Happy Travelers",    color: "text-primary" },
              { value: "500+",    label: "Travel Agents",      color: "text-[#208dcb]" },
              { value: "200+",    label: "Airlines",           color: "text-primary" },
              { value: "₹50Cr+", label: "Bookings Processed",  color: "text-[#208dcb]" },
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

      {/* AIRLINES */}
      <div className="py-10 border-y border-border bg-muted/20">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          We cover all major airlines
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap px-4">
          {AIRLINES.map((name) => (
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

      {/* FEATURES */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-in">
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
                delay: 1,
              },
              {
                icon: Hotel,
                title: "Hotel Booking",
                desc: "Thousands of hotels globally with best price guarantee and flexible cancellation.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                delay: 2,
              },
              {
                icon: Shield,
                title: "Travel Insurance",
                desc: "Comprehensive plans from Bajaj Allianz starting ₹799 with cashless claim support.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                delay: 3,
              },
              {
                icon: HeartHandshake,
                title: "B2B Agent Portal",
                desc: "Exclusive agent rates, structured commissions, credit wallet and dedicated support.",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
                delay: 4,
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Immediate confirmation, instant ticket delivery with complete PNR details.",
                color: "text-rose-500",
                bg: "bg-rose-500/10",
                delay: 5,
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Round-the-clock customer support for all your travel needs, wherever you are.",
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
                delay: 6,
              },
            ].map(({ icon: Icon, title, desc, color, bg, delay }) => (
              <div
                key={title}
                className={cn(
                  "bg-card border border-border rounded-2xl p-6 card-hover group animate-in",
                  `stagger-${delay}`,
                )}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform",
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
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="relative max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
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
      <section id="agents" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary">
                <Building2 className="h-3.5 w-3.5" />
                For Travel Professionals
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display leading-snug">
                Grow your travel business with our{" "}
                <span className="gradient-text">B2B Agent Portal</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Join hundreds of travel agents who trust Tramps Aviation for
                competitive rates, powerful management tools, and dedicated
                support to grow their business.
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

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-display">
              Trusted by travelers & agents
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Real reviews from real customers
            </p>
          </div>
          <div className="hidden sm:grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, city, stars, text }) => (
              <div
                key={name}
                className="bg-card border border-border rounded-2xl p-6 card-hover"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role} · {city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sm:hidden">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({
                  length: TESTIMONIALS[activeTestimonial].stars,
                }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {TESTIMONIALS[activeTestimonial].name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {TESTIMONIALS[activeTestimonial].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {TESTIMONIALS[activeTestimonial].role} ·{" "}
                    {TESTIMONIALS[activeTestimonial].city}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeTestimonial
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-card border border-border overflow-hidden p-10 sm:p-14 text-center">
            <div className="absolute inset-0 mesh-bg opacity-60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary mb-5">
                <Zap className="h-3.5 w-3.5 fill-current" />
                Start booking in seconds
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">
                Ready to explore the world?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join 2 lakh+ happy travelers. Sign up free and unlock the best
                deals on flights, hotels and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/b2c/register">
                  <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/b2c/flights">
                  <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-primary/50 font-semibold transition-all">
                    Search Flights <Search className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMON FOOTER */}
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
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}