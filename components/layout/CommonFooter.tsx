import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  BadgeCheck,
  Plane,
  ChevronRight,
} from "lucide-react";
import { APP_NAME } from "@/config/app";

const FOOTER_LINKS = [
  {
    title: "Platform",
    links: [
      { href: "/flights", label: "Search Flights" },
      { href: "/hotels", label: "Book Hotels" },
      { href: "/insurance", label: "Travel Insurance" },
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
    title: "Legal",
    links: [
      { href: "/cms/terms", label: "Terms of Service" },
      { href: "/cms/privacy", label: "Privacy Policy" },
      { href: "/cms/refund", label: "Refund Policy" },
      { href: "/cms/faq", label: "FAQs" },
    ],
  },
];

export function CommonFooter() {
  return (
    <footer className="border-t border-border bg-card relative overflow-hidden">
      {/* Background map image */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: "url('/map-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.9,
          mixBlendMode: "multiply",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Main grid ── */}
        <div className="py-12 grid grid-cols-2 sm:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-white flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt={APP_NAME}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base font-display leading-none block text-foreground">
                  {APP_NAME}
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wide">
                  B2B & B2C Travel Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's premier travel booking platform. Best prices on flights,
              hotels and insurance for travelers & travel agents.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="h-8 w-8 rounded-lg border border-border hover:border-primary/50 hover:text-primary flex items-center justify-center transition-all text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <a
                href="tel:+911800001234"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                1800-001-2345 (Toll Free)
              </a>
              <a
                href="mailto:support@trampsaviation.in"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-primary" />
                support@trampsaviation.in
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title} className="space-y-4">
              <h4 className="font-bold text-sm text-foreground">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                    >
                      {label}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tramps Aviation India Pvt. Ltd. All
            rights reserved. | IATA Accredited | RBI Licensed
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-500" /> Secured by SSL
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck className="h-3 w-3 text-[#208dcb]" /> IATA Verified
            </span>
            <span className="flex items-center gap-1">
              <Plane className="h-3 w-3 text-primary" /> 200+ Airlines
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
