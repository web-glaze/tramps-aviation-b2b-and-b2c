'use client'
import { useState } from 'react'
import { searchApi, agentApi } from '@/lib/api/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plane, Search, Clock, Luggage, ArrowRight, Loader2, RefreshCcw, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const POPULAR_ROUTES = [
  { from: 'DEL', fromFull: 'New Delhi', to: 'BOM', toFull: 'Mumbai' },
  { from: 'BOM', fromFull: 'Mumbai', to: 'GOI', toFull: 'Goa' },
  { from: 'DEL', fromFull: 'New Delhi', to: 'BLR', toFull: 'Bangalore' },
  { from: 'BOM', fromFull: 'Mumbai', to: 'DEL', toFull: 'New Delhi' },
]

export default function AgentFlightsPage() {
  const [searchForm, setSearchForm] = useState({ origin: 'DEL', destination: 'BOM', date: new Date().toISOString().split('T')[0], passengers: '1', cabinClass: 'Economy' })
  const [flights, setFlights] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [bookingDialog, setBookingDialog] = useState(false)
  const [booking, setBooking] = useState(false)
  const [passengers, setPassengers] = useState([{ firstName: '', lastName: '', dob: '', passportNo: '' }])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchForm.origin || !searchForm.destination) { toast.error('Enter origin and destination'); return }
    setSearching(true)
    setFlights([])
    try {
      const res = await searchApi.searchFlights({
        origin: searchForm.origin.toUpperCase(),
        destination: searchForm.destination.toUpperCase(),
        date: searchForm.date,
        passengers: parseInt(searchForm.passengers),
        cabinClass: searchForm.cabinClass,
      })
      const data = res.data as any
      const list = data.flights || data.data?.flights || data.data || []
      setFlights(Array.isArray(list) ? list : [])
      if (!list.length) toast.info('No flights found for this route')
    } catch (err: any) {
      toast.error('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const openBooking = (flight: any) => {
    setSelectedFlight(flight)
    const count = parseInt(searchForm.passengers)
    setPassengers(Array.from({ length: count }, () => ({ firstName: '', lastName: '', dob: '', passportNo: '' })))
    setBookingDialog(true)
  }

  const handleBook = async () => {
    if (!contactEmail || !passengers.every(p => p.firstName && p.lastName)) {
      toast.error('Fill all passenger details and contact email'); return
    }
    setBooking(true)
    try {
      const res = await agentApi.bookFlight({
        flightKey: selectedFlight.flightKey || selectedFlight.id,
        flightData: selectedFlight,
        passengers: passengers.map(p => ({
          title: 'Mr', firstName: p.firstName, lastName: p.lastName,
          dob: p.dob, passportNo: p.passportNo,
        })),
        contactEmail, contactPhone,
        origin: searchForm.origin, destination: searchForm.destination, date: searchForm.date,
      })
      const data = res.data as any
      toast.success(`Booking confirmed! PNR: ${data.pnr || data.data?.pnr || 'N/A'}`)
      setBookingDialog(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Book Flights" subtitle="Search and book flights for your clients" />

      {/* Search Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label>From *</Label>
              <Input value={searchForm.origin} onChange={e => setSearchForm(f => ({ ...f, origin: e.target.value.toUpperCase() }))} placeholder="DEL" maxLength={3} className="uppercase font-mono text-center text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label>To *</Label>
              <Input value={searchForm.destination} onChange={e => setSearchForm(f => ({ ...f, destination: e.target.value.toUpperCase() }))} placeholder="BOM" maxLength={3} className="uppercase font-mono text-center text-lg font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input value={searchForm.date} onChange={e => setSearchForm(f => ({ ...f, date: e.target.value }))} type="date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label>Passengers</Label>
              <Input value={searchForm.passengers} onChange={e => setSearchForm(f => ({ ...f, passengers: e.target.value }))} type="number" min="1" max="9" />
            </div>
          </div>

          {/* Popular routes */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {POPULAR_ROUTES.map(r => (
              <button key={r.from + r.to} type="button"
                onClick={() => setSearchForm(f => ({ ...f, origin: r.from, destination: r.to }))}
                className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
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
          <p className="text-sm text-muted-foreground">{flights.length} flights found for <span className="font-medium text-foreground">{searchForm.origin} → {searchForm.destination}</span></p>
          {flights.map((flight, i) => (
            <FlightCard key={flight.flightKey || i} flight={flight} onBook={() => openBooking(flight)} />
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              {selectedFlight?.airline} · {selectedFlight?.flightNumber} · {searchForm.origin} → {searchForm.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Price Summary */}
            <div className="bg-muted/40 rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm"><span>Base Fare</span><span>₹{(selectedFlight?.fare?.baseFare || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span>Taxes & Fees</span><span>₹{(selectedFlight?.fare?.taxes || 0).toLocaleString()}</span></div>
              <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1"><span>Total</span><span>₹{(selectedFlight?.fare?.total || 0).toLocaleString()}</span></div>
            </div>

            {/* Passenger Details */}
            {passengers.map((p, i) => (
              <div key={i} className="space-y-3">
                <p className="text-sm font-medium">Passenger {i + 1}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">First Name *</Label><Input value={p.firstName} onChange={e => { const np = [...passengers]; np[i].firstName = e.target.value; setPassengers(np) }} placeholder="First name" /></div>
                  <div className="space-y-1"><Label className="text-xs">Last Name *</Label><Input value={p.lastName} onChange={e => { const np = [...passengers]; np[i].lastName = e.target.value; setPassengers(np) }} placeholder="Last name" /></div>
                  <div className="space-y-1"><Label className="text-xs">Date of Birth</Label><Input value={p.dob} onChange={e => { const np = [...passengers]; np[i].dob = e.target.value; setPassengers(np) }} type="date" /></div>
                  <div className="space-y-1"><Label className="text-xs">Passport No</Label><Input value={p.passportNo} onChange={e => { const np = [...passengers]; np[i].passportNo = e.target.value; setPassengers(np) }} placeholder="A1234567" /></div>
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Email *</Label><Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" placeholder="client@email.com" /></div>
                <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setBookingDialog(false)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleBook} disabled={booking}>
                {booking && <Loader2 className="h-4 w-4 animate-spin" />}
                {booking ? 'Booking...' : `Book ₹${(selectedFlight?.fare?.total || 0).toLocaleString()}`}
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
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all">
      <div className="p-4 flex items-center gap-4">
        {/* Airline */}
        <div className="w-24 flex-shrink-0 text-center">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
            <Plane className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs font-medium">{flight.airline}</p>
          <p className="text-xs text-muted-foreground font-mono">{flight.flightNumber}</p>
        </div>

        {/* Route & Time */}
        <div className="flex-1 flex items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-bold font-mono">{flight.departureTime || '06:00'}</p>
            <p className="text-xs text-muted-foreground font-medium">{flight.origin || flight.from}</p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">{flight.duration || '2h 15m'}</p>
            <div className="flex items-center gap-1 w-full">
              <div className="h-px flex-1 bg-border" />
              <Plane className="h-3 w-3 text-muted-foreground" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-mono">{flight.arrivalTime || '08:15'}</p>
            <p className="text-xs text-muted-foreground font-medium">{flight.destination || flight.to}</p>
          </div>
        </div>

        {/* Price & Book */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-primary">₹{(flight.fare?.total || flight.price || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mb-2">{flight.cabinClass || 'Economy'}</p>
          <Button size="sm" className="gap-1" onClick={onBook}>
            Book <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Expandable details */}
      <button
        className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide details' : 'Flight details'}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3 text-sm border-t border-border pt-3">
          <div><p className="text-xs text-muted-foreground">Baggage</p><p className="font-medium">{flight.baggage || '15 kg'}</p></div>
          <div><p className="text-xs text-muted-foreground">Cabin</p><p className="font-medium">{flight.cabinClass || 'Economy'}</p></div>
          <div><p className="text-xs text-muted-foreground">Refundable</p><p className="font-medium">{flight.isRefundable ? 'Yes' : 'Non-refundable'}</p></div>
          <div><p className="text-xs text-muted-foreground">Base Fare</p><p className="font-medium">₹{(flight.fare?.baseFare || 0).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Taxes</p><p className="font-medium">₹{(flight.fare?.taxes || 0).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Seats</p><p className="font-medium">{flight.availableSeats || '—'}</p></div>
        </div>
      )}
    </div>
  )
}
