'use client'
import { useState } from 'react'
import { searchApi, agentApi, unwrap } from '@/lib/api/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plane, Search, Luggage, ArrowRight, Loader2, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const POPULAR_ROUTES = [
  { from: 'DEL', to: 'BOM' },
  { from: 'ATQ', to: 'SHJ' },
  { from: 'DEL', to: 'DXB' },
  { from: 'BOM', to: 'GOI' },
]

export default function AgentFlightsPage() {
  const [searchForm, setSearchForm] = useState({
    origin: 'DEL', destination: 'BOM',
    date: new Date().toISOString().split('T')[0],
    passengers: '1', cabinClass: 'Economy',
  })
  const [flights, setFlights]           = useState<any[]>([])
  const [searching, setSearching]       = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [bookingDialog, setBookingDialog]   = useState(false)
  const [booking, setBooking]           = useState(false)
  const [passengers, setPassengers]     = useState([{ firstName: '', lastName: '', dob: '', passportNo: '', gender: 'M' }])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchForm.origin || !searchForm.destination) { toast.error('Enter origin and destination'); return }
    setSearching(true)
    setFlights([])
    try {
      const res  = await searchApi.searchFlights({
        origin: searchForm.origin.toUpperCase(),
        destination: searchForm.destination.toUpperCase(),
        date: searchForm.date,
        passengers: parseInt(searchForm.passengers),
        cabinClass: searchForm.cabinClass,
      })
      const data = unwrap(res) as any
      const list = data?.flights || data?.data?.flights || []
      setFlights(Array.isArray(list) ? list : [])
      if (!list.length) toast.info('No flights found for this route')
      else {
        const custom = list.filter((f: any) => f.source === 'CUSTOM' || f.resultToken?.startsWith('CUSTOM-')).length
        if (custom > 0) toast.success(`${custom} special B2B fare${custom > 1 ? 's' : ''} available!`)
      }
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const openBooking = (flight: any) => {
    setSelectedFlight(flight)
    const count = parseInt(searchForm.passengers)
    setPassengers(Array.from({ length: count }, () => ({ firstName: '', lastName: '', dob: '', passportNo: '', gender: 'M' })))
    setBookingDialog(true)
  }

  const handleBook = async () => {
    if (!contactEmail || !passengers.every(p => p.firstName && p.lastName)) {
      toast.error('Fill all passenger details and contact email'); return
    }
    setBooking(true)
    try {
      // resultToken is the key that tells backend which fare to use (CUSTOM-xxx, MOCK-xxx, or TBO token)
      const resultToken = selectedFlight?.resultToken || selectedFlight?.flightKey || selectedFlight?.id || ''
      const res = await agentApi.bookFlight({
        resultToken,
        flightData: selectedFlight,
        passengers: passengers.map(p => ({
          title: 'Mr', firstName: p.firstName, lastName: p.lastName,
          dob: p.dob || '1990-01-01', passportNo: p.passportNo, gender: p.gender || 'M',
        })),
        contactEmail, contactPhone,
        tripType: 'OneWay',
      })
      const data = unwrap(res) as any
      const pnr  = data?.pnr || data?.booking?.pnr || data?.bookingRef || 'N/A'
      toast.success(`Booking confirmed! PNR: ${pnr}`)
      setBookingDialog(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const isCustom = (f: any) => f?.source === 'CUSTOM' || f?.resultToken?.startsWith('CUSTOM-')

  return (
    <div className="space-y-6">
      <PageHeader title="Book Flights" subtitle="Search and book flights for your clients" />

      {/* Search Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>From *</Label>
              <Input value={searchForm.origin}
                onChange={e => setSearchForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))}
                placeholder="DEL" maxLength={3} className="uppercase font-mono text-center text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label>To *</Label>
              <Input value={searchForm.destination}
                onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))}
                placeholder="BOM" maxLength={3} className="uppercase font-mono text-center text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input value={searchForm.date}
                onChange={e => setSearchForm(f => ({ ...f, date: e.target.value }))}
                type="date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Passengers</Label>
              <Input value={searchForm.passengers}
                onChange={e => setSearchForm(f => ({ ...f, passengers: e.target.value }))}
                type="number" min="1" max="9" />
            </div>
          </div>

          {/* Popular routes */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR_ROUTES.map(r => (
              <button key={r.from + r.to} type="button"
                onClick={() => setSearchForm(f => ({ ...f, origin: r.from, destination: r.to }))}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                {r.from} → {r.to}
              </button>
            ))}
          </div>

          <Button type="submit" className="gap-2 h-11 px-8" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {searching ? 'Searching...' : 'Search Flights'}
          </Button>
        </form>
      </div>

      {/* Results */}
      {flights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {flights.length} flights found · <span className="font-medium text-foreground">{searchForm.origin} → {searchForm.destination}</span>
            </p>
            {flights.some(isCustom) && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                Special B2B fares available
              </div>
            )}
          </div>
          {flights.map((flight, i) => (
            <FlightCard key={flight.resultToken || flight.flightKey || i} flight={flight} onBook={() => openBooking(flight)} />
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Confirm Booking
              {selectedFlight && isCustom(selectedFlight) && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                  <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                  B2B Special Fare
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedFlight?.airline} · {selectedFlight?.flightNumber} · {searchForm.origin} → {searchForm.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Price Summary */}
            <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fare</span>
                <span>₹{(selectedFlight?.price?.base || selectedFlight?.fare?.baseFare || selectedFlight?.price?.total || 0).toLocaleString()}</span>
              </div>
              {(selectedFlight?.price?.taxes || selectedFlight?.fare?.taxes || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>₹{(selectedFlight?.price?.taxes || selectedFlight?.fare?.taxes || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t border-border pt-1.5 mt-1">
                <span>Total per passenger</span>
                <span className="text-primary">₹{(selectedFlight?.price?.total || selectedFlight?.fare?.total || 0).toLocaleString()}</span>
              </div>
              {parseInt(searchForm.passengers) > 1 && (
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-1">
                  <span>Total ({searchForm.passengers} pax)</span>
                  <span className="text-primary">₹{((selectedFlight?.price?.total || 0) * parseInt(searchForm.passengers)).toLocaleString()}</span>
                </div>
              )}
              {selectedFlight && isCustom(selectedFlight) && (
                <p className="text-xs text-amber-600 pt-1">
                  {selectedFlight.isRefundable === false ? 'Non-Refundable / Non-Changeable' : 'Refundable — check fare rules'}
                </p>
              )}
            </div>

            {/* Passenger Details */}
            {passengers.map((p, i) => (
              <div key={i} className="space-y-3">
                <p className="text-sm font-medium">Passenger {i + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name *</Label>
                    <Input value={p.firstName}
                      onChange={e => { const np = [...passengers]; np[i].firstName = e.target.value; setPassengers(np) }}
                      placeholder="First name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name *</Label>
                    <Input value={p.lastName}
                      onChange={e => { const np = [...passengers]; np[i].lastName = e.target.value; setPassengers(np) }}
                      placeholder="Last name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date of Birth</Label>
                    <Input value={p.dob}
                      onChange={e => { const np = [...passengers]; np[i].dob = e.target.value; setPassengers(np) }}
                      type="date" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Passport No</Label>
                    <Input value={p.passportNo}
                      onChange={e => { const np = [...passengers]; np[i].passportNo = e.target.value; setPassengers(np) }}
                      placeholder="A1234567" />
                  </div>
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email *</Label>
                  <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    type="email" placeholder="client@email.com" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBookingDialog(false)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleBook} disabled={booking}>
                {booking && <Loader2 className="h-4 w-4 animate-spin" />}
                {booking ? 'Booking...' : `Confirm & Pay ₹${((selectedFlight?.price?.total || 0) * parseInt(searchForm.passengers)).toLocaleString()}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FlightCard({ flight, onBook }: { flight: any; onBook: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const isCustomFare = flight?.source === 'CUSTOM' || flight?.resultToken?.startsWith('CUSTOM-')
  const totalFare    = flight?.price?.total || flight?.fare?.total || 0
  const baseFare     = flight?.price?.base  || flight?.fare?.baseFare || totalFare
  const taxes        = flight?.price?.taxes || flight?.fare?.taxes    || 0

  return (
    <div className={cn(
      "bg-card border rounded-xl overflow-hidden transition-all",
      isCustomFare
        ? "border-amber-300 dark:border-amber-700 shadow-sm shadow-amber-100 dark:shadow-amber-950"
        : "border-border hover:border-primary/30"
    )}>
      {/* Special fare top banner */}
      {isCustomFare && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 flex items-center gap-2">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Special B2B Group Fare — {flight.airline || 'Tramps Aviation'}
          </span>
          <span className="ml-auto text-xs text-amber-600 dark:text-amber-500">
            {flight.isRefundable === false ? 'Non-Refundable' : 'Check fare rules'}
          </span>
        </div>
      )}

      <div className="p-4 flex items-center gap-4">
        {/* Airline */}
        <div className="w-24 flex-shrink-0 text-center">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-1",
            isCustomFare ? "bg-amber-100 dark:bg-amber-900" : "bg-primary/10"
          )}>
            <Plane className={cn("h-5 w-5", isCustomFare ? "text-amber-600" : "text-primary")} />
          </div>
          <p className="text-xs font-semibold leading-tight">{flight.airline || flight.airlineName}</p>
          <p className="text-xs text-muted-foreground font-mono">{flight.flightNumber}</p>
        </div>

        {/* Route & Time */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-bold font-mono">{flight.departureTime || '—'}</p>
            <p className="text-xs text-muted-foreground font-semibold">{flight.origin}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">{flight.duration || '—'}</p>
            <div className="flex items-center gap-1 w-full">
              <div className="h-px flex-1 bg-border" />
              <Plane className="h-3 w-3 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-mono">{flight.arrivalTime || '—'}</p>
            <p className="text-xs text-muted-foreground font-semibold">{flight.destination}</p>
          </div>
        </div>

        {/* Price & Book */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Per person</p>
          <p className={cn("text-2xl font-bold", isCustomFare ? "text-amber-600 dark:text-amber-400" : "text-primary")}>
            ₹{totalFare.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mb-2">{flight.cabinClass || 'Economy'}</p>
          <Button size="sm"
            className={cn("gap-1", isCustomFare && "bg-amber-600 hover:bg-amber-700 text-white")}
            onClick={onBook}>
            Book <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Expand details */}
      <button
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide details' : 'Flight details'}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3 text-sm border-t border-border pt-3">
          <div><p className="text-xs text-muted-foreground">Baggage</p><p className="font-medium">{flight.baggage || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Cabin</p><p className="font-medium">{flight.cabinClass || 'Economy'}</p></div>
          <div><p className="text-xs text-muted-foreground">Refundable</p><p className="font-medium">{flight.isRefundable === false ? 'No' : 'Yes'}</p></div>
          <div><p className="text-xs text-muted-foreground">Base Fare</p><p className="font-medium">₹{baseFare.toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Taxes</p><p className="font-medium">₹{taxes.toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Type</p>
            <p className="font-medium">{isCustomFare ? 'B2B Group' : flight.fareType || 'Regular'}</p>
          </div>
          {flight.notes && (
            <div className="col-span-3">
              <p className="text-xs text-muted-foreground">Note</p>
              <p className="text-xs text-amber-600">{flight.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}