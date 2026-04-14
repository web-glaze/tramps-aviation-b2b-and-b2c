"use client";
/**
 * ReviewsSection — homepage testimonials section
 * Fetches approved reviews from API, fallback to static
 * Desktop: 3-column grid | Mobile: auto-carousel
 */
import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Plane, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Static fallback — always shown until API responds ────────────────────────
const STATIC_REVIEWS = [
  {
    reviewerName: "Priya Sharma",
    reviewerModel: "Customer",
    overallRating: 5,
    type: "flight",
    entityName: "Air India",
    comment:
      "Best platform for booking flights! Prices are unbeatable and booking process is super smooth. Highly recommended.",
  },
  {
    reviewerName: "Rajesh Kumar",
    reviewerModel: "Agent",
    overallRating: 5,
    type: "flight",
    entityName: "Tramps Aviation",
    comment:
      "The B2B portal has completely transformed my business. Commission structure is excellent and wallet system works perfectly.",
  },
  {
    reviewerName: "Anita Verma",
    reviewerModel: "Customer",
    overallRating: 4,
    type: "hotel",
    entityName: "Taj Mahal Palace",
    comment:
      "Great customer support and instant ticket delivery. Had an issue once and they resolved it within 30 minutes!",
  },
  {
    reviewerName: "Suresh Patel",
    reviewerModel: "Agent",
    overallRating: 5,
    type: "flight",
    entityName: "IndiGo",
    comment:
      "As a travel agent, the wallet system and real-time pricing has made managing bookings effortless. Five stars!",
  },
  {
    reviewerName: "Meera Nair",
    reviewerModel: "Customer",
    overallRating: 5,
    type: "hotel",
    entityName: "Radisson Blu",
    comment:
      "Booked a hotel through Tramps Aviation and the process was so easy. Great prices and excellent service.",
  },
  {
    reviewerName: "Vikram Singh",
    reviewerModel: "Customer",
    overallRating: 4,
    type: "flight",
    entityName: "SpiceJet",
    comment:
      "Smooth booking experience, got e-ticket within seconds. The app is very user-friendly. Will definitely use again.",
  },
];

const AVATAR_COLORS = [
  "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300",
  "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300",
  "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-300",
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5",
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: any; index: number }) {
  // ── Guard against undefined review ──────────────────────────────────────
  if (!review) return null;

  const isAgent = review.reviewerModel === "Agent";
  const isHotel = review.type === "hotel";
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = review.reviewerName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top row: stars + type */}
      <div className="flex items-center justify-between">
        <StarRow rating={review.overallRating ?? 5} />
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
            isHotel
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-primary/10 text-primary",
          )}
        >
          {isHotel ? (
            <Hotel className="h-2.5 w-2.5" />
          ) : (
            <Plane className="h-2.5 w-2.5" />
          )}
          {isHotel ? "Hotel" : "Flight"}
        </span>
      </div>

      {/* Comment */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">
        "{review.comment}"
      </p>

      {/* Entity name */}
      {review.entityName && (
        <p className="text-[10px] text-primary font-medium">
          {isHotel ? "🏨" : "✈"} {review.entityName}
        </p>
      )}

      {/* Reviewer footer */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-border">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
            avatarBg,
          )}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {review.reviewerName ?? "Traveller"}
          </p>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
              isAgent
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-primary/10 text-primary",
            )}
          >
            {isAgent ? "Travel Agent" : "Customer"}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  /** Pre-loaded from homepage API call — optional */
  preloaded?: any[];
}

export function ReviewsSection({ preloaded }: Props) {
  // Always start with STATIC_REVIEWS so SSR never gets undefined
  const [reviews, setReviews] = useState<any[]>(STATIC_REVIEWS);
  const [activeMob, setActiveMob] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load live data after mount (client-only, non-blocking)
  useEffect(() => {
    const live = preloaded?.filter(Boolean);
    if (live && live.length >= 3) {
      setReviews(live);
      return;
    }
    // Lazy import to avoid SSR issues
    import("@/lib/api/services").then(({ reviewApi, unwrap }) => {
      reviewApi
        .getHomepageReviews(12)
        .then((res) => {
          const d = unwrap(res);
          const arr = Array.isArray(d) ? d : (d?.data ?? []);
          const filtered = arr.filter(Boolean);
          if (filtered.length >= 3) setReviews(filtered);
        })
        .catch(() => {}); // keep STATIC_REVIEWS on error
    });
  }, [preloaded]);

  // Mobile auto-cycle
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActiveMob((v) => (v + 1) % Math.max(shown.length, 1)),
      4500,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reviews.length]);

  // Show max 6, filter out any nulls/undefined just in case
  const shown = reviews.filter(Boolean).slice(0, 6);

  // Nothing to show (should never happen — always falls back to STATIC_REVIEWS)
  if (shown.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
            Trusted by Travelers &amp; Agents
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Real reviews from real people — customers and travel agents who use
            Tramps Aviation every day
          </p>
        </div>

        {/* Desktop grid — 3 columns */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((r, i) =>
            r ? <ReviewCard key={i} review={r} index={i} /> : null,
          )}
        </div>

        {/* Mobile carousel */}
        <div className="sm:hidden">
          {shown[activeMob] && (
            <ReviewCard review={shown[activeMob]} index={activeMob} />
          )}

          {/* Dots + arrows */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() =>
                setActiveMob((v) => (v - 1 + shown.length) % shown.length)
              }
              className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-1.5">
              {shown.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMob(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === activeMob ? "w-5 bg-primary" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => setActiveMob((v) => (v + 1) % shown.length)}
              className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
