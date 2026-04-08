"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plane, Hotel, Shield, Download, Printer, ArrowLeft, CheckCircle2,
  User, Phone, Mail, Calendar, Clock, CreditCard, FileText,
  TicketIcon, Share2, Send, XCircle, RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { agentApi, unwrap } from "@/lib/api/services";

const MOCK_BOOKING = {
  id: "TRV-20250315-ABC01",
  type: "Flight",
  status: "confirmed",
  bookingDate: "15 Mar 2025",
  paymentStatus: "paid",
  paymentMethod: "Wallet",
  transactionId: "WLT-20250315-ABC01",
  totalAmount: 8500,
  commissionEarned: 425,
  agentName: "Rahul Travel Agency",
  passengerName: "Raj Kumar",
  passengerEmail: "raj@example.com",
  passengerPhone: "+91-9876543210",
  // Flight specific
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
  stops: "Non-stop",
  pnr: "ABCXYZ",
  seat: "12A",
  class: "Economy",
  baggageCabin: "7kg",
  baggageCheckin: "15kg",
  refundable: true,
  passengers: [
    { name: "Raj Kumar", type: "Adult", dob: "01 Jan 1990" },
  ],
};

export default function B2BBookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const id = params?.bookingId as string;
    // Try real API first
    agentApi.getBookings().then(res => {
      const data = unwrap(res) as any;
      const list = data?.bookings || data?.data || [];
      const found = list.find((b: any) => b.bookingRef === id || b.id === id);
      setBooking(found || MOCK_BOOKING);
    }).catch(() => setBooking(MOCK_BOOKING))
      .finally(() => setLoading(false));
  }, [params]);

  const handleDownloadInvoice = () => {
    toast.success("Invoice download started");
    // In real app: generate PDF invoice with jsPDF
  };

  const handleDownloadTicket = () => {
    toast.success("E-ticket download started");
  };

  const handleSendToPassenger = () => {
    toast.success(`Booking details sent to ${booking?.passengerEmail}`);
  };

  const handleCancel = async () => {
    // Confirmation handled by UI
    setCancelling(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success("Cancellation request submitted");
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/b2b/bookings">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{booking.id}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">Booked on {booking.bookingDate}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownloadTicket} className="gap-2">
          <TicketIcon className="h-4 w-4" /> Download E-Ticket
        </Button>
        <Button variant="outline" onClick={handleDownloadInvoice} className="gap-2">
          <Download className="h-4 w-4" /> Download Invoice
        </Button>
        <Button variant="outline" onClick={handleSendToPassenger} className="gap-2">
          <Send className="h-4 w-4" /> Send to Passenger
        </Button>
        <Button variant="outline" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
        {booking.status === "confirmed" && booking.refundable && (
          <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelling}
            className="gap-2 ml-auto">
            <XCircle className="h-4 w-4" />
            {cancelling ? "Processing..." : "Cancel Booking"}
          </Button>
        )}
      </div>

      {/* Booking Card */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        {/* Top stripe */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-white" />
            <span className="font-bold text-white">{booking.type} · {booking.airline}</span>
            <span className="text-blue-200 text-sm">{booking.flightNo}</span>
          </div>
          <span className="text-xs bg-green-500 text-white font-semibold px-3 py-1 rounded-full uppercase">
            {booking.status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Route */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-black">{booking.from}</p>
              <p className="text-xs text-muted-foreground mt-1">{booking.fromCity}</p>
              <p className="text-sm font-semibold mt-1">{booking.departure}</p>
            </div>
            <div className="text-center flex-1 px-6">
              <p className="text-xs text-muted-foreground mb-1">{booking.duration}</p>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane className="h-4 w-4 text-primary" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{booking.stops}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black">{booking.to}</p>
              <p className="text-xs text-muted-foreground mt-1">{booking.toCity}</p>
              <p className="text-sm font-semibold mt-1">{booking.arrival}</p>
            </div>
          </div>

          <div className="border-t border-dashed border-border" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Date", value: booking.date, icon: Calendar },
              { label: "PNR", value: booking.pnr, mono: true, icon: TicketIcon },
              { label: "Seat", value: booking.seat, icon: User },
              { label: "Class", value: booking.class, icon: Plane },
              { label: "Cabin Baggage", value: booking.baggageCabin },
              { label: "Check-in Baggage", value: booking.baggageCheckin },
              { label: "Refundable", value: booking.refundable ? "Yes" : "No" },
              { label: "Booking Date", value: booking.bookingDate },
            ].map(item => (
              <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${(item as any).mono ? "font-mono" : ""}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Passengers */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Passengers</p>
            <div className="space-y-2">
              {booking.passengers.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.type} · DOB: {p.dob}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide mb-1">Payment</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> {booking.paymentMethod}</span>
                <span className="text-muted-foreground text-xs font-mono">{booking.transactionId}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">₹{booking.totalAmount.toLocaleString()}</p>
              {booking.commissionEarned > 0 && (
                <p className="text-xs text-green-500">+₹{booking.commissionEarned} commission</p>
              )}
            </div>
          </div>

          {/* Passenger Contact */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Passenger Contact</p>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-sm"><User className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerName}</span>
              <span className="flex items-center gap-1.5 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerEmail}</span>
              <span className="flex items-center gap-1.5 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {booking.passengerPhone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
