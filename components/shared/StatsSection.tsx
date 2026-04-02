const stats = [
  { label: "Components", value: "25+" },
  { label: "API Endpoints", value: "10+" },
  { label: "Custom Hooks", value: "8+" },
  { label: "TypeScript", value: "100%" },
];

export function StatsSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center gap-1">
            <span className="text-4xl font-bold text-primary">{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
