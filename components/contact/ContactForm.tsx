"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  Plane,
  Building2,
  Shield,
  HelpCircle,
  FileText,
  Wallet,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePlatformStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ── Types ──────────────────────────────────────────────────────────────────────
export type ContactVariant = "public" | "agent";

interface ContactFormProps {
  variant?: ContactVariant;
  // Pre-fill from logged-in user (B2B portal passes these)
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
    agentId?: string;
  };
}

// ── Constants ──────────────────────────────────────────────────────────────────
const ENQUIRY_TYPES = [
  { value: "general", label: "💬 General Enquiry" },
  { value: "booking_help", label: "✈️ Booking Help" },
  { value: "refund", label: "💰 Refund / Cancellation" },
  { value: "agent_support", label: "🤝 Agent Support (B2B)" },
  { value: "complaint", label: "⚠️ Complaint" },
  { value: "partnership", label: "🏢 Partnership / Business" },
  { value: "other", label: "📋 Other" },
];

const USER_TYPES = [
  { value: "customer", label: "Customer (B2C)" },
  { value: "agent", label: "Travel Agent (B2B)" },
  { value: "visitor", label: "Just Browsing" },
];

const AGENT_FAQS = [
  {
    q: "How do I top up my wallet?",
    a: "Go to Wallet → Add Funds. Pay via UPI, NEFT/RTGS, or bank transfer. Credits reflect within 2 hours.",
  },
  {
    q: "How do I check my commission earnings?",
    a: "Go to Commission page in your sidebar. See per-booking commissions, monthly summaries, and request settlement.",
  },
  {
    q: "My booking is showing 'Pending' — what do I do?",
    a: "Most bookings confirm within 15 minutes. If still pending after 30 min, contact us with your booking reference.",
  },
  {
    q: "How do I add a sub-agent?",
    a: "Go to Profile → Sub-agents. Invite via email. Commissions shared as per your plan.",
  },
  {
    q: "How do I get KYC verified?",
    a: "Go to KYC section, upload PAN card, GST certificate (if applicable), and agency proof. Verification takes 24–48 hours.",
  },
  {
    q: "How do I request a refund?",
    a: "Go to My Bookings → Select booking → Request Refund. Wallet refunds are instant; bank refunds take 5–7 business days.",
  },
  {
    q: "Can I book for multiple passengers?",
    a: "Yes! Add multiple passengers in the search form. For groups of 10+, contact our group desk for special fares.",
  },
  {
    q: "What is the Series Fare section?",
    a: "Pre-negotiated bulk ticket slots at discounted rates for specific routes/dates. Available only to verified B2B agents.",
  },
];

// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({
  refId,
  email,
  onReset,
  variant,
}: {
  refId: string;
  email: string;
  onReset: () => void;
  variant: ContactVariant;
}) {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {variant === "agent" ? "Ticket Submitted!" : "Thank you!"}
      </h2>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
        Our team will get back to you within <strong>24 hours</strong>
        {email ? ` at ${email}` : ""}.
      </p>
      {refId && (
        <div className="inline-block mt-2 mb-6 p-4 bg-primary/10 rounded-2xl border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">
            Your Reference ID
          </p>
          <p className="text-xl font-bold font-mono text-primary">#{refId}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Save this for follow-up
          </p>
        </div>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onReset}
          className="px-5 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
        >
          Submit Another
        </button>
        {variant === "public" && (
          <a
            href="/"
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all"
          >
            Back to Home
          </a>
        )}
      </div>
    </div>
  );
}

// ── The Form ───────────────────────────────────────────────────────────────────
function EnquiryFormFields({
  form,
  set,
  submitting,
  onSubmit,
  variant,
}: {
  form: any;
  set: (k: string, v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  variant: ContactVariant;
}) {
  const isAgent = variant === "agent";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* User type toggle — only for public */}
      {!isAgent && (
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            I am a *
          </label>
          <div className="flex gap-2 flex-wrap">
            {USER_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("userType", t.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  form.userType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Phone + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Enquiry Type *
          </label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            {(isAgent
              ? ENQUIRY_TYPES.filter((t) =>
                  [
                    "agent_support",
                    "booking_help",
                    "refund",
                    "complaint",
                    "general",
                    "other",
                  ].includes(t.value),
                )
              : ENQUIRY_TYPES
            ).map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agent ID (agent variant always, or public when userType=agent) */}
      {(isAgent || form.userType === "agent") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Agent ID
            </label>
            <input
              type="text"
              value={form.agentId}
              onChange={(e) => set("agentId", e.target.value.toUpperCase())}
              placeholder="TAHP00001"
              readOnly={isAgent && !!form.agentId}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {(form.type === "booking_help" || form.type === "refund") && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Booking Reference
              </label>
              <input
                type="text"
                value={form.bookingRef}
                onChange={(e) =>
                  set("bookingRef", e.target.value.toUpperCase())
                }
                placeholder="BK-XXXXXXXX"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {/* Booking Ref for public non-agent if type matches */}
      {!isAgent &&
        form.userType !== "agent" &&
        (form.type === "booking_help" || form.type === "refund") && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Booking Reference
            </label>
            <input
              type="text"
              value={form.bookingRef}
              onChange={(e) => set("bookingRef", e.target.value.toUpperCase())}
              placeholder="BK-XXXXXXXX"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        )}

      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">
          Subject *
        </label>
        <input
          type="text"
          required
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder="Brief description of your enquiry"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1">
          Message *
        </label>
        <textarea
          required
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          rows={isAgent ? 4 : 5}
          placeholder="Please describe your enquiry in detail..."
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
            Submitting...
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4" />{" "}
            {isAgent ? "Submit Ticket" : "Send Enquiry"}
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to our{" "}
        <a href="/cms/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        . We typically respond within 24 hours.
      </p>
    </form>
  );
}

// ── Main exported component ────────────────────────────────────────────────────
export function ContactForm({ variant = "public", prefill }: ContactFormProps) {
  const { ps, fetchIfStale } = usePlatformStore();
  useEffect(() => {
    fetchIfStale();
  }, []);

  const [form, setForm] = useState({
    name: prefill?.name || "",
    email: prefill?.email || "",
    phone: prefill?.phone || "",
    agentId: prefill?.agentId || "",
    userType: variant === "agent" ? "agent" : "customer",
    type: variant === "agent" ? "agent_support" : "general",
    subject: "",
    message: "",
    bookingRef: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sync prefill when user data loads (B2B portal)
  useEffect(() => {
    if (prefill) {
      setForm((f) => ({
        ...f,
        name: prefill.name || f.name,
        email: prefill.email || f.email,
        phone: prefill.phone || f.phone,
        agentId: prefill.agentId || f.agentId,
      }));
    }
  }, [prefill?.name, prefill?.email, prefill?.agentId]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userType: variant === "agent" ? "agent" : form.userType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRefId(data.referenceId || "");
        setSubmitted(true);
      } else toast.error("Failed to submit. Please try again.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm((f) => ({ ...f, subject: "", message: "", bookingRef: "" }));
  };

  // Resolved contact info
  const phoneRaw = ps.supportPhone || "+911800001234";
  const phoneDisplay = ps.supportPhoneDisplay || "1800-001-2345 (Toll Free)";
  const emailAddr = ps.supportEmail || "support@trampsaviation.com";
  const address =
    [ps.addressLine1, ps.addressLine2, ps.city, ps.state, ps.pincode]
      .filter(Boolean)
      .join(", ") || "India";

  // ── AGENT VARIANT (B2B sidebar layout) ────────────────────────────────────
  if (variant === "agent") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Get help with bookings, wallet, commissions or any other queries
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Phone,
              label: "Call Us",
              value: phoneDisplay,
              sub: "Mon–Sat, 9AM–6PM",
              href: `tel:${phoneRaw.replace(/\D/g, "")}`,
              color: "text-green-600 bg-green-50 dark:bg-green-950",
            },
            {
              icon: Mail,
              label: "Email Support",
              value: emailAddr,
              sub: "Response within 24 hours",
              href: `mailto:${emailAddr}`,
              color: "text-blue-600 bg-blue-50 dark:bg-blue-950",
            },
            {
              icon: MessageSquare,
              label: "Submit Ticket",
              value: "Use the form below",
              sub: "Track with reference ID",
              href: "#support-form",
              color: "text-purple-600 bg-purple-50 dark:bg-purple-950",
            },
          ].map(({ icon: Icon, label, value, sub, href, color }) => (
            <a
              key={label}
              href={href}
              className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/40 transition-all"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  color,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQs */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" /> Agent FAQs
            </h2>
            <div className="space-y-2">
              {AGENT_FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-medium text-foreground pr-2">
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-3 pt-3 text-sm text-muted-foreground leading-relaxed border-t border-border bg-muted/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <a
              href="/cms/faq"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View all FAQs <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Ticket form */}
          <div
            id="support-form"
            className="bg-card border border-border rounded-2xl p-6"
          >
            {submitted ? (
              <SuccessScreen
                refId={refId}
                email={form.email}
                onReset={handleReset}
                variant="agent"
              />
            ) : (
              <>
                <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Submit Support
                  Ticket
                </h2>
                <EnquiryFormFields
                  form={form}
                  set={set}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                  variant="agent"
                />
              </>
            )}
          </div>
        </div>

        {/* Useful resources */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-base text-foreground mb-4">
            📚 Useful Resources
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                icon: FileText,
                label: "Terms & Conditions",
                href: "/cms/terms",
              },
              { icon: FileText, label: "Refund Policy", href: "/cms/refund" },
              { icon: FileText, label: "Privacy Policy", href: "/cms/privacy" },
              { icon: Wallet, label: "Add Wallet Funds", href: "/b2b/wallet" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PUBLIC VARIANT (full page with header/footer) ──────────────────────────
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#208dcb]/10 to-primary/5 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Get in Touch
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question, need booking help, or want to become an agent?
            We're here for you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: contact info sidebar */}
        <div className="space-y-5">
          {/* Contact details */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-base text-foreground mb-4">
              Contact Details
            </h2>
            <div className="space-y-4">
              <a
                href={`tel:${phoneRaw.replace(/\D/g, "")}`}
                className="flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-semibold text-foreground">
                    {phoneDisplay}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mon–Sat, 9AM–6PM IST
                  </p>
                </div>
              </a>
              <a
                href={`mailto:${emailAddr}`}
                className="flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">
                    {emailAddr}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Response within 24 hours
                  </p>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-semibold text-foreground">
                    {address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business hours */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Business Hours
            </h2>
            <div className="space-y-2 text-sm">
              {[
                ["Monday – Friday", "9:00 AM – 6:00 PM"],
                ["Saturday", "10:00 AM – 4:00 PM"],
                ["Sunday", "Closed"],
              ].map(([d, t]) => (
                <div key={d} className="flex justify-between">
                  <span className="text-muted-foreground">{d}</span>
                  <span
                    className={cn(
                      "font-medium",
                      t === "Closed" ? "text-red-500" : "text-foreground",
                    )}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick help */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-bold text-base text-foreground mb-4">
              Quick Help
            </h2>
            <div className="space-y-1">
              {[
                { icon: HelpCircle, label: "FAQs", href: "/cms/faq" },
                { icon: Plane, label: "Search Flights", href: "/flights" },
                {
                  icon: Building2,
                  label: "Become an Agent",
                  href: "/b2b/register",
                },
                { icon: Shield, label: "Refund Policy", href: "/cms/refund" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            {submitted ? (
              <SuccessScreen
                refId={refId}
                email={form.email}
                onReset={handleReset}
                variant="public"
              />
            ) : (
              <>
                <h2 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Send us a
                  Message
                </h2>
                <EnquiryFormFields
                  form={form}
                  set={set}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                  variant="public"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
