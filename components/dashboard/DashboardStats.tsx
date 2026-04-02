"use client";

import { useStats } from "@/lib/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function DashboardStats() {
  const { data, isLoading } = useStats();
  const stats = data?.data;

  const cards = [
    {
      title: "Total Users",
      value: stats ? formatNumber(stats.totalUsers) : "—",
      icon: Users,
      description: "+12% from last month",
      trend: "up",
    },
    {
      title: "Active Users",
      value: stats ? formatNumber(stats.activeUsers) : "—",
      icon: Activity,
      description: "+8% from last month",
      trend: "up",
    },
    {
      title: "Revenue",
      value: stats ? formatCurrency(stats.revenue) : "—",
      icon: DollarSign,
      description: "+20% from last month",
      trend: "up",
    },
    {
      title: "Growth Rate",
      value: stats ? `${stats.growth}%` : "—",
      icon: TrendingUp,
      description: "Month over month",
      trend: "up",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="default" className="text-xs px-1.5 py-0">
                  ↑
                </Badge>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
