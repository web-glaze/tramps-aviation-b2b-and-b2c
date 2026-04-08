'use client'
import { useState, useMemo } from 'react'
import { searchApi, agentApi, unwrap } from '@/lib/api/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plane, Search, Luggage, ArrowRight, ArrowLeftRight, Loader2, ChevronDown, ChevronUp, Star, SlidersHorizontal, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const POPULAR_ROUTES = [
  { from: 'DEL', to: 'BOM' }, { from: 'ATQ', to: 'SHJ' },
  { from: 'DEL', to: 'DXB' }, { from: 'BOM', to: 'GOI' },
]

// ── Price extractor (handles flat number or object) ──────────────────────────
function getPrice(f: any): number {
  if (!f) return 0
  const p = f.price
  if (typeof p === 'number') return p
  if (typeof p === 'object' && p) return p.total || p.grandTotal || 0
  return f.fare?.total || f.fare?.totalFare || 0
}

// ── Time helper ───────────────────────────────────────────────────────────────
function toHHMM(v?: string): string {
  if (!v) return ''
  if (v.includes('T')) return v.split('T')[1].slice(0, 5)
  if (v.match(/^\d{2}:\d{2}/)) return v.slice(0, 5)
  return v
}

// ── Normalize a flight from any source ───────────────────────────────────────
function normalizeFlight(f: any): any {
  const dep = toHHMM(f.departureTime || f.departure || '')
  const arr = toHHMM(f.arrivalTime   || f.arrival   || '')
  let dur = f.duration || f.durationStr || ''
  if (typeof f.duration === 'number') {
    const h = Math.floor(f.duration / 60), m = f.duration % 60
    dur = `${h}h${m > 0 ? ` ${m}m` : ''}`
  }
  const checkinBag =
    (typeof f.checkinBaggage === 'string' ? f.checkinBaggage : '') ||
    (typeof f.checkInBaggage === 'string' ? f.checkInBaggage : '') ||
    (typeof f.baggage        === 'string' ? f.baggage        : '') || '15 KG'
  return {
    ...f,
    departureTime: dep,
    arrivalTime:   arr,
    departure:     dep,
    arrival:       arr,
    duration:      dur,
    price:         getPrice(f),
    checkinBaggage: checkinBag,
    cabinBaggage:   f.cabinBaggage || '7 KG',
    flightNumber:   f.flightNumber || f.flightNo || '',
    cabinClass:     f.cabinClass || f.cabin || 'ECONOMY',
    stops:          typeof f.stops === 'number' ? f.stops : 0,
    refundable:     f.isRefundable ?? f.refundable ?? true,
  }
}

// ── FlightCard ────────────────────────────────────────────────────────────────
function FlightCard({ flight, onBook }: { flight: any; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const isTrampsFare = flight.source === 'TRAMPS' || flight.resultToken?.startsWith('TRAMPS-')
  const price = flight.price || 0

  return (
    <div className={cn(
      'bg-card border rounded-xl overflow-hidden transition-all',
      isTrampsFare
        ? 'border-amber-300 dark:border-amber-700 shadow-sm shadow-amber-100 dark:shadow-amber-950'
        : 'border-border hover:border-primary/30'
    )}>
      {isTrampsFare && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 flex items-center gap-2">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Tramps Aviation Ticket — {flight.airline}
          </span>
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-500 flex-shrink-0">
            {!flight.refundable ? 'Non-Refundable' : 'Refundable'}
          </span>
        </div>
      )}

      <div className="p-4 flex items-center gap-4">
        {/* Airline badge */}
        <div className="w-20 flex-shrink-0 text-center">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-1 text-sm font-black text-white',
            isTrampsFare ? 'bg-amber-500' : 'bg-primary')}>
            {(flight.airlineCode || flight.flightNumber?.split('-')[0] || '?').slice(0, 2)}
          </div>
          <p className="text-xs font-semibold leading-tight truncate">{flight.airline}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{flight.flightNumber}</p>
        </div>

        {/* Route + time */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="text-center flex-shrink-0">
            <p className="text-2xl font-bold font-mono tabular-nums">
              {flight.departureTime || '—'}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">{flight.origin || flight.from}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
            <p className="text-xs text-muted-foreground">
              {flight.duration || ''}
            </p>
            <div className="flex items-center gap-1 w-full">
              <div className="h-px flex-1 bg-border" />
              <Plane className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">
              {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
            </p>
          </div>
          <div className="text-center flex-shrink-0">
            <p className="text-2xl font-bold font-mono tabular-nums">
              {flight.arrivalTime || '—'}
            </p>
            <p className="text-xs font-semibold text-muted-foreground">{flight.destination || flight.to}</p>
          </div>
        </div>

        {/* Price & book */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Per person</p>
          <p className={cn('text-2xl font-bold', isTrampsFare ? 'text-amber-600 dark:text-amber-400' : 'text-primary')}>
            ₹{price.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mb-2">{flight.cabinClass || 'Economy'}</p>
          <Button size="sm" onClick={onBook}
            className={cn('gap-1', isTrampsFare && 'bg-amber-600 hover:bg-amber-700 text-white')}>
            Book <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Quick info strip */}
      <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground bg-muted/20">
        <span className="flex items-center gap-1"><Luggage className="h-3 w-3"/>{flight.checkinBaggage} check-in</span>
        <span className="flex items-center gap-1"><Luggage className="h-3 w-3"/>{flight.cabinBaggage} cabin</span>
        <span className={flight.refundable ? 'text-green-600 dark:text-green-400' : ''}>
          {flight.refundable ? '✓ Refundable' : 'Non-refundable'}
        </span>
        <button onClick={() => setExpanded(e => !e)}
          className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors">
          {expanded ? 'Hide details' : 'Show details'}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-3 border-t border-border">
          {[
            ['Flight', flight.flightNumber],
            ['Class', flight.cabinClass || 'Economy'],
            ['Stops', flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`],
            ['Refund', !flight.refundable ? 'No' : 'Yes'],
            ['Check-in Bag', flight.checkinBaggage],
            ['Cabin Bag', flight.cabinBaggage],
            ['Base Fare', `₹${(flight.fare?.baseFare || price).toLocaleString()}`],
            ['Taxes', `₹${(flight.fare?.taxes || 0).toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-muted-foreground mb-0.5">{k}</p>
              <p className={cn('font-medium text-sm', k==='Refund' && !flight.refundable ? 'text-red-500' : '')}>{v}</p>
            </div>
          ))}
          {flight.notes && (
            <div className="col-span-2 sm:col-span-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2.5">
              <p className="text-xs text-amber-700 dark:text-amber-400">{flight.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ flights, filters, setFilters, sortBy, setSortBy }: any) {
  const prices  = flights.map((f: any) => f.price).filter(Boolean)
  const minPrice = Math.min(...prices, 0)
  const maxPrice = Math.max(...prices, 0)
  const airlines = Array.from(new Set<string>(flights.map((f: any) => f.airline).filter(Boolean)))
  const classes  = Array.from(new Set<string>(flights.map((f: any) => f.cabinClass || 'ECONOMY').filter(Boolean)))
  const hasFilters = filters.stops !== 'all' || filters.refund !== 'all' || filters.cabin !== 'all' || filters.maxPrice < maxPrice

  const btn = (active: boolean) =>
    `w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />Filters
        </p>
        {hasFilters && (
          <button onClick={() => setFilters({ stops:'all', refund:'all', cabin:'all', maxPrice: maxPrice })}
            className="text-xs text-primary hover:underline">Clear all</button>
        )}
      </div>

      {/* Price Range */}
      {maxPrice > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Price Range</p>
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>₹{minPrice.toLocaleString()}</span>
              <span className="font-semibold text-foreground">Up to ₹{(filters.maxPrice||maxPrice).toLocaleString()}</span>
            </div>
            <input type="range" min={minPrice} max={maxPrice} step={100}
              value={filters.maxPrice || maxPrice}
              onChange={e => setFilters((f: any) => ({ ...f, maxPrice: Number(e.target.value) }))}
              className="w-full accent-primary" />
          </div>
        </div>
      )}

      {/* Sort */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Sort By</p>
        <div className="space-y-1">
          {[['price','💰 Cheapest first'],['departure','🕐 Earliest departure'],['duration','⚡ Fastest first']].map(([v,l])=>(
            <button key={v} onClick={()=>setSortBy(v)} className={btn(sortBy===v)}>{sortBy===v && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}</button>
          ))}
        </div>
      </div>

      {/* Stops */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Stops</p>
        <div className="space-y-1">
          {[['all','Any stops'],['0','Non-stop only'],['1','1 stop']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilters((f: any)=>({...f,stops:v}))} className={btn(filters.stops===v)}>{filters.stops===v && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}</button>
          ))}
        </div>
      </div>

      {/* Cabin Class */}
      {classes.length > 1 && (
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Cabin Class</p>
          <div className="space-y-1">
            <button onClick={()=>setFilters((f: any)=>({...f,cabin:'all'}))} className={btn(filters.cabin==='all')}>{filters.cabin==='all' && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}Any class</button>
            {classes.map(c=>(
              <button key={c} onClick={()=>setFilters((f: any)=>({...f,cabin:c}))} className={btn(filters.cabin===c)}>{filters.cabin===c && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* Refund */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Refund Policy</p>
        <div className="space-y-1">
          {[['all','Any'],['yes','Refundable only'],['no','Non-refundable']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilters((f: any)=>({...f,refund:v}))} className={btn(filters.refund===v)}>{filters.refund===v && <CheckCircle className="h-3 w-3 flex-shrink-0"/>}{l}</button>
          ))}
        </div>
      </div>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Airlines</p>
          <div className="space-y-1.5">
            {airlines.slice(0,6).map(airline => {
              const count = flights.filter((f: any) => f.airline === airline).length
              const min   = Math.min(...flights.filter((f: any) => f.airline === airline).map(getPrice))
              return (
                <div key={airline} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-xs">
                  <span className="font-medium truncate">{airline}</span>
                  <span className="text-primary font-semibold ml-2 flex-shrink-0">₹{min.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AgentFlightsPage() {
  const [searchForm, setSearchForm] = useState({
    origin:'DEL', destination:'BOM',
    date: new Date().toISOString().split('T')[0],
    passengers:'1', cabinClass:'Economy',
  })
  const [rawFlights, setRawFlights]     = useState<any[]>([])
  const [searching, setSearching]       = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [bookingDialog, setBookingDialog]   = useState(false)
  const [booking, setBooking]           = useState(false)
  const [passengers, setPassengers]     = useState([{firstName:'',lastName:'',dob:'',passportNo:'',gender:'M'}])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [sortBy,  setSortBy]  = useState('price')
  const [filters, setFilters] = useState({ stops:'all', refund:'all', cabin:'all', maxPrice:0 })

  // Normalize all flights on receipt
  const flights = useMemo(() => rawFlights.map(normalizeFlight), [rawFlights])

  // Apply filters + sort
  const maxPriceAll = useMemo(() => Math.max(0, ...flights.map(f => f.price)), [flights])
  const filtered = useMemo(() => {
    const max = filters.maxPrice > 0 ? filters.maxPrice : maxPriceAll
    return flights.filter(f => {
      if (filters.stops !== 'all' && String(f.stops) !== filters.stops) return false
      if (filters.refund === 'yes' && !f.refundable) return false
      if (filters.refund === 'no'  &&  f.refundable) return false
      if (filters.cabin !== 'all' && (f.cabinClass||'ECONOMY') !== filters.cabin) return false
      if (max > 0 && f.price > max) return false
      return true
    }).sort((a, b) => {
      if (sortBy==='price')     return a.price - b.price
      if (sortBy==='departure') return (a.departureTime||'').localeCompare(b.departureTime||'')
      if (sortBy==='duration')  return (a.duration||'').localeCompare(b.duration||'')
      return 0
    })
  }, [flights, filters, sortBy, maxPriceAll])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchForm.origin || !searchForm.destination) { toast.error('Enter origin and destination'); return }
    setSearching(true); setRawFlights([])
    setFilters({ stops:'all', refund:'all', cabin:'all', maxPrice:0 })
    try {
      const res  = await searchApi.searchFlights({
        origin:        searchForm.origin.toUpperCase(),
        destination:   searchForm.destination.toUpperCase(),
        date:          searchForm.date,
        departureDate: searchForm.date,
        passengers:    parseInt(searchForm.passengers),
        adults:        parseInt(searchForm.passengers),
        cabinClass:    searchForm.cabinClass,
      })
      const data = unwrap(res) as any
      const list = data?.flights || data?.data?.flights || []
      setRawFlights(Array.isArray(list) ? list : [])
      if (!list.length) toast.info('No flights found')
      else {
        const t = list.filter((f: any) => f.source==='TRAMPS'||f.resultToken?.startsWith('TRAMPS-')).length
        if (t > 0) toast.success(`${t} Tramps Aviation Ticket${t>1?'s':''} available!`)
      }
    } catch { toast.error('Search failed. Please try again.') }
    finally { setSearching(false) }
  }

  const swapRoute = () => setSearchForm(f => ({ ...f, origin:f.destination, destination:f.origin }))

  const openBooking = (flight: any) => {
    setSelectedFlight(flight)
    const n = parseInt(searchForm.passengers)
    setPassengers(Array.from({length:n}, ()=>({firstName:'',lastName:'',dob:'',passportNo:'',gender:'M'})))
    setBookingDialog(true)
  }

  const handleBook = async () => {
    if (!contactEmail || !passengers.every(p=>p.firstName&&p.lastName)) {
      toast.error('Fill all passenger details and contact email'); return
    }
    setBooking(true)
    try {
      const resultToken = selectedFlight?.resultToken || selectedFlight?.flightKey || selectedFlight?.id || ''
      const res = await agentApi.bookFlight({
        resultToken, flightData: selectedFlight,
        passengers: passengers.map(p=>({ title:'Mr', firstName:p.firstName, lastName:p.lastName, dob:p.dob||'1990-01-01', passportNo:p.passportNo, gender:p.gender||'M' })),
        contactEmail, contactPhone, tripType:'OneWay',
      })
      const data = unwrap(res) as any
      const pnr  = data?.pnr || data?.booking?.pnr || data?.bookingRef || 'N/A'
      toast.success(`✅ Booking confirmed! PNR: ${pnr}`)
      setBookingDialog(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed')
    } finally { setBooking(false) }
  }

  const trampsCount = filtered.filter(f => f.source==='TRAMPS'||f.resultToken?.startsWith('TRAMPS-')).length

  return (
    <div className="space-y-6">
      <PageHeader title="Book Flights" subtitle="Search and book flights for your clients" />

      {/* Search form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>From *</Label>
              <Input value={searchForm.origin}
                onChange={e=>setSearchForm(f=>({...f,origin:e.target.value.toUpperCase()}))}
                placeholder="DEL" maxLength={3} className="uppercase font-mono text-center text-lg font-bold"/>
            </div>
            <div className="space-y-1.5 relative">
              <Label>To *</Label>
              <div className="relative">
                <Input value={searchForm.destination}
                  onChange={e=>setSearchForm(f=>({...f,destination:e.target.value.toUpperCase()}))}
                  placeholder="BOM" maxLength={3} className="uppercase font-mono text-center text-lg font-bold"/>
                <button type="button" onClick={swapRoute}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors hidden sm:flex">
                  <ArrowLeftRight className="h-3 w-3 text-primary-foreground"/>
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={searchForm.date}
                onChange={e=>setSearchForm(f=>({...f,date:e.target.value}))}
                min={new Date().toISOString().split('T')[0]}/>
            </div>
            <div className="space-y-1.5">
              <Label>Passengers</Label>
              <Input type="number" value={searchForm.passengers} min="1" max="9"
                onChange={e=>setSearchForm(f=>({...f,passengers:e.target.value}))}/>
            </div>
            <Button type="submit" className="gap-2 h-10" disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
              {searching ? 'Searching…' : 'Search'}
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR_ROUTES.map(r=>(
              <button key={r.from+r.to} type="button"
                onClick={()=>setSearchForm(f=>({...f,origin:r.from,destination:r.to}))}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results: left filter + right cards */}
      {flights.length > 0 && (
        <div className="flex gap-5">
          {/* ── LEFT Filter panel ── */}
          <div className="w-52 flex-shrink-0 hidden lg:block">
            <FilterPanel flights={flights} filters={filters} setFilters={setFilters} sortBy={sortBy} setSortBy={setSortBy}/>
          </div>

          {/* ── RIGHT Results ── */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filtered.length}</span> flight{filtered.length!==1?'s':''}
                  {filtered.length!==flights.length && <span> (of {flights.length})</span>}
                  {' · '}<span className="font-medium">{searchForm.origin} → {searchForm.destination}</span>
                </p>
                {trampsCount > 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500"/>
                    {trampsCount} Tramps Aviation Ticket{trampsCount!==1?'s':''}
                  </p>
                )}
              </div>
              {/* Mobile sort */}
              <div className="flex gap-1 lg:hidden">
                {[['price','Cheapest'],['departure','Earliest'],['duration','Fastest']].map(([v,l])=>(
                  <button key={v} onClick={()=>setSortBy(v)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${sortBy===v?'bg-primary text-primary-foreground':'text-muted-foreground hover:bg-muted'}`}>{l}</button>
                ))}
              </div>
            </div>

            {filtered.length===0 ? (
              <div className="text-center py-10 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground mb-2">No flights match your filters</p>
                <button onClick={()=>setFilters({stops:'all',refund:'all',cabin:'all',maxPrice:0})} className="text-sm text-primary hover:underline">Clear filters</button>
              </div>
            ) : (
              filtered.map((flight, i) => (
                <FlightCard key={flight.resultToken||flight.flightKey||i} flight={flight} onBook={()=>openBooking(flight)}/>
              ))
            )}
          </div>
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Confirm Booking
              {selectedFlight && (selectedFlight.source==='TRAMPS'||selectedFlight.resultToken?.startsWith('TRAMPS-')) && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500"/>Tramps Ticket
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedFlight?.airline} · {selectedFlight?.flightNumber} · {searchForm.origin} → {searchForm.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Fare summary */}
            <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fare × {searchForm.passengers} pax</span>
                <span>₹{((selectedFlight?.price||0)*parseInt(searchForm.passengers)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border pt-1.5">
                <span>Total</span>
                <span className="text-primary">₹{((selectedFlight?.price||0)*parseInt(searchForm.passengers)).toLocaleString()}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                <span>{selectedFlight?.checkinBaggage} check-in</span>
                <span>{selectedFlight?.cabinBaggage} cabin</span>
                <span>{selectedFlight?.refundable?'Refundable':'Non-refundable'}</span>
              </div>
            </div>

            {/* Passengers */}
            {passengers.map((p, i) => (
              <div key={i} className="space-y-3">
                <p className="text-sm font-semibold">Passenger {i+1}</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['firstName','lastName'] as const).map(k=>(
                    <div key={k}>
                      <Label className="text-xs">{k==='firstName'?'First Name *':'Last Name *'}</Label>
                      <Input value={p[k]} onChange={e=>{const n=[...passengers];n[i]={...n[i],[k]:e.target.value};setPassengers(n)}} className="mt-1" placeholder={k==='firstName'?'First name':'Last name'}/>
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <Input type="date" value={p.dob} onChange={e=>{const n=[...passengers];n[i].dob=e.target.value;setPassengers(n)}} className="mt-1"/>
                  </div>
                  <div>
                    <Label className="text-xs">Gender</Label>
                    <select value={p.gender} onChange={e=>{const n=[...passengers];n[i].gender=e.target.value;setPassengers(n)}}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="M">Male</option><option value="F">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input type="email" value={contactEmail} onChange={e=>setContactEmail(e.target.value)} className="mt-1" placeholder="client@email.com"/>
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={contactPhone} onChange={e=>setContactPhone(e.target.value)} className="mt-1" placeholder="+91 98765 43210"/>
                </div>
              </div>
            </div>

            <Button onClick={handleBook} disabled={booking} className="w-full gap-2 h-11">
              {booking ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="h-4 w-4"/>}
              {booking ? 'Confirming…' : `Confirm Booking — ₹${((selectedFlight?.price||0)*parseInt(searchForm.passengers)).toLocaleString()}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
