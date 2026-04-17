"use client";
import { useRouter } from "next/navigation";

interface Props {
  routes: any[];
  date: string;
}

export function PopularRoutes({ routes, date }: Props) {
  const router = useRouter();
  if (!routes.length) return null;

  return (
    <div className="animate-in stagger-3 w-full">
      <p className="text-xs text-muted-foreground mb-3 font-bold text-center tracking-wide">
        ✈ Popular Routes
      </p>
      <div className="flex flex-wrap justify-center gap-2 px-2">
        {routes.slice(0, 6).map((r) => (
          <button
            key={r._id || r.from + r.to}
            onClick={() =>
              router.push(`/flights?from=${r.from}&to=${r.to}&date=${date}`)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/70 bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:border-primary/50 hover:bg-white/90 hover:shadow-sm text-xs font-medium text-muted-foreground hover:text-primary transition-all whitespace-nowrap"
          >
            <span className="text-foreground font-semibold">{r.fromCity}</span>
            <span className="text-muted-foreground/40 text-[10px]">→</span>
            <span className="text-foreground font-semibold">{r.toCity}</span>
            {r.price && (
              <span
                className="font-bold"
                style={{ color: "hsl(var(--brand-orange))" }}
              >
                {r.price}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
