import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";
import { ROUTES } from "@/config/app";

export function HeroSection() {
  return (
    <section className="container py-24 flex flex-col items-center text-center gap-8">
      <Badge variant="secondary" className="gap-1.5">
        <Zap className="h-3 w-3" />
        Production-ready boilerplate
      </Badge>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-3xl leading-tight">
        Build faster with{" "}
        <span className="text-primary">NextStack</span>
      </h1>

      <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
        A complete Next.js 14 boilerplate with Tailwind CSS, Shadcn UI, a reusable
        API layer, Zustand state management, and TanStack Query — everything you
        need to ship production apps fast.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg">
          <Link href={ROUTES.B2B_DASHBOARD}>
            View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline">
          <Link href="/docs">Read Docs</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
        {[
          { label: "Next.js 14", desc: "App Router + RSC" },
          { label: "Tailwind CSS", desc: "Utility-first styling" },
          { label: "Shadcn UI", desc: "Accessible components" },
          { label: "TypeScript", desc: "Fully typed" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">{item.label}</span>
            <span>{item.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
