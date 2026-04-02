"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
type KycStatus =
  | "pending"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

interface KycScreen {
  visible: boolean;
  status: KycStatus;
  agencyName: string;
  contactPerson: string;
  rejectionReason?: string;
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#060b14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  } as React.CSSProperties,
  card: {
    background: "#0a1020",
    border: "1px solid #1a2840",
    borderRadius: "1rem",
    padding: "1.75rem",
  } as React.CSSProperties,
  label: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    fontWeight: 500,
    display: "block",
    marginBottom: "0.375rem",
  } as React.CSSProperties,
  input: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  } as React.CSSProperties,
  btn: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "0.75rem",
    padding: "0.75rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  } as React.CSSProperties,
};

export default function B2BLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState<KycScreen>({
    visible: false,
    status: "pending",
    agencyName: "",
    contactPerson: "",
  });

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "agent") {
      const kycApproved =
        user?.kycStatus === "approved" || user?.status === "active";
      router.push(kycApproved ? "/b2b/dashboard" : "/b2b/kyc");
    }
  }, [_hasHydrated, isAuthenticated, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/agents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      const agent = data.agent;
      const token = data.access_token;
      const kycStatus: KycStatus = agent?.kycStatus || "pending";

      // Save token to both cookie + localStorage
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("agent_token", token);

      setAuth(
        {
          id: agent.id || agent._id,
          name: agent.contactPerson || agent.agencyName,
          email: agent.email,
          role: "agent",
          kycStatus: kycStatus,
          status: agent.status,
          agencyName: agent.agencyName,
          walletBalance: agent.walletBalance,
          kycRejectionReason: agent.kycRejectionReason,
        },
        token,
      );

      if (kycStatus === "approved" || agent.status === "active") {
        toast.success(`Welcome back, ${agent.agencyName}!`);
        router.push("/b2b/dashboard");
        return;
      }

      // Not approved — show KYC status screen
      setKyc({
        visible: true,
        status: kycStatus,
        agencyName: agent.agencyName,
        contactPerson: agent.contactPerson,
        rejectionReason: agent.kycRejectionReason,
      });
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("suspend"))
        toast.error("Account suspended. Contact support.");
      else if (msg.toLowerCase().includes("inactive"))
        toast.error("Account inactive. Contact support.");
      else toast.error(msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (kyc.visible) {
    const cfg: Record<KycStatus, any> = {
      pending: {
        icon: (
          <AlertTriangle style={{ width: 32, height: 32, color: "#f59e0b" }} />
        ),
        title: "KYC Not Submitted",
        color: "#f59e0b",
        borderColor: "rgba(245,158,11,0.3)",
        bg: "rgba(245,158,11,0.08)",
        msg: "Please upload your KYC documents to activate your account.",
      },
      submitted: {
        icon: <Clock style={{ width: 32, height: 32, color: "#60a5fa" }} />,
        title: "Documents Under Review",
        color: "#60a5fa",
        borderColor: "rgba(96,165,250,0.3)",
        bg: "rgba(96,165,250,0.08)",
        msg: "Your documents are being reviewed (24–48 hours).",
      },
      under_review: {
        icon: <Clock style={{ width: 32, height: 32, color: "#c084fc" }} />,
        title: "KYC Under Review",
        color: "#c084fc",
        borderColor: "rgba(192,132,252,0.3)",
        bg: "rgba(192,132,252,0.08)",
        msg: "Admin is reviewing your documents. You'll be notified by email.",
      },
      approved: {
        icon: (
          <CheckCircle style={{ width: 32, height: 32, color: "#4ade80" }} />
        ),
        title: "KYC Approved",
        color: "#4ade80",
        borderColor: "rgba(74,222,128,0.3)",
        bg: "rgba(74,222,128,0.08)",
        msg: "Your KYC is approved! Welcome aboard.",
      },
      rejected: {
        icon: <XCircle style={{ width: 32, height: 32, color: "#f87171" }} />,
        title: "KYC Rejected",
        color: "#f87171",
        borderColor: "rgba(248,113,113,0.3)",
        bg: "rgba(248,113,113,0.08)",
        msg: "Your KYC was rejected. Please re-upload corrected documents.",
      },
    };
    const c = cfg[kyc.status];
    return (
      <div style={s.page}>
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <div style={{ ...s.card, border: `1px solid ${c.borderColor}` }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: c.bg,
                  border: `1px solid ${c.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                {c.icon}
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: c.color,
                  margin: "0 0 0.25rem",
                }}
              >
                {c.title}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
                {kyc.agencyName}
              </p>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                textAlign: "center",
                background: "#0f172a",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                color: "#94a3b8",
                marginBottom: "1.25rem",
              }}
            >
              {c.msg}
            </p>
            {kyc.status === "rejected" && kyc.rejectionReason && (
              <div
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  marginBottom: "1.25rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#f87171",
                    marginBottom: "0.25rem",
                  }}
                >
                  Rejection Reason:
                </p>
                <p style={{ fontSize: "0.875rem", color: "#fca5a5" }}>
                  {kyc.rejectionReason}
                </p>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              {(kyc.status === "pending" || kyc.status === "rejected") && (
                <Link
                  href="/b2b/kyc"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    background: "#2563eb",
                    color: "white",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Upload style={{ width: 16, height: 16 }} />
                  {kyc.status === "rejected"
                    ? "Re-upload KYC Documents"
                    : "Upload KYC Documents"}
                </Link>
              )}
              {(kyc.status === "submitted" ||
                kyc.status === "under_review") && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#60a5fa",
                    fontSize: "0.875rem",
                    padding: "0.75rem",
                  }}
                >
                  ⏳ Please wait for admin review
                </div>
              )}
              {kyc.status === "approved" && (
                <Link
                  href="/b2b/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    background: "#16a34a",
                    color: "white",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <CheckCircle style={{ width: 16, height: 16 }} /> Go to
                  Dashboard
                </Link>
              )}
              <button
                onClick={() =>
                  setKyc({
                    visible: false,
                    status: "pending",
                    agencyName: "",
                    contactPerson: "",
                  })
                }
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  color: "#94a3b8",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.875rem",
              color: "#475569",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Home
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              background: "linear-gradient(135deg, #3b82f6, #4f46e5)",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plane style={{ width: 20, height: 20, color: "white" }} />
          </div>
          <div>
            <h1
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "white",
                margin: 0,
              }}
            >
              Tramps Aviation B2B
            </h1>
            <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0 }}>
              Agent Portal
            </p>
          </div>
        </div>
        <div style={s.card}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "white",
              margin: "0 0 0.25rem",
            }}
          >
            Sign in
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              margin: "0 0 1.5rem",
            }}
          >
            Access your agent dashboard
          </p>
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label style={s.label}>Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="agent@agency.com"
                style={s.input}
              />
            </div>
            <div>
              <label style={s.label}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  style={{ ...s.input, paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#475569",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {showPwd ? (
                    <EyeOff style={{ width: 16, height: 16 }} />
                  ) : (
                    <Eye style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...s.btn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    style={{
                      width: 16,
                      height: 16,
                      animation: "spin 1s linear infinite",
                    }}
                  />{" "}
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid #1a2840",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Don't have an account?{" "}
              <Link
                href="/b2b/register"
                style={{
                  color: "#60a5fa",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Register Agency
              </Link>
            </p>
            <p style={{ fontSize: "0.75rem" }}>
              <Link
                href="/b2b/forgot-password"
                style={{ color: "#475569", textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
