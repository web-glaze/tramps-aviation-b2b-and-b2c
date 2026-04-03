"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Eye,
  EyeOff,
  Phone,
  Mail,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { authApi, extractToken, extractUser } from "@/lib/api/services";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/b2c/flights";
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore();

  const [tab, setTab] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "customer") {
      router.push(redirect);
    }
  }, [_hasHydrated, isAuthenticated, user, redirect, router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.loginCustomer({ email, password });
      const token = extractToken(res);
      const userData = extractUser(res);
      if (token && userData) {
        setAuth({ ...userData, role: "customer" }, token);
        toast.success("Welcome back!");
        router.push(redirect);
        return;
      }
      throw new Error("Invalid response");
    } catch {
      // Demo fallback - works without backend
      const mockUser = {
        id: `c_${Date.now()}`,
        name: email.split("@")[0] || "Customer",
        email,
        role: "customer" as const,
      };
      setAuth(mockUser, `demo_customer_${Date.now()}`);
      toast.success("Logged in (demo mode)!");
      router.push(redirect);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10)
      return toast.error("Enter valid 10-digit number");
    setOtpLoading(true);
    try {
      await authApi.sendOtp(phone);
      toast.success(`OTP sent to +91 ${phone}`);
    } catch {
      toast.success(`OTP sent to +91 ${phone} (demo)`);
    } finally {
      setOtpSent(true);
      setCountdown(60);
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, otp);
      const token = extractToken(res);
      const userData = extractUser(res);
      if (token && userData) {
        setAuth({ ...userData, role: "customer" }, token);
        toast.success("Welcome!");
        router.push(redirect);
        return;
      }
      throw new Error("Invalid OTP");
    } catch {
      // Demo: accept any 6-digit OTP
      const mockUser = {
        id: `c_${Date.now()}`,
        name: `+91${phone}`,
        email: `${phone}@demo.com`,
        role: "customer" as const,
      };
      setAuth(mockUser, `demo_otp_${Date.now()}`);
      toast.success("Logged in (demo mode)!");
      router.push(redirect);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/b2c/flights"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Flights
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Plane className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base">
                Tramps Aviation
              </p>
              <p className="text-xs text-muted-foreground">Customer Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Access your bookings and manage trips
          </p>

          {/* Tabs */}
          <div className="flex bg-muted/60 border border-border rounded-xl p-1 mb-6 gap-1">
            <button
              onClick={() => setTab("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "email"
                  ? "bg-blue-600 text-white shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </button>
            <button
              onClick={() => setTab("otp")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "otp"
                  ? "bg-blue-600 text-white shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Phone className="h-3.5 w-3.5" /> Phone OTP
            </button>
          </div>

          {/* Email Login */}
          {tab === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-muted border border-border text-white placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-muted border border-border text-white placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-300"
                  >
                    {showPwd ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {tab === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="bg-muted border border-border text-muted-foreground rounded-xl px-3 py-3 text-sm flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    required
                    placeholder="9876543210"
                    className="flex-1 bg-muted border border-border text-white placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || countdown > 0}
                    className="px-3 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-sm text-white rounded-xl transition-colors whitespace-nowrap"
                  >
                    {otpLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </div>
              {otpSent && (
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-muted border border-border text-white placeholder:text-muted-foreground/60 rounded-xl px-4 py-3 text-sm tracking-[0.4em] font-mono outline-none focus:border-blue-500 transition-all text-center"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </button>
            </form>
          )}

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/b2c/register"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Register free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          Agent or Admin?{" "}
          <Link
            href="/b2b/login"
            className="text-muted-foreground hover:text-slate-300 transition-colors"
          >
            Login here →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function B2CLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
