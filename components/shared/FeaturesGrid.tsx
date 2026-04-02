import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Layout, Layers, Shield, Zap, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Layout,
    title: "Reusable Layout System",
    description: "MainLayout, DashboardLayout with collapsible sidebar, header, and footer — all composable.",
    badge: "Layout",
  },
  {
    icon: Database,
    title: "Reusable API Layer",
    description: "Generic CRUD factory using Axios with request/response interceptors, error normalization, and auth token handling.",
    badge: "API",
  },
  {
    icon: RefreshCw,
    title: "TanStack Query Hooks",
    description: "Reusable query and mutation hooks with automatic cache invalidation, loading and error states.",
    badge: "Data",
  },
  {
    icon: Layers,
    title: "Shadcn UI Components",
    description: "Full set of accessible UI components: Button, Input, Card, Dialog, Select, Tabs, Avatar and more.",
    badge: "UI",
  },
  {
    icon: Shield,
    title: "Zod Validation",
    description: "Schema-based form validation with React Hook Form and Zod — zero runtime surprises.",
    badge: "Forms",
  },
  {
    icon: Zap,
    title: "Zustand State",
    description: "Lightweight global state for auth and UI, with persistence via localStorage.",
    badge: "State",
  },
];

export function FeaturesGrid() {
  return (
    <section className="container py-16 space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold">Everything included</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          A complete, production-ready setup so you can focus on building features, not boilerplate.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">{f.badge}</Badge>
                </div>
                <CardTitle className="mt-3">{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
