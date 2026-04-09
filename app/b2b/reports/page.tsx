"use client";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { TEXT, SPACING } from "@/config/design-system";
import { cn } from "@/lib/utils";
import { TrendingUp, Plane, Hotel, Shield } from "lucide-react";
export default function B2bReportsPage() {
  return (
    <div className={cn(SPACING.section)}>
      <PageHeader title="My Reports" subtitle="Commission and booking performance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Commission This Month" value="₹8,200" icon={TrendingUp} trend={12.1} iconColor="text-green-500" iconBg="bg-green-100 dark:bg-green-900/30" />
        <StatCard title="Flight Commission" value="₹3,400" icon={Plane} iconColor="text-primary" iconBg="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard title="Hotel Commission" value="₹4,200" icon={Hotel} iconColor="text-amber-500" iconBg="bg-amber-100 dark:bg-amber-900/30" />
        <StatCard title="Insurance Commission" value="₹600" icon={Shield} iconColor="text-green-500" iconBg="bg-green-100 dark:bg-green-900/30" />
      </div>
      <div className="bg-card border rounded-xl p-6">
        <h2 className={cn(TEXT.h3,"mb-4")}>Monthly Performance</h2>
        <div className="space-y-3">
          {[
            { month: "January 2025", bookings: 18, commission: 6200 },
            { month: "February 2025", bookings: 24, commission: 7800 },
            { month: "March 2025", bookings: 28, commission: 8200 },
          ].map(row=>(
            <div key={row.month} className="flex items-center justify-between p-4 border rounded-lg">
              <span className={TEXT.label}>{row.month}</span>
              <div className="flex gap-8 text-right">
                <div><p className={TEXT.caption}>Bookings</p><p className={TEXT.h4}>{row.bookings}</p></div>
                <div><p className={TEXT.caption}>Commission</p><p className={cn(TEXT.h4,"text-green-600")}>₹{row.commission.toLocaleString()}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
