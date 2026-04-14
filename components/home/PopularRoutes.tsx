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
    <div className="animate-in stagger-3">
      <p className="text-xs text-muted-foreground mb-2 font-medium">
        ✈ Popular Routes
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {routes.slice(0, 6).map((r) => (
          <button
            key={r._id || r.from + r.to}
            onClick={() => router.push(`/flights?from=${r.from}&to=${r.to}&date=${date}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-medium text-muted-foreground hover:text-primary transition-all"
          >
            {r.fromCity} → {r.toCity}
            {r.price && (
              <span className="font-semibold" style={{ color: "#e44b0f" }}>
                {r.price}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}