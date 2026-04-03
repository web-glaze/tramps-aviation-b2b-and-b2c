"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi, extractToken, extractUser, unwrap } from "@/lib/api/services";
import { toast } from "sonner";

const IS_DEV = process.env.NODE_ENV !== "production";

export default function B2CRegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore();
  const otpRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "otp">("form");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const u = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "customer")
      router.push("/b2c/flights");
  }, [_hasHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords don't match");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (form.phone.length !== 10)
      return toast.error("Enter valid 10-digit mobile number");

    setLoading(true);
    try {
      const res = await authApi.registerCustomer({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone,
        password: form.password,
      });
      const resData = unwrap(res) as any;
      if (resData?.error) throw new Error(resData?.message || "Registration failed");

      // Send OTP
      try {
        const otpRes = await authApi.sendOtp(`+91${form.phone}`);
        const otpData = unwrap(otpRes) as any;
        if (IS_DEV && otpData?.otp) {
          toast.success(`OTP: ${otpData.otp}`, { description: "Dev mode", duration: 10000 });
        } else {
          toast.success(`OTP sent to +91 ${form.phone}`);
        }
      } catch {
        toast.success(IS_DEV ? "Dev mode — use OTP: 123456" : `OTP sent to +91 ${form.phone}`);
      }

      setStep("otp");
      setCountdown(60);
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (
        msg.includes("already") ||
        msg.includes("exist") ||
        msg.includes("duplicate")
      ) {
        toast.error("Email or phone already registered.", {
          action: { label: "Login", onClick: () => router.push("/b2c/login") },
        });
      } else {
        toast.error(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter 6-digit OTP");
    setLoading(true);

    try {
      const otpRes = await authApi.verifyOtp(`+91${form.phone}`, otp);
      let token = extractToken(otpRes);
      let userData = extractUser(otpRes);

      // If OTP response didn't return user, login with email+password
      if (!token) {
        const loginRes = await authApi.loginCustomer({ email: form.email, password: form.password });
        token = extractToken(loginRes);
        userData = extractUser(loginRes);
      }

      if (token && userData) {
        setAuth(
          {
            id: userData.id || userData._id,
            name: userData.firstName
              ? `${userData.firstName} ${userData.lastName}`
              : userData.name || form.firstName,
            email: userData.email || form.email,
            role: "customer",
            avatar: userData.avatar,
          } as any,
          token,
        );
        toast.success("Registration complete! Welcome aboard 🎉");
        router.push("/b2c/flights");
      } else {
        throw new Error("Verification failed — please login manually.");
      }
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (
        msg.includes("invalid") ||
        msg.includes("expired") ||
        msg.includes("attempt")
      ) {
        toast.error(err.message || "Invalid OTP. Please try again.");
      } else {
        toast.error(err.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      const res = await authApi.resendOtp(`+91${form.phone}`);
      const data = unwrap(res) as any;
      if (IS_DEV && data?.otp) {
        toast.success(`New OTP: ${data.otp}`, { duration: 10000 });
      } else {
        toast.success("OTP resent!");
      }
      setCountdown(60);
      setOtp("");
    } catch { toast.error("Failed to resend OTP"); }
  };

  const inp =
    "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-muted-foreground/50";

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md mb-6">
        {step === "otp" ? (
          <button
            onClick={() => setStep("form")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : (
          <Link
            href="/b2c/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Already have an account?
          </Link>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Tramps Aviation</h1>
            <p className="text-xs text-muted-foreground">
              {step === "otp" ? "Verify your number" : "Create account"}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7">
          {step === "form" ? (
            <>
              <h2 className="text-2xl font-bold mb-1">Create account</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Book flights and hotels in minutes
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                      First Name *
                    </label>
                    <input
                      value={form.firstName}
                      onChange={(e) => u("firstName", e.target.value)}
                      required
                      placeholder="Rahul"
                      className={inp}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                      Last Name *
                    </label>
                    <input
                      value={form.lastName}
                      onChange={(e) => u("lastName", e.target.value)}
                      required
                      placeholder="Sharma"
                      className={inp}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => u("email", e.target.value)}
                    required
                    placeholder="rahul@example.com"
                    className={inp}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <span className="bg-muted border border-border rounded-xl px-3 py-3 text-sm text-muted-foreground flex-shrink-0">
                      +91
                    </span>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        u(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      required
                      inputMode="numeric"
                      placeholder="9876543210"
                      className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {IS_DEV && (
                    <p className="text-xs text-amber-400 mt-1">
                      Dev: OTP will be shown in response (use 123456)
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => u("password", e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min 8 characters"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-10 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => u("confirmPassword", e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className={`${inp} ${form.confirmPassword && form.confirmPassword !== form.password ? "border-red-500" : ""}`}
                  />
                  {form.confirmPassword &&
                    form.confirmPassword !== form.password && (
                      <p className="text-red-400 text-xs mt-1">
                        ❌ Passwords don't match
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating
                      account...
                    </>
                  ) : (
                    "Create Account & Send OTP →"
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-7 w-7 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold">Verify your number</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  OTP sent to{" "}
                  <span className="text-white font-medium">
                    +91 {form.phone}
                  </span>
                </p>
                {IS_DEV && (
                  <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400 inline-block">
                    Dev mode — use OTP: <strong>123456</strong>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  ref={otpRef}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] font-bold outline-none focus:border-blue-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify & Complete Registration"
                  )}
                </button>

                <p className="text-center text-sm">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="text-blue-400 hover:underline disabled:text-muted-foreground disabled:no-underline transition-colors"
                  >
                    {countdown > 0
                      ? `Resend OTP in ${countdown}s`
                      : "Resend OTP"}
                  </button>
                </p>
              </form>
            </>
          )}

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/b2c/login"
                className="text-blue-400 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
