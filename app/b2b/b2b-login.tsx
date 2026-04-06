"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi, extractToken, extractAgent } from "@/lib/api/services";
import { toast } from "sonner";

const s = {
  page: { minHeight: "100vh", background: "#060b14", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" } as React.CSSProperties,
  card: { background: "#0a1020", border: "1px solid #1a2840", borderRadius: "1rem", padding: "1.75rem" } as React.CSSProperties,
  label: { fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, display: "block", marginBottom: "0.375rem" } as React.CSSProperties,
  input: { width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "white", outline: "none", boxSizing: "border-box" } as React.CSSProperties,
  btn: { width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: "0.75rem", padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" } as React.CSSProperties,
};

// Detect what kind of identifier was entered
function detectIdentifierType(value: string): string {
  if (value.includes("@")) return "Email";
  if (/^TRV-\d+$/i.test(value.trim())) return "Agent ID";
  if (/^\d{10}$/.test(value.replace(/\D/g, ""))) return "Phone";
  return "Email / Agent ID / Phone";
}

export default function B2BLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState("Email / Agent ID / Phone");

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "agent") {
      const kycApproved = user?.kycStatus === "approved" || user?.status === "active";
      router.push(kycApproved ? "/b2b/dashboard" : "/b2b/kyc");
    }
  }, [_hasHydrated, isAuthenticated, user]);

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    setIdentifierType(detectIdentifierType(val));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter your Email, Agent ID, or Phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.loginAgent({
        identifier: identifier.trim(),
        password,
      });
      const token = extractToken(res);
      const agent = extractAgent(res);

      if (!token) throw new Error("Login failed — no token returned");

      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("agent_token", token);

      const kycStatus = agent?.kycStatus || "pending";

      setAuth({
        id: agent.id || agent._id,
        name: agent.contactPerson || agent.agencyName,
        email: agent.email,
        role: "agent",
        kycStatus,
        status: agent.status,
        agencyName: agent.agencyName,
        agentId: agent.agentId,
        walletBalance: agent.walletBalance,
        kycRejectionReason: agent.kycRejectionReason,
      } as any, token);

      if (kycStatus === "approved" || agent.status === "active") {
        toast.success(`Welcome back, ${agent.agencyName}!`);
        router.push("/b2b/dashboard");
        return;
      }

      if (kycStatus === "pending" || kycStatus === "rejected") {
        toast.info("Please complete your KYC to activate your account.");
        router.push("/b2b/kyc");
        return;
      }

      toast.info("Your KYC documents are under review. Please wait for admin approval.");
      router.push("/b2b/kyc");

    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "";
      if (msg.toLowerCase().includes("suspend")) toast.error("Account suspended. Contact support.");
      else if (msg.toLowerCase().includes("inactive")) toast.error("Account inactive. Contact support.");
      else toast.error(msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#475569", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Home
          </Link>
        </div>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <div style={{ width: 42, height: 42, background: "linear-gradient(135deg, #3b82f6, #4f46e5)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plane style={{ width: 20, height: 20, color: "white" }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0 }}>Tramps Aviation B2B</h1>
            <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0 }}>Agent Portal</p>
          </div>
        </div>

        <div style={s.card}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>Agent Sign In</h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
            Use your Email, Agent ID (TRV-XXXXX), or Phone number
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Identifier field */}
            <div>
              <label style={s.label}>
                {identifierType}
                {identifier && identifierType !== "Email / Agent ID / Phone" && (
                  <span style={{ marginLeft: "0.5rem", color: "#22c55e", fontSize: "0.7rem" }}>✓ {identifierType} detected</span>
                )}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                placeholder="e.g. agent@agency.com / TRV-00001 / 9876543210"
                style={s.input}
              />
              {/* Helper hint */}
              <div style={{ marginTop: "0.375rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "Email", example: "agent@agency.com" },
                  { label: "Agent ID", example: "TRV-00001" },
                  { label: "Phone", example: "9876543210" },
                ].map(({ label, example }) => (
                  <span key={label} style={{ fontSize: "0.65rem", color: "#334155", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.375rem", padding: "0.15rem 0.5rem" }}>
                    {label}: <span style={{ color: "#475569" }}>{example}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={s.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  style={{ ...s.input, paddingRight: "2.5rem" }}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 0 }}>
                  {showPwd ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #1a2840", display: "flex", flexDirection: "column", gap: "0.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Don&apos;t have an account?{" "}
              <Link href="/b2b/register" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>Register Agency</Link>
            </p>
            <p style={{ fontSize: "0.75rem" }}>
              <Link href="/b2b/forgot-password" style={{ color: "#475569", textDecoration: "none" }}>Forgot password?</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}