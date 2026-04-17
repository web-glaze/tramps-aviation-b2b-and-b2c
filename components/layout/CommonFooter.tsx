"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Shield,
  BadgeCheck,
  Plane,
  ArrowRight,
  Zap,
  UserPlus,
} from "lucide-react";
import { APP_NAME } from "@/config/app";
import { useAuthStore, usePlatformStore } from "@/lib/store";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { href: "/flights", label: "Search Flights" },
      { href: "/hotels", label: "Book Hotels" },
      { href: "/insurance", label: "Travel Insurance" },
      { href: "/series-fare", label: "Series Fares" },
      { href: "/b2b/register", label: "Agent Portal" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/b2c/login", label: "Sign In" },
      { href: "/b2c/register", label: "Register (B2C)" },
      { href: "/b2b/login", label: "Agent Login" },
      { href: "/b2c/my-trips", label: "My Trips" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/faq", label: "FAQs" },
      { href: "/refund", label: "Refund Policy" },
      { href: "/b2b/help", label: "Agent Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/about", label: "About Us" },
    ],
  },
];

const SOCIAL_ICONS: Record<string, { Icon: any; label: string }> = {
  socialFacebook: { Icon: Facebook, label: "Facebook" },
  socialTwitter: { Icon: Twitter, label: "Twitter / X" },
  socialInstagram: { Icon: Instagram, label: "Instagram" },
  socialLinkedin: { Icon: Linkedin, label: "LinkedIn" },
  socialYoutube: { Icon: Youtube, label: "YouTube" },
  socialWhatsapp: { Icon: MessageCircle, label: "WhatsApp" },
};

export function CommonFooter() {
  const { role } = useAuthStore();
  const { ps, fetchIfStale } = usePlatformStore();
  useEffect(() => {
    fetchIfStale();
  }, []);

  const routeForContext = (href: string) => {
    if (href === "/flights" || href === "/hotels" || href === "/insurance" || href === "/series-fare") {
      if (role === "agent") return `/b2b${href}`;
      if (role === "customer") return `/b2c${href}`;
    }
    return href;
  };

  const name = ps.platformName || APP_NAME;
  const tagline = ps.platformTagline || "B2B & B2C Travel Platform";
  const description =
    ps.platformDescription ||
    "India's premier travel booking platform. Best prices on flights, hotels and insurance for travelers & travel agents.";
  const copyright =
    ps.footerCopyright ||
    "Tramps Aviation India Pvt. Ltd. All rights reserved.";
  const email = ps.supportEmail || "support@trampsaviation.in";
  const phone = ps.supportPhone || "";
  const phoneDisplay = ps.supportPhoneDisplay || "1800-001-2345 (Toll Free)";
  const address = [
    ps.addressLine1,
    ps.addressLine2,
    ps.city,
    ps.state,
    ps.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const socialLinks = Object.entries(SOCIAL_ICONS)
    .map(([key, { Icon, label }]) => ({
      key,
      Icon,
      label,
      url: (ps as any)[key],
    }))
    .filter((s) => s.url);

  return (
    <footer className="bg-card border-t border-border mt-16">
      {/* ══ SECTION 1 — Brand + Nav Links ══════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT — Logo + Desc + Social (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="h-11 w-11 rounded-2xl overflow-hidden border border-border bg-white flex-shrink-0 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt={name}
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base leading-tight block text-foreground group-hover:text-primary transition-colors">
                  {name}
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
                  {tagline}
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Social icons */}
            <div className="flex gap-2 flex-wrap">
              {socialLinks.length > 0
                ? socialLinks.map(({ key, Icon, label, url }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="h-9 w-9 rounded-xl border border-border bg-background hover:bg-primary hover:border-primary hover:text-white flex items-center justify-center transition-all text-muted-foreground"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))
                : [Facebook, Twitter, Instagram, Linkedin, Youtube].map(
                    (Icon, i) => (
                      <span
                        key={i}
                        className="h-9 w-9 rounded-xl border border-border/40 flex items-center justify-center text-muted-foreground/25"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ),
                  )}
            </div>
          </div>

          {/* RIGHT — Nav columns (8 cols, 4 cols grid) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {FOOTER_LINKS.map(({ title, links }) => (
                <div key={title} className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-widest border-b border-border pb-2">
                    {title}
                  </h4>
                  <ul className="space-y-2.5">
                    {links.map(({ href, label }) => (
                      <li key={label}>
                        <Link
                          href={routeForContext(href)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors shrink-0" />
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 — Address + Contact + 2 CTAs ═════════════════════════ */}
      <div className="flex items-center justify-center my-2 py-2 border-t border-border w-4/5 mx-auto">
        {/* <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-border w-4/5 mx-auto" />
        </div> */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">
                Contact Us
              </h5>
              {(phone || phoneDisplay) && (
                <a
                  href={phone ? `tel:${phone.replace(/\D/g, "")}` : "#"}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-0.5">
                      {phoneDisplay}
                    </p>
                  </div>
                </a>
              )}
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mt-0.5 truncate max-w-[200px]">
                    {email}
                  </p>
                </div>
              </a>
              {address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none">
                      Address
                    </p>
                    <p className="text-sm text-foreground leading-relaxed mt-0.5">
                      {address}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA 1 — Become a Travel Agent */}
            <div className="flex flex-col justify-between gap-4 p-5 rounded-2xl border border-primary/25 bg-primary/5 hover:bg-primary/8 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    Become a Travel Agent
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Earn commissions on every booking. Exclusive B2B rates,
                    wallet system & dedicated support.
                  </p>
                </div>
              </div>
              <Link
                href="/b2b/register"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                Register as Agent <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* CTA 2 — Become a Customer */}
            <div className="flex flex-col justify-between gap-4 p-5 rounded-2xl border border-border bg-background hover:border-primary/30 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    Book as a Customer
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Best prices on flights, hotels & insurance. Instant
                    confirmation. Free account.
                  </p>
                </div>
              </div>
              <Link
                href="/b2c/register"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-600 text-sm font-semibold transition-all text-foreground"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3 — Trust Badges ════════════════════════════════════════ */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-8">
          {[
            {
              icon: <Shield className="h-3.5 w-3.5 text-emerald-500" />,
              text: "SSL Secured",
            },
            {
              icon: <BadgeCheck className="h-3.5 w-3.5 text-[#208dcb]" />,
              text: "IATA Accredited",
            },
            {
              icon: <BadgeCheck className="h-3.5 w-3.5 text-purple-500" />,
              text: "RBI Licensed",
            },
            {
              icon: <Plane className="h-3.5 w-3.5 text-primary" />,
              text: "200+ Airlines",
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
            >
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 4 — Copyright Bar ═══════════════════════════════════════ */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} {copyright}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="px-2 py-1 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/terms"
              className="px-2 py-1 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <span className="text-border">·</span>
            <Link
              href="/refund"
              className="px-2 py-1 hover:text-primary transition-colors"
            >
              Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


