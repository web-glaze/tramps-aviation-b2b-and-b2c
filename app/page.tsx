'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, Hotel, Shield, Star, Users, TrendingUp, ArrowRight,
  Search, MapPin, Calendar, Phone, Mail, Instagram,
  Twitter, Facebook, Linkedin, Zap, Clock, HeartHandshake,
  BadgeCheck, Menu, X, Sparkles, Award,
  Building2, CreditCard, BarChart3, Lock, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'

const POPULAR_ROUTES = [
  { from: 'DEL', fromCity: 'Delhi',     to: 'BOM', toCity: 'Mumbai',    price: '₹2,199' },
  { from: 'BOM', fromCity: 'Mumbai',    to: 'BLR', toCity: 'Bangalore', price: '₹1,899' },
  { from: 'DEL', fromCity: 'Delhi',     to: 'GOI', toCity: 'Goa',       price: '₹2,499' },
  { from: 'BLR', fromCity: 'Bangalore', to: 'HYD', toCity: 'Hyderabad', price: '₹1,299' },
  { from: 'MAA', fromCity: 'Chennai',   to: 'DEL', toCity: 'Delhi',     price: '₹2,799' },
  { from: 'BOM', fromCity: 'Mumbai',    to: 'CCU', toCity: 'Kolkata',   price: '₹2,399' },
]

const AIRLINES = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoFirst', 'AirAsia']

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Frequent Traveler', city: 'Mumbai', stars: 5,
    text: 'Best platform for booking flights! The prices are unbeatable and the booking process is super smooth. Highly recommended.' },
  { name: 'Rajesh Kumar', role: 'Travel Agent', city: 'Delhi', stars: 5,
    text: 'The B2B portal has completely transformed my business. Commission structure is excellent and wallet system works perfectly.' },
  { name: 'Anita Verma', role: 'Freelance Traveler', city: 'Bangalore', stars: 4,
    text: 'Great customer support and instant ticket delivery. Had an issue once and they resolved it within 30 minutes!' },
]

export default function HomePage() {
  const router = useRouter()
  const { user, role } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(v => (v + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const handleSearch = () => {
    if (!from || !to || !date) { alert('Please fill all search fields'); return }
    router.push(`/b2c/search?from=${from}&to=${to}&date=${date}`)
  }

  const dashboardLink = role === 'agent' ? '/b2b/dashboard' : '/b2c/my-trips'

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* NAV */}
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled ? 'h-16 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm' : 'h-20 bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg font-display leading-none">TravelPro</span>
              <span className="text-[10px] text-muted-foreground block leading-none tracking-wide">B2B & B2C Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/b2c/search', label: 'Flights' },
              { href: '#features',   label: 'Features' },
              { href: '#agents',     label: 'For Agents' },
              { href: '#contact',    label: 'Contact' },
            ].map(({ href, label }) => (
              <Link key={label} href={href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Link href={dashboardLink}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/25">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/b2c/login">
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/b2c/register">
                  <button className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20">
                    Get Started
                  </button>
                </Link>
                <Link href="/b2b/register">
                  <button className="px-4 py-2 text-sm font-semibold border border-border hover:border-primary/50 hover:text-primary rounded-xl transition-all">
                    Agent Portal
                  </button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl animate-in">
            <div className="px-4 py-4 space-y-1">
              {[
                { href: '/b2c/search',         label: '✈  Search Flights' },
                { href: '/b2c/login',          label: '👤  Sign In' },
                { href: '/b2c/register',       label: '🚀  Register (B2C)' },
                { href: '/b2b/login', label: '🏢  Agent Login' },
              ].map(({ href, label }) => (
                <Link key={label} href={href} onClick={() => setMobileMenu(false)}
                  className="flex items-center px-4 py-3 text-sm font-medium hover:bg-muted rounded-xl transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-primary/6 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-[8%] text-primary/15 text-5xl font-black select-none hidden lg:block animate-float">✦</div>
        <div className="absolute bottom-40 right-[6%] text-primary/10 text-4xl font-black select-none hidden lg:block animate-float" style={{animationDelay:'1.5s'}}>◆</div>

        <div className="relative max-w-5xl mx-auto w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 text-xs font-semibold text-primary animate-in">
            <Sparkles className="h-3 w-3 fill-current" />
            India's Most Trusted B2B & B2C Travel Platform
            <Sparkles className="h-3 w-3 fill-current" />
          </div>

          <div className="space-y-3 animate-in stagger-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold font-display tracking-tight leading-[1.08]">
              Travel Smarter,{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text-animated">Book Faster</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Flights, hotels & travel insurance for travelers and travel agents.
              Best prices, instant confirmation, 24/7 support.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-card/85 glass border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/10 max-w-3xl mx-auto text-left animate-in stagger-2">
            <div className="flex gap-1 mb-5 bg-muted/60 rounded-xl p-1 w-fit">
              {([
                { key: 'flights', label: 'Flights', icon: Plane },
                { key: 'hotels',  label: 'Hotels',  icon: Hotel },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={cn('flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <SearchField label="From" icon={MapPin} placeholder="Delhi (DEL)" value={from} onChange={setFrom} />
              <SearchField label="To"   icon={MapPin} placeholder="Mumbai (BOM)" value={to}   onChange={setTo}   />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Departure Date</label>
                <div className="field-wrapper">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <input type="date" className="flex-1 bg-transparent text-sm outline-none text-foreground"
                    value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            <button onClick={handleSearch}
              className="w-full mt-4 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99]">
              <Search className="h-4 w-4" />
              Search {activeTab === 'flights' ? 'Flights' : 'Hotels'}
            </button>
          </div>

          {/* Popular Routes */}
          <div className="animate-in stagger-3">
            <p className="text-xs text-muted-foreground mb-3 font-medium">✈ Popular Routes</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_ROUTES.map(r => (
                <button key={r.from + r.to}
                  onClick={() => router.push(`/b2c/search?from=${r.from}&to=${r.to}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-medium text-muted-foreground hover:text-primary transition-all">
                  {r.fromCity} → {r.toCity}
                  <span className="text-primary font-semibold">{r.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap animate-in stagger-4">
            {[
              { value: '2L+', label: 'Happy Travelers' },
              { value: '500+', label: 'Travel Agents' },
              { value: '200+', label: 'Airlines' },
              { value: '₹50Cr+', label: 'Bookings Processed' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold font-display gradient-text">{value}</p>
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
          {AIRLINES.map(name => (
            <div key={name} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
              Why TravelPro
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display mt-4 mb-3">
              Everything you need to travel
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From booking to boarding — we've got you covered at every step of your journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Plane,         title: 'Flight Booking',   desc: 'Real-time search across 200+ airlines with instant PNR and e-ticket delivery in minutes.',         color: 'text-blue-500',   bg: 'bg-blue-500/10',   delay: 1 },
              { icon: Hotel,         title: 'Hotel Booking',    desc: 'Thousands of hotels globally with best price guarantee and flexible cancellation.',                  color: 'text-amber-500',  bg: 'bg-amber-500/10',  delay: 2 },
              { icon: Shield,        title: 'Travel Insurance', desc: 'Comprehensive plans from Bajaj Allianz starting ₹799 with cashless claim support.',                 color: 'text-emerald-500',bg: 'bg-emerald-500/10',delay: 3 },
              { icon: HeartHandshake,title: 'B2B Agent Portal', desc: 'Exclusive agent rates, structured commissions, credit wallet and dedicated support.',               color: 'text-violet-500', bg: 'bg-violet-500/10', delay: 4 },
              { icon: Zap,           title: 'Instant Booking',  desc: 'Immediate confirmation, instant ticket delivery with complete PNR details.',                        color: 'text-rose-500',   bg: 'bg-rose-500/10',   delay: 5 },
              { icon: Clock,         title: '24/7 Support',     desc: 'Round-the-clock customer support for all your travel needs, wherever you are.',                     color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   delay: 6 },
            ].map(({ icon: Icon, title, desc, color, bg, delay }) => (
              <div key={title} className={cn('bg-card border border-border rounded-2xl p-6 card-hover group animate-in', `stagger-${delay}`)}>
                <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <h3 className="font-bold font-display text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-16 px-4 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-primary-foreground text-center">
          {[
            { value: '2,00,000+', label: 'Happy Travelers',    icon: Users },
            { value: '500+',      label: 'Agent Partners',     icon: BadgeCheck },
            { value: '200+',      label: 'Airlines',           icon: Plane },
            { value: '₹50Cr+',   label: 'Bookings Processed',  icon: TrendingUp },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <Icon className="h-6 w-6 mx-auto opacity-75" />
              <p className="text-2xl sm:text-3xl font-bold font-display">{value}</p>
              <p className="text-xs text-primary-foreground/70 font-medium">{label}</p>
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
                Grow your travel business with our{' '}
                <span className="gradient-text">B2B Agent Portal</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Join hundreds of travel agents who trust TravelPro for competitive rates,
                powerful management tools, and dedicated support to grow their business.
              </p>
              <div className="space-y-3">
                {[
                  { icon: CreditCard, text: 'Wallet system with credit limit up to ₹5 Lakh', color: 'text-emerald-500' },
                  { icon: BarChart3,  text: 'Commission dashboard with real-time earnings',   color: 'text-blue-500' },
                  { icon: Lock,       text: 'KYC-verified secure platform with fraud protection', color: 'text-violet-500' },
                  { icon: Award,      text: 'Exclusive B2B rates not available to consumers',  color: 'text-amber-500' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className={cn('h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5', color)}>
                      <Icon className={cn('h-4 w-4', color)} />
                    </div>
                    <p className="text-sm text-muted-foreground pt-1.5">{text}</p>
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
                { label: 'Commission Earned', value: '₹4.8L', sub: 'This month', icon: TrendingUp, color: 'bg-emerald-500/10', ic: 'text-emerald-600' },
                { label: 'Active Bookings',   value: '284',   sub: 'This month', icon: Plane,      color: 'bg-blue-500/10',   ic: 'text-blue-600'   },
                { label: 'Wallet Balance',    value: '₹2.1L', sub: 'Available',  icon: CreditCard, color: 'bg-violet-500/10', ic: 'text-violet-600' },
                { label: 'Partner Agents',    value: '500+',  sub: 'Nationwide', icon: Users,      color: 'bg-amber-500/10',  ic: 'text-amber-600'  },
              ].map(({ label, value, sub, icon: Icon, color, ic }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-5 card-hover group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-4', color)}>
                    <Icon className={cn('h-5 w-5', ic)} />
                  </div>
                  <p className="text-2xl font-bold font-display gradient-text">{value}</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold font-display">Trusted by travelers & agents</h2>
            <p className="text-muted-foreground text-sm mt-2">Real reviews from real customers</p>
          </div>
          <div className="hidden sm:grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, city, stars, text }) => (
              <div key={name} className="bg-card border border-border rounded-2xl p-6 card-hover">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({length: stars}).map((_,i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role} · {city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sm:hidden">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({length: TESTIMONIALS[activeTestimonial].stars}).map((_,i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{TESTIMONIALS[activeTestimonial].text}"</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {TESTIMONIALS[activeTestimonial].name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{TESTIMONIALS[activeTestimonial].name}</p>
                  <p className="text-xs text-muted-foreground">{TESTIMONIALS[activeTestimonial].role} · {TESTIMONIALS[activeTestimonial].city}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={cn('h-1.5 rounded-full transition-all', i === activeTestimonial ? 'w-6 bg-primary' : 'w-1.5 bg-border')} />
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
                Join 2 lakh+ happy travelers. Sign up free and unlock the best deals on flights, hotels and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/b2c/register">
                  <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/b2c/search">
                  <button className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-primary/50 font-semibold transition-all">
                    Search Flights <Search className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="py-14 grid grid-cols-2 sm:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 w-fit">
                <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                  <Plane className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg font-display">TravelPro</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                India's premier B2B & B2C travel platform. Best prices on flights, hotels and insurance.
              </p>
              <div className="flex gap-2">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <button key={i} className="h-8 w-8 rounded-lg border border-border hover:border-primary/50 hover:text-primary flex items-center justify-center transition-all text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="tel:+911800001234" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5" /> 1800-001-2345 (Toll Free)
                </a>
                <a href="mailto:support@travelpro.in" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5" /> support@travelpro.in
                </a>
              </div>
            </div>

            {[
              { title: 'Platform', links: [
                  { href: '/b2c/search',         label: 'Search Flights' },
                  { href: '/b2b/register', label: 'Agent Portal' },
                  { href: '/b2c/login',          label: 'Sign In' },
                  { href: '/b2c/register',       label: 'Register' },
              ]},
              { title: 'Company', links: [
                  { href: '/cms/about',   label: 'About Us' },
                  { href: '/cms/careers', label: 'Careers' },
                  { href: '/cms/press',   label: 'Press' },
                  { href: '/cms/contact', label: 'Contact' },
              ]},
              { title: 'Legal', links: [
                  { href: '/cms/terms',   label: 'Terms of Service' },
                  { href: '/cms/privacy', label: 'Privacy Policy' },
                  { href: '/cms/refund',  label: 'Refund Policy' },
                  { href: '/cms/faq',     label: 'FAQs' },
              ]},
            ].map(({ title, links }) => (
              <div key={title} className="space-y-4">
                <h4 className="font-bold text-sm">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ href, label }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                        {label}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © 2025 TravelPro India Pvt. Ltd. All rights reserved. | IATA Accredited | RBI Licensed
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-500" /> Secured by SSL</span>
              <span className="flex items-center gap-1"><BadgeCheck className="h-3 w-3 text-blue-500" /> IATA Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SearchField({ label, icon: Icon, placeholder, value, onChange }: {
  label: string; icon: any; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="field-wrapper">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}
