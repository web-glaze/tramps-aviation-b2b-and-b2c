"use client";
/**
 * WriteReviewModal — used on My Trips (B2C) and B2B Bookings
 * Both customers and agents can submit reviews from their booking lists
 */
import { useState } from "react";
import { X, Star, Send, RefreshCcw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { reviewApi } from "@/lib/api/services";
import { toast } from "sonner";

interface Props {
  booking: {
    id: string;
    bookingRef: string;
    type: "flight" | "hotel";
    entityId: string;   // airline code or hotel code
    entityName: string; // e.g. "Air India" or "Taj Mahal Palace"
    route?: string;     // e.g. "DEL → BOM"
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function StarRow({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                s <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-border fill-border"
              )}
            />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium ml-1 w-20">
            {RATING_LABELS[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

export function WriteReviewModal({ booking, onClose, onSuccess }: Props) {
  const [overall,      setOverall]      = useState(0);
  const [service,      setService]      = useState(0);
  const [cleanliness,  setCleanliness]  = useState(0);
  const [value,        setValue]        = useState(0);
  const [punctuality,  setPunctuality]  = useState(0);
  const [comment,      setComment]      = useState("");
  const [step,         setStep]         = useState<"form" | "loading" | "done">("form");

  const isFlight = booking.type === "flight";

  const handleSubmit = async () => {
    if (!overall)            { toast.error("Please give an overall rating"); return; }
    if (comment.length < 10) { toast.error("Comment must be at least 10 characters"); return; }

    setStep("loading");
    try {
      await reviewApi.submit({
        type:             booking.type,
        entityId:         booking.entityId,
        entityName:       booking.entityName,
        bookingRef:       booking.bookingRef,
        overallRating:    overall,
        serviceRating:    service    || undefined,
        cleanlinessRating:cleanliness|| undefined,
        valueRating:      value      || undefined,
        punctualityRating:isFlight ? punctuality || undefined : undefined,
        comment,
      });
      setStep("done");
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit review";
      toast.error(msg);
      setStep("form");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={step === "form" ? onClose : undefined}/>
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground">Write a Review</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {booking.entityName} {booking.route ? `· ${booking.route}` : ""}
            </p>
          </div>
          {step === "form" && (
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4"/>
            </button>
          )}
        </div>

        {/* Done state */}
        {step === "done" ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400"/>
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Review Submitted!</h4>
            <p className="text-sm text-muted-foreground mb-5">
              Thank you for your feedback. Your review will be visible after admin approval.
            </p>
            <button onClick={onClose}
              className="btn-primary px-6 py-2.5 text-sm">
              Close
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Overall rating — required */}
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Overall Rating *</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setOverall(s)}
                    className="p-1 transition-transform hover:scale-110">
                    <Star className={cn(
                      "h-8 w-8 transition-colors",
                      s <= overall ? "fill-amber-400 text-amber-400" : "text-border fill-border"
                    )}/>
                  </button>
                ))}
              </div>
              {overall > 0 && (
                <p className="text-center text-sm font-semibold text-amber-600 dark:text-amber-400 mt-2">
                  {RATING_LABELS[overall]}
                </p>
              )}
            </div>

            {/* Sub-ratings */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Detailed Ratings (optional)
              </p>
              <StarRow label="Service Quality"  value={service}     onChange={setService}/>
              <StarRow label="Value for Money"  value={value}       onChange={setValue}/>
              {isFlight ? (
                <StarRow label="Punctuality"    value={punctuality} onChange={setPunctuality}/>
              ) : (
                <StarRow label="Cleanliness"    value={cleanliness} onChange={setCleanliness}/>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Your Review * <span className="text-muted-foreground font-normal">(min 10 characters)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder={isFlight
                  ? "How was your flight experience? Was it comfortable, on-time? Any issues?"
                  : "How was your stay? Was the room clean, staff helpful, location convenient?"
                }
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{comment.length}/1000</p>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={step === "loading"}
              className="w-full h-11 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {step === "loading"
                ? <><RefreshCcw className="h-4 w-4 animate-spin"/>Submitting…</>
                : <><Send className="h-4 w-4"/>Submit Review</>
              }
            </button>

            <p className="text-[10px] text-muted-foreground text-center">
              Reviews are moderated before appearing publicly. No spam, no offensive language.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
