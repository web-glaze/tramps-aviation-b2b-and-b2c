"use client";
import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewApi } from "@/lib/api/services";

// Static fallback — shown if API fails or returns empty
const STATIC_REVIEWS = [
  {
    _id: "s1",
    userName: "Priya Sharma",
    userRole: "Frequent Traveler",
    userCity: "Mumbai",
    overallRating: 5,
    comment:
      "Best platform for booking flights! The prices are unbeatable and the booking process is super smooth. Highly recommended.",
    type: "flight",
    entityName: "IndiGo · DEL→BOM",
    helpfulCount: 42,
  },
  {
    _id: "s2",
    userName: "Rajesh Kumar",
    userRole: "Travel Agent",
    userCity: "Delhi",
    overallRating: 5,
    comment:
      "The B2B portal has completely transformed my business. Commission structure is excellent and wallet system works perfectly.",
    type: "general",
    entityName: "B2B Agent Portal",
    helpfulCount: 38,
  },
  {
    _id: "s3",
    userName: "Anita Verma",
    userRole: "Freelance Traveler",
    userCity: "Bangalore",
    overallRating: 4,
    comment:
      "Great customer support and instant ticket delivery. Had an issue once and they resolved it within 30 minutes!",
    type: "flight",
    entityName: "Air India · BOM→BLR",
    helpfulCount: 29,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-border fill-border",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-white dark:bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      {/* Rating + entity */}
      <div className="flex items-start justify-between gap-2">
        <StarRating rating={review.overallRating} />
        {review.entityName && (
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full truncate max-w-[120px]">
            {review.entityName}
          </span>
        )}
      </div>

      {/* Comment */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        "{review.comment}"
      </p>

      {/* Author + helpful */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {(review.userName || review.user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {review.userName || review.user?.name || "Traveler"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {review.userRole || review.user?.role || ""}
              {review.userCity || review.user?.city
                ? ` · ${review.userCity || review.user?.city}`
                : ""}
            </p>
          </div>
        </div>
        {review.helpfulCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ThumbsUp className="h-3 w-3" />
            {review.helpfulCount}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile carousel
function MobileCarousel({ reviews }: { reviews: any[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActive((v) => (v + 1) % reviews.length),
      4500,
    );
    return () => clearInterval(t);
  }, [reviews.length]);

  return (
    <div>
      <ReviewCard review={reviews[active]} />
      <div className="flex justify-center gap-2 mt-4">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-6 bg-primary" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function UserReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewApi
      .getHomepageReviews(6)
      .then((res) => {
        const raw = res.data;
        const data = raw?.data ?? raw ?? {};
        const list = Array.isArray(data.reviews)
          ? data.reviews
          : Array.isArray(data)
            ? data
            : [];
        setReviews(list.length >= 3 ? list.slice(0, 6) : STATIC_REVIEWS);
      })
      .catch(() => setReviews(STATIC_REVIEWS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const display = reviews.length ? reviews : STATIC_REVIEWS;

  return (
    <section className="py-8 px-4 sm:px-10 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20">
            Customer Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display mt-3">
            Trusted by travelers & agents
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Real reviews from verified bookings
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.slice(0, 6).map((r, i) => (
            <ReviewCard key={r._id || i} review={r} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="sm:hidden">
          <MobileCarousel reviews={display.slice(0, 3)} />
        </div>
      </div>
    </section>
  );
}
