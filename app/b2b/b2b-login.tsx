"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plane, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authApi, extractToken, extractAgent } from "@/lib/api/services";
import { toast } from "sonner";

function detectIdentifierType(value: string): string {
  if (value.includes("@")) return "Email";
  if (/^TAHP\d+$/i.test(value.trim())) return "Agent ID";
  if (/^\d{10}$/.test(value.replace(/\D/g, ""))) return "Phone";
  return "Agent ID / Phone";
}

export default function B2BLoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState("Agent ID / Phone");

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === "agent") {
      const kycApproved =
        user?.kycStatus === "approved" || user?.status === "active";
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
      setAuth(
        {
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
        } as any,
        token,
      );
      if (kycStatus === "approved" || agent.status === "active") {
        toast.success(`Welcome back, ${agent.agencyName}!`);
        router.push("/b2b/dashboard");
        return;
      }
      toast.info("Please complete your KYC to activate your account.");
      router.push("/b2b/kyc");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "";
      if (msg.toLowerCase().includes("suspend"))
        toast.error("Account suspended. Contact support.");
      else if (msg.toLowerCase().includes("inactive"))
        toast.error("Account inactive. Contact support.");
      else toast.error(msg || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl overflow-hidden bg-white border border-border flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="Tramps Aviation"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground leading-none">
              Tramps Aviation B2B
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Agent Portal</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Agent Sign In
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Use Agent ID (TAHP00001) or Phone number
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                {identifierType}
                {identifier && identifierType !== "Agent ID / Phone" && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 normal-case font-medium">
                    ✓ {identifierType} detected
                  </span>
                )}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                placeholder="e.g. TAHP00001 / 9876543210"
                className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              <div className="flex gap-1.5 flex-wrap mt-2"></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
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
              className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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

          <div className="mt-5 pt-5 border-t border-border text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/b2b/register"
                className="text-primary font-semibold hover:underline"
              >
                Register Agency
              </Link>
            </p>
            <p className="text-xs">
              <Link
                href="/b2b/forgot-password"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
