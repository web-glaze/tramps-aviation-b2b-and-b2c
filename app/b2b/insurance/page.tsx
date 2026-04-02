"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TEXT, SPACING } from "@/config/design-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, CheckCircle, ArrowRight, FileText, Phone } from "lucide-react";

const MOCK_PLANS = [
  { id: "P1", name: "Basic Travel", provider: "Bajaj Allianz", price: 750, coverage: "₹2L", medical: "₹5L", baggage: "₹10K", cancellation: false, duration: "Per Trip" },
  { id: "P2", name: "Standard Travel", provider: "Bajaj Allianz", price: 1200, coverage: "₹5L", medical: "₹10L", baggage: "₹25K", cancellation: true, duration: "Per Trip" },
  { id: "P3", name: "Premium Travel", provider: "Bajaj Allianz", price: 2200, coverage: "₹10L", medical: "₹25L", baggage: "₹50K", cancellation: true, duration: "Per Trip" },
];

export default function B2bInsurancePage() {
  const [form, setForm] = useState({
    travelerName: "", age: "", mobile: "", email: "",
    destination: "", departureDate: "", returnDate: "",
    travelers: "1",
  });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPlan) { toast.error("Please select a plan"); return; }
    setPurchasing(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success("Insurance policy purchased! Policy doc sent to email.");
      setStep(1);
    } finally {
      setPurchasing(false);
    }
  };

  const plan = MOCK_PLANS.find(p => p.id === selectedPlan);

  return (
    <div className={cn(SPACING.section)}>
      <PageHeader title="Travel Insurance" subtitle="Purchase travel insurance via Bajaj Allianz" />

      {/* Step 1: Traveler Details */}
      <div className="bg-card border rounded-xl p-6 space-y-5">
        <h2 className={TEXT.h3}>Traveler Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label className={TEXT.label}>Full Name</Label>
            <Input placeholder="As per passport" value={form.travelerName}
              onChange={e => setForm(f => ({ ...f, travelerName: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Age</Label>
            <Input type="number" placeholder="25" value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Mobile</Label>
            <Input placeholder="+91 9876543210" value={form.mobile}
              onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Email</Label>
            <Input type="email" placeholder="traveler@email.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Destination</Label>
            <Input placeholder="Goa, Thailand..." value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>No. of Travelers</Label>
            <Select value={form.travelers} onValueChange={v => setForm(f => ({ ...f, travelers: v }))}>
              <SelectTrigger className="mt-1.5 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} traveler{n > 1 ? "s" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className={TEXT.label}>Travel From</Label>
            <Input type="date" value={form.departureDate}
              onChange={e => setForm(f => ({ ...f, departureDate: e.target.value }))} className="mt-1.5" />
          </div>
          <div>
            <Label className={TEXT.label}>Travel To</Label>
            <Input type="date" value={form.returnDate}
              onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} className="mt-1.5" />
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className={cn(TEXT.h3, "mb-4")}>Select Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_PLANS.map(plan => (
            <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "bg-card border-2 rounded-xl p-5 cursor-pointer transition-all",
                selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              )}>
              {selectedPlan === plan.id && (
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(TEXT.badge, "text-primary font-semibold")}>Selected</span>
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              )}
              <p className={TEXT.h4}>{plan.name}</p>
              <p className={TEXT.caption}>{plan.provider}</p>
              <p className={cn(TEXT.h2, "mt-3 text-primary")}>₹{(plan.price * +form.travelers).toLocaleString()}</p>
              <p className={TEXT.caption}>for {form.travelers} traveler{+form.travelers > 1 ? "s" : ""}</p>

              <div className="space-y-2 mt-4 border-t pt-4">
                <div className="flex justify-between">
                  <span className={TEXT.bodySm}>Coverage</span>
                  <span className={cn(TEXT.bodySm, "font-medium")}>{plan.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className={TEXT.bodySm}>Medical</span>
                  <span className={cn(TEXT.bodySm, "font-medium")}>{plan.medical}</span>
                </div>
                <div className="flex justify-between">
                  <span className={TEXT.bodySm}>Baggage</span>
                  <span className={cn(TEXT.bodySm, "font-medium")}>{plan.baggage}</span>
                </div>
                <div className="flex justify-between">
                  <span className={TEXT.bodySm}>Trip Cancellation</span>
                  <span className={cn(TEXT.bodySm, plan.cancellation ? "text-green-600 font-medium" : "text-muted-foreground")}>
                    {plan.cancellation ? "✓ Yes" : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className={TEXT.label}>Selected: {plan?.name}</p>
            <p className={cn(TEXT.h2, "text-primary")}>₹{((plan?.price || 0) * +form.travelers).toLocaleString()}</p>
          </div>
          <Button size="lg" onClick={handlePurchase} disabled={purchasing}>
            {purchasing ? "Processing..." : "Purchase Insurance"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
