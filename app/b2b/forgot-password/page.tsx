"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plane, Loader2, CheckCircle, KeyRound, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

type Step = "email" | "otp" | "newpass" | "done";

export default function B2BForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>("email");
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [newPwd, setNewPwd]     = useState("");
  const [confirmPwd, setConfirm]= useState("");
  const [loading, setLoading]   = useState(false);

  const page:  React.CSSProperties = { minHeight: "100vh", background: "#060b14", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
  const card:  React.CSSProperties = { background: "#0a1020", border: "1px solid #1a2840", borderRadius: "1rem", padding: "1.75rem" };
  const inp:   React.CSSProperties = { width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "white", outline: "none", boxSizing: "border-box" };
  const lbl:   React.CSSProperties = { fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, display: "block", marginBottom: "0.375rem" };
  const submitBtn = (disabled: boolean): React.CSSProperties => ({ width: "100%", background: disabled ? "#1e3a8a" : "#2563eb", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: disabled ? 0.65 : 1 });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/agents/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
    } catch { /* silent */ } finally {
      setLoading(false);
      setStep("otp");
      toast.success("OTP sent! Check your inbox (and spam folder).");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return toast.error("Enter the 6-digit OTP");
    setStep("newpass");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8)     return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirmPwd) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      const res = await fetch(`${API}/agents/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp: otp.trim(), newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setStep("done");
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Reset failed. The OTP may be wrong or expired.");
    } finally { setLoading(false); }
  };

  const steps = [
    { key: "email", icon: Mail, label: "Email" },
    { key: "otp", icon: Shield, label: "OTP" },
    { key: "newpass", icon: KeyRound, label: "Password" },
  ];
  const stepIdx: Record<Step, number> = { email: 0, otp: 1, newpass: 2, done: 3 };

  return (
    <div style={page}>
      <div style={{ width: "100%", maxWidth: "26rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/b2b/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#475569", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Login
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #3b82f6, #4f46e5)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane style={{ width: 20, height: 20, color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0 }}>TravelPro B2B</h1>
            <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0 }}>Reset your password</p>
          </div>
        </div>

        {step !== "done" && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            {steps.map((s, i) => {
              const done   = i < stepIdx[step];
              const active = i === stepIdx[step];
              const Icon   = s.icon;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#16a34a" : active ? "#2563eb" : "#1e293b", border: `2px solid ${done ? "#16a34a" : active ? "#3b82f6" : "#334155"}` }}>
                      {done ? <CheckCircle style={{ width: 15, height: 15, color: "white" }} /> : <Icon style={{ width: 13, height: 13, color: active ? "white" : "#475569" }} />}
                    </div>
                    <span style={{ fontSize: "0.65rem", color: active ? "#93c5fd" : done ? "#4ade80" : "#475569", fontWeight: active ? 600 : 400 }}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? "#16a34a" : "#1e293b", margin: "0 0.5rem", marginBottom: "1.1rem" }} />}
                </div>
              );
            })}
          </div>
        )}

        <div style={card}>
          {step === "email" && (
            <>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>Forgot Password</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Enter your registered email to receive a 6-digit OTP.</p>
              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="agent@agency.com" style={inp} />
                </div>
                <button type="submit" disabled={loading} style={submitBtn(loading)}>
                  {loading ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Sending OTP...</> : "Send OTP →"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>Enter OTP</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
                A 6-digit OTP was sent to <strong style={{ color: "#93c5fd" }}>{email}</strong>. Check inbox and spam.
              </p>
              <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={lbl}>6-Digit OTP</label>
                  <input
                    type="text" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required autoFocus placeholder="••••••" inputMode="numeric"
                    style={{ ...inp, fontSize: "2rem", letterSpacing: "0.75rem", textAlign: "center", fontFamily: "monospace", padding: "0.875rem 1rem" }}
                  />
                </div>
                <button type="submit" disabled={otp.length !== 6} style={submitBtn(otp.length !== 6)}>
                  Verify OTP →
                </button>
                <button type="button" onClick={() => { setStep("email"); setOtp(""); }}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.8rem", cursor: "pointer", padding: 0, textAlign: "center" }}>
                  ← Resend / Change email
                </button>
              </form>
            </>
          )}

          {step === "newpass" && (
            <>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>Set New Password</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Choose a strong password of at least 8 characters.</p>
              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={lbl}>New Password</label>
                  <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required autoFocus placeholder="Min 8 characters" style={inp} />
                  {newPwd && newPwd.length < 8 && <p style={{ color: "#f59e0b", fontSize: "0.7rem", margin: "0.25rem 0 0" }}>⚠ Min 8 characters</p>}
                </div>
                <div>
                  <label style={lbl}>Confirm Password</label>
                  <input type="password" value={confirmPwd} onChange={(e) => setConfirm(e.target.value)} required placeholder="Re-enter password"
                    style={{ ...inp, borderColor: confirmPwd && confirmPwd !== newPwd ? "#ef4444" : "#1e293b" }} />
                  {confirmPwd && confirmPwd !== newPwd && <p style={{ color: "#f87171", fontSize: "0.7rem", margin: "0.25rem 0 0" }}>❌ Passwords don't match</p>}
                  {confirmPwd && confirmPwd === newPwd && newPwd.length >= 8 && <p style={{ color: "#4ade80", fontSize: "0.7rem", margin: "0.25rem 0 0" }}>✅ Passwords match</p>}
                </div>
                <button type="submit" disabled={loading || newPwd.length < 8 || newPwd !== confirmPwd} style={submitBtn(loading || newPwd.length < 8 || newPwd !== confirmPwd)}>
                  {loading ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Resetting...</> : "Reset Password →"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
              <div style={{ width: 64, height: 64, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <CheckCircle style={{ width: 32, height: 32, color: "#4ade80" }} />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: "0 0 0.5rem" }}>Password Reset!</h2>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.75rem" }}>
                Your password has been updated. You can now login with your new password.
              </p>
              <button onClick={() => router.push("/b2b/login")} style={submitBtn(false)}>
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}