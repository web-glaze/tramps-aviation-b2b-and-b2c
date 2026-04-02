"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, Hotel, Shield, ArrowLeft, Calendar, Download, XCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { customerApi } from "@/lib/api/services";

const MOCK_TRIPS = [
  { id: "FL-001", type: "Flight", service: "DEL → BOM", pnr: "ABC123", amount: 8500, status: "confirmed", date: "2025-03-15", travelDate: "2025-04-01", airline: "Air India", flightNo: "AI-201" },
  { id: "FL-002", type: "Flight", service: "BOM → GOI", pnr: "XYZ789", amount: 4200, status: "confirmed", date: "2025-03-10", travelDate: "2025-04-15", airline: "IndiGo", flightNo: "6E-211" },
  { id: "FL-003", type: "Flight", service: "DEL → BLR", pnr: "—", amount: 5600, status: "cancelled", date: "2025-02-20", travelDate: "2025-03-10", airline: "SpiceJet", flightNo: "SG-112" },
  { id: "IN-001", type: "Insurance", service: "Travel Insurance - DEL→BOM", pnr: "POL456", amount: 399, status: "confirmed", date: "2025-03-15", travelDate: "2025-04-01" },
];

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-green-900/40 text-green-400 border-green-500/30",
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
  cancelled: "bg-red-900/40 text-red-400 border-red-500/30",
};

const TYPE_ICON: Record<string, any> = {
  Flight: Plane,
  Hotel: Hotel,
  Insurance: Shield,
};

export default function MyTripsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/b2c/login?redirect=/b2c/my-trips");
      return;
    }
    loadTrips();
  }, [isAuthenticated]);

  const loadTrips = async () => {
    try {
      const res = await customerApi.getBookings();
      const data = res.data as any;
      const list = data?.bookings || data?.data || [];
      setTrips(Array.isArray(list) && list.length > 0 ? list : MOCK_TRIPS);
    } catch {
      setTrips(MOCK_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const filtered = trips.filter(t => {
    const travelDate = new Date(t.travelDate);
    if (activeTab === "cancelled") return t.status === "cancelled";
    if (activeTab === "upcoming") return travelDate >= today && t.status !== "cancelled";
    if (activeTab === "past") return travelDate < today && t.status !== "cancelled";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Trips</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 w-fit">
          {(["upcoming", "past", "cancelled"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                activeTab === tab ? "bg-slate-700 text-white" : "text-muted-foreground hover:text-slate-300"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(n => (
              <div key={n} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-muted-foreground">No {activeTab} trips found</p>
            <Link href="/b2c/flights" className="inline-block mt-4 text-sm text-blue-400 hover:underline">
              Search Flights →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(trip => {
              const Icon = TYPE_ICON[trip.type] || Plane;
              return (
                <div key={trip.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{trip.service}</div>
                        {trip.airline && (
                          <div className="text-xs text-muted-foreground mt-0.5">{trip.airline} · {trip.flightNo}</div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Travel: {trip.travelDate}
                          </span>
                          {trip.pnr && trip.pnr !== "—" && (
                            <span className="text-xs text-muted-foreground">PNR: <span className="text-white font-mono">{trip.pnr}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₹{trip.amount.toLocaleString()}</div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-md border mt-1 ${STATUS_STYLE[trip.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>

                  {trip.status === "confirmed" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                      <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <Download className="h-3.5 w-3.5" /> Download Ticket
                      </button>
                      {activeTab === "upcoming" && (
                        <button className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors ml-4">
                          <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
