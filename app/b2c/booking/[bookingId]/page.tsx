"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Download, Share2, Plane, Hotel, Shield,
  Calendar, User, Phone, Mail, Printer, Copy, ArrowLeft,
  Clock, MapPin, CreditCard, FileText, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

// ── Mock booking data for demo ─────────────────────────────────────────────────
function generateMockBooking(bookingId: string) {
  const isHotel = bookingId.startsWith("HT");
  const isInsurance = bookingId.startsWith("IN");

  const base = {
    id: bookingId,
    status: "confirmed",
    bookingDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    paymentStatus: "paid",
    paymentMethod: "UPI",
    transactionId: `TXN${Date.now().toString().slice(-8)}`,
    totalAmount: isHotel ? 12000 : isInsurance ? 399 : 8500,
    passengerName: "Raj Kumar",
    passengerEmail: "raj@example.com",
    passengerPhone: "+91-9876543210",
  };

  if (isHotel) {
    return {
      ...base,
      type: "Hotel",
      hotelName: "Taj Mahal Palace",
      city: "Mumbai",
      checkIn: "15 Apr 2025",
      checkOut: "17 Apr 2025",
      nights: 2,
      roomType: "Deluxe Ocean View",
      guests: 2,
      confirmationNo: `H${bookingId.slice(-6)}`,
    };
  }

  if (isInsurance) {
    return {
      ...base,
      type: "Insurance",
      policyNo: `BAJ${bookingId.slice(-8)}`,
      planName: "Standard Travel Plan",
      coverage: "₹5,00,000",
      startDate: "15 Apr 2025",
      endDate: "17 Apr 2025",
      insurer: "Bajaj Allianz",
    };
  }

  return {
    ...base,
    type: "Flight",
    airline: "Air India",
    flightNo: "AI-201",
    from: "DEL",
    fromCity: "New Delhi (Indira Gandhi Intl)",
    to: "BOM",
    toCity: "Mumbai (Chhatrapati Shivaji Maharaj Intl)",
    departure: "06:00",
    arrival: "08:05",
    date: "15 Apr 2025",
    duration: "2h 05m",
    class: "Economy",
    stops: "Non-stop",
    pnr: `PNR${Date.now().toString().slice(-6)}`,
    seat: "12A",
    baggageCabin: "7kg",
    baggageCheckin: "15kg",
    refundable: true,
    passengers: [
      { name: "Raj Kumar", type: "Adult", dob: "01 Jan 1990", passport: "A1234567" },
    ],
  };
}

// ── Print Ticket ─────────────────────────────────────────────────────────────
function downloadTicketPDF(booking: any) {
  window.print();
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = params?.bookingId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/b2c/login?redirect=/b2c/booking/${bookingId}`);
      return;
    }
    // In real app: fetch from API
    setTimeout(() => {
      setBooking(generateMockBooking(bookingId));
      setLoading(false);
    }, 600);
  }, [bookingId, isAuthenticated, router]);

  const handleDownload = () => {
    try {
      window.print();
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  const handleSharePNR = () => {
    if (booking?.pnr) {
      navigator.clipboard.writeText(booking.pnr);
      toast.success("PNR copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details…</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="pt-8 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1">Booking Confirmed!</h1>
          <p className="text-foreground/80 text-sm">
            Your {booking.type.toLowerCase()} has been booked successfully. Confirmation sent to{" "}
            <span className="text-foreground font-medium">{booking.passengerEmail}</span>
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-xs text-muted-foreground">Booking ID:</span>
            <code className="text-sm font-mono font-bold text-green-400 bg-muted px-2 py-1 rounded-lg">
              {booking.id}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button onClick={handleDownload} className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Download {booking.type === "Insurance" ? "Policy" : "Ticket"} (PDF)
          </Button>
          {booking.pnr && (
            <Button variant="outline" onClick={handleSharePNR} className="gap-2 border-border text-foreground/80">
              <Copy className="h-4 w-4" /> Copy PNR
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()} className="gap-2 border-border text-foreground/80">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Link href="/b2c/my-trips">
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" /> My Trips
            </Button>
          </Link>
        </div>

        {/* Ticket Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden print:border-black">

          {/* Top strip */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {booking.type === "Flight" ? <Plane className="h-5 w-5 text-white" />
                : booking.type === "Hotel" ? <Hotel className="h-5 w-5 text-white" />
                : <Shield className="h-5 w-5 text-white" />}
              <span className="font-bold text-white">{booking.type} Booking</span>
            </div>
            <span className="text-xs bg-green-500 text-foreground font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {booking.status}
            </span>
          </div>

          {/* Flight specific */}
          {booking.type === "Flight" && (
            <div className="p-6">
              {/* Route */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-4xl font-black text-white">{booking.from}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-32">{booking.fromCity}</p>
                </div>
                <div className="text-center flex-1 px-4">
                  <p className="text-xs text-muted-foreground mb-1">{booking.duration} · {booking.stops}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-px bg-muted" />
                    <Plane className="h-4 w-4 text-primary" />
                    <div className="flex-1 h-px bg-muted" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{booking.airline} {booking.flightNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-white">{booking.to}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-32 text-right">{booking.toCity}</p>
                </div>
              </div>

              {/* Dashed separator */}
              <div className="relative my-5">
                <div className="border-t border-dashed border-border" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 bg-background rounded-full border border-border" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 bg-background rounded-full border border-border" />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: booking.date },
                  { icon: Clock, label: "Departure", value: booking.departure },
                  { icon: Ticket, label: "PNR", value: booking.pnr, mono: true },
                  { icon: MapPin, label: "Seat", value: booking.seat },
                  { icon: User, label: "Class", value: booking.class },
                  { icon: Shield, label: "Refund", value: booking.refundable ? "Refundable" : "Non-refundable" },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-xl p-3">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-bold text-foreground mt-0.5 ${item.mono ? "font-mono" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Passengers */}
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Passengers
                </p>
                {booking.passengers.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.type} · DOB: {p.dob}</p>
                    </div>
                    {p.passport && <p className="ml-auto text-xs text-muted-foreground font-mono">Passport: {p.passport}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotel specific */}
          {booking.type === "Hotel" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Hotel className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{booking.hotelName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Check-In", value: booking.checkIn },
                  { label: "Check-Out", value: booking.checkOut },
                  { label: "Nights", value: `${booking.nights} Night${booking.nights > 1 ? "s" : ""}` },
                  { label: "Guests", value: `${booking.guests} Guest${booking.guests > 1 ? "s" : ""}` },
                  { label: "Room Type", value: booking.roomType },
                  { label: "Confirmation #", value: booking.confirmationNo, mono: true },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-bold text-foreground mt-0.5 ${(item as any).mono ? "font-mono" : ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance specific */}
          {booking.type === "Insurance" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{booking.planName}</h2>
                  <p className="text-sm text-muted-foreground">Powered by {booking.insurer}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Policy Number", value: booking.policyNo, mono: true },
                  { label: "Coverage", value: booking.coverage },
                  { label: "Start Date", value: booking.startDate },
                  { label: "End Date", value: booking.endDate },
                ].map(item => (
                  <div key={item.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-bold text-foreground mt-0.5 ${(item as any).mono ? "font-mono" : ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mx-6 mb-6 bg-green-900/20 border border-green-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">Payment Confirmed</p>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {booking.paymentMethod}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="font-mono text-xs">{booking.transactionId}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white">₹{booking.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-green-400">Paid</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mx-6 mb-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Contact Details</p>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-sm text-foreground/80"><User className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerName}</span>
              <span className="flex items-center gap-1.5 text-sm text-foreground/80"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerEmail}</span>
              <span className="flex items-center gap-1.5 text-sm text-foreground/80"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerPhone}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 flex justify-between items-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <Link href="/b2c/my-trips">
            <Button variant="outline" size="sm" className="border-border text-foreground/80 hover:text-white">
              View All Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
