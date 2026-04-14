"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Hotel,
  Shield,
  ArrowLeft,
  Calendar,
  Download,
  XCircle,
  Clock,
  Star,
} from "lucide-react";
import { WriteReviewModal } from "@/components/reviews/WriteReviewModal";
import { useAuthStore } from "@/lib/store";
import { customerApi, unwrap } from "@/lib/api/services";

const MOCK_TRIPS = [
  {
    id: "FL-001",
    type: "Flight",
    service: "DEL → BOM",
    pnr: "ABC123",
    amount: 8500,
    status: "confirmed",
    date: "2025-03-15",
    travelDate: "2025-04-01",
    airline: "Air India",
    flightNo: "AI-201",
  },
  {
    id: "FL-002",
    type: "Flight",
    service: "BOM → GOI",
    pnr: "XYZ789",
    amount: 4200,
    status: "confirmed",
    date: "2025-03-10",
    travelDate: "2025-04-15",
    airline: "IndiGo",
    flightNo: "6E-211",
  },
  {
    id: "FL-003",
    type: "Flight",
    service: "DEL → BLR",
    pnr: "—",
    amount: 5600,
    status: "cancelled",
    date: "2025-02-20",
    travelDate: "2025-03-10",
    airline: "SpiceJet",
    flightNo: "SG-112",
  },
  {
    id: "IN-001",
    type: "Insurance",
    service: "Travel Insurance - DEL→BOM",
    pnr: "POL456",
    amount: 399,
    status: "confirmed",
    date: "2025-03-15",
    travelDate: "2025-04-01",
  },
];

const STATUS_STYLE: Record<string, string> = {
  confirmed: "status-confirmed",
  pending: "status-pending",
  cancelled: "status-cancelled",
};

const TYPE_ICON: Record<string, any> = {
  Flight: Plane,
  Hotel: Hotel,
  Insurance: Shield,
};

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">(
    "upcoming",
  );
  const [reviewBooking, setReviewBooking] = useState<any>(null);
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  // ...
  useEffect(() => {
    // Wait for Zustand to load from localStorage before checking auth
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/b2c/login?redirect=/b2c/my-trips");
      return;
    }
    loadTrips();
  }, [_hasHydrated, isAuthenticated]);

  const loadTrips = async () => {
    try {
      const res = await customerApi.getBookings();
      const data = unwrap(res) as any;
      const list = data?.bookings || data?.data || [];
      setTrips(Array.isArray(list) && list.length > 0 ? list : MOCK_TRIPS);
    } catch {
      setTrips(MOCK_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const filtered = trips.filter((t) => {
    const travelDate = new Date(t.travelDate);
    if (activeTab === "cancelled") return t.status === "cancelled";
    if (activeTab === "upcoming")
      return travelDate >= today && t.status !== "cancelled";
    if (activeTab === "past")
      return travelDate < today && t.status !== "cancelled";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Trips</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6 w-fit">
        {(["upcoming", "past", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-card border border-border rounded-xl p-5 animate-pulse h-24"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {activeTab} trips found</p>
          <Link
            href="/flights"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            Search Flights →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => {
            const Icon = TYPE_ICON[trip.type] || Plane;
            return (
              <div
                key={trip.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {trip.service}
                      </div>
                      {trip.airline && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {trip.airline} · {trip.flightNo}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Travel:{" "}
                          {trip.travelDate}
                        </span>
                        {trip.pnr && trip.pnr !== "—" && (
                          <span className="text-xs text-muted-foreground">
                            PNR:{" "}
                            <span className="text-foreground font-mono">
                              {trip.pnr}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ₹{trip.amount.toLocaleString()}
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-md border mt-1 ${STATUS_STYLE[trip.status] || "bg-muted text-muted-foreground border-border"}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>

                {trip.status === "confirmed" && (
                  <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
                    <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                      <Download className="h-3.5 w-3.5" /> Download Ticket
                    </button>
                    {activeTab === "upcoming" && (
                      <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition-colors">
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                    {activeTab === "past" && (
                      <button
                        onClick={() =>
                          setReviewBooking({
                            id: trip.id,
                            bookingRef: trip.pnr || trip.id,
                            type: (trip.type === "Hotel"
                              ? "hotel"
                              : "flight") as "flight" | "hotel",
                            entityId: trip.airline || trip.id,
                            entityName:
                              trip.airline || trip.service || "Booking",
                            route: trip.service,
                          })
                        }
                        className="flex items-center gap-1.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 px-2.5 py-1 rounded-lg transition-colors font-medium ml-auto"
                      >
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{" "}
                        Write Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {reviewBooking && (
        <WriteReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
}
