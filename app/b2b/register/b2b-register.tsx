"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Plane,
  Loader2,
  Info,
  MapPin,
  Lock,
  User,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { authApi, extractToken, extractAgent } from "@/lib/api/services";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
];

type Step = "form" | "success";

export default function B2BRegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<Step>("form");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [form, setForm] = useState({
    agencyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    gstNumber: "",
    panNumber: "",
  });

  const u = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords don't match");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (form.phone.replace(/\D/g, "").length < 10)
      return toast.error("Enter valid 10-digit mobile number");

    // FIX: Validate GST format if provided
    if (form.gstNumber.trim()) {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(form.gstNumber.toUpperCase().trim())) {
        return toast.error(
          "Invalid GST number format. Example: 22AAAAA0000A1Z5",
        );
      }
    }

    setLoading(true);
    try {
      const res = await authApi.registerAgent({
        agencyName: form.agencyName.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.startsWith("+91") ? form.phone : `+91${form.phone.replace(/\D/g, "")}`,
        alternatePhone: form.alternatePhone ? `+91${form.alternatePhone.replace(/\D/g, "")}` : undefined,
        password: form.password,
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode || undefined,
        address: form.address || undefined,
        gstNumber: form.gstNumber.trim() ? form.gstNumber.toUpperCase().trim() : undefined,
        panNumber: form.panNumber.trim() ? form.panNumber.toUpperCase().trim() : undefined,
      });

      const agentToken = extractToken(res);
      const agentData = extractAgent(res);

      if (!agentToken) throw new Error("Registration succeeded but no token returned. Please login manually.");

      localStorage.setItem("auth_token", agentToken);
      localStorage.setItem("agent_token", agentToken);
      document.cookie = `auth_token=${agentToken}; path=/; max-age=86400; SameSite=Lax`;

      setAuth({
        id: agentData.id || agentData._id,
        name: agentData.contactPerson || agentData.agencyName,
        email: agentData.email,
        role: "agent",
        kycStatus: agentData.kycStatus || "pending",
        status: agentData.status || "inactive",
        agencyName: agentData.agencyName,
        walletBalance: 0,
      } as any, agentToken);

      setRegisteredEmail(form.email);
      toast.success("Account created! Redirecting to KYC...");
      setTimeout(() => { router.push("/b2b/kyc"); }, 1500);
    } catch (err: any) {
      // FIX: Parse specific duplicate field errors from backend prefix codes
      const msg = err.message || "";
      if (msg.includes("gst_duplicate")) {
        toast.error(
          "This GST number is already registered with another account. Please check and try again.",
          { duration: 6000 },
        );
      } else if (msg.includes("pan_duplicate")) {
        toast.error(
          "This PAN number is already registered with another account.",
          { duration: 6000 },
        );
      } else if (
        msg.includes("email_duplicate") ||
        (msg.toLowerCase().includes("email") &&
          msg.toLowerCase().includes("registered"))
      ) {
        toast.error("This email is already registered. Please login instead.", {
          duration: 6000,
        });
      } else if (
        msg.includes("phone_duplicate") ||
        (msg.toLowerCase().includes("phone") &&
          msg.toLowerCase().includes("registered"))
      ) {
        toast.error(
          "This phone number is already registered with another account.",
          { duration: 6000 },
        );
      } else if (msg.includes("duplicate::")) {
        // Generic duplicate with field name
        const fieldMsg =
          msg.split("duplicate::")[1] || "This value is already registered.";
        toast.error(fieldMsg, { duration: 6000 });
      } else {
        toast.error(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600";
  const lbl = "text-xs text-slate-400 font-medium block mb-1.5";

  if (step === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#060b14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem", textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <CheckCircle style={{ width: 40, height: 40, color: "#4ade80" }} />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "white",
              marginBottom: "0.5rem",
            }}
          >
            Registration Successful!
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: "0.25rem",
            }}
          >
            {registeredEmail}
          </p>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            Your agency account has been created. Complete KYC to start booking.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
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
                padding: "0.875rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Upload KYC Documents →
            </Link>
            <Link
              href="/b2b/login"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                background: "#0f172a",
                border: "1px solid #1e293b",
                color: "#94a3b8",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Go to Login
            </Link>
          </div>
          <div
            style={{
              marginTop: "2rem",
              padding: "1.25rem",
              background: "#0a1020",
              border: "1px solid #1a2840",
              borderRadius: "0.75rem",
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "white",
                marginBottom: "0.75rem",
              }}
            >
              Next Steps:
            </p>
            {[
              {
                n: 1,
                text: "Upload KYC documents (PAN, GST, Trade License)",
                done: false,
              },
              {
                n: 2,
                text: "Wait for admin approval (24–48 hrs)",
                done: false,
              },
              { n: 3, text: "Start booking flights & hotels!", done: false },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    color: "#475569",
                  }}
                >
                  {s.n}
                </div>
                <span style={{ color: "#64748b" }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b14",
        padding: "2.5rem 1rem",
      }}
    >
      <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            href="/b2b/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.875rem",
              color: "#475569",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Already registered?
            Login
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
              Register your travel agency
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#0a1020",
            border: "1px solid #1a2840",
            borderRadius: "1rem",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "white",
                margin: "0 0 0.25rem",
              }}
            >
              Create Agency Account
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
              All fields marked * are required
            </p>
          </div>

          {/* Agency Info */}
          <section>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#60a5fa",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User style={{ width: 16, height: 16 }} /> Agency Information
            </h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label className={lbl}>Agency / Company Name *</label>
                <input
                  value={form.agencyName}
                  onChange={(e) => u("agencyName", e.target.value)}
                  required
                  placeholder="Sunshine Travel Agency"
                  className={inp}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label className={lbl}>Contact Person *</label>
                  <input
                    value={form.contactPerson}
                    onChange={(e) => u("contactPerson", e.target.value)}
                    required
                    placeholder="Rahul Sharma"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Business Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => u("email", e.target.value)}
                    required
                    placeholder="contact@agency.com"
                    className={inp}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label className={lbl}>Mobile Number *</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "0.75rem",
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        flexShrink: 0,
                      }}
                    >
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
                      placeholder="9876543210"
                      inputMode="numeric"
                      style={{
                        flex: 1,
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        color: "white",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Alternate Number</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "0.75rem",
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        flexShrink: 0,
                      }}
                    >
                      +91
                    </span>
                    <input
                      value={form.alternatePhone}
                      onChange={(e) =>
                        u(
                          "alternatePhone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="Optional"
                      inputMode="numeric"
                      style={{
                        flex: 1,
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        color: "white",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Address */}
          <section>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#60a5fa",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <MapPin style={{ width: 16, height: 16 }} /> Business Address
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label className={lbl}>City *</label>
                <input
                  value={form.city}
                  onChange={(e) => u("city", e.target.value)}
                  required
                  placeholder="Mumbai"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>State *</label>
                <select
                  value={form.state}
                  onChange={(e) => u("state", e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                    color: form.state ? "white" : "#475569",
                    outline: "none",
                  }}
                >
                  <option value="" style={{ background: "#0a1020" }}>
                    Select State
                  </option>
                  {STATES.map((s) => (
                    <option
                      key={s}
                      value={s}
                      style={{ background: "#0a1020", color: "white" }}
                    >
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Pincode</label>
                <input
                  value={form.pincode}
                  onChange={(e) =>
                    u("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="400001"
                  inputMode="numeric"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Full Address</label>
                <input
                  value={form.address}
                  onChange={(e) => u("address", e.target.value)}
                  placeholder="Shop 12, ABC Building"
                  className={inp}
                />
              </div>
            </div>
          </section>

          {/* Business Docs */}
          <section>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#60a5fa",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Building2 style={{ width: 16, height: 16 }} /> Business Details
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "#f59e0b",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                marginBottom: "1rem",
              }}
            >
              <Info style={{ width: 12, height: 12, flexShrink: 0 }} />
              Optional — leave blank if you don't have GST/PAN yet. Upload
              actual documents in KYC section after registration.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label className={lbl}>GST Number</label>
                <input
                  value={form.gstNumber}
                  onChange={(e) => u("gstNumber", e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5 (optional)"
                  maxLength={15}
                  className={inp}
                  style={{
                    borderColor:
                      form.gstNumber &&
                      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                        form.gstNumber,
                      )
                        ? "#f59e0b"
                        : "",
                  }}
                />
                {form.gstNumber &&
                  !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
                    form.gstNumber,
                  ) && (
                    <p
                      style={{
                        color: "#f59e0b",
                        fontSize: "0.7rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ⚠ Format: 22AAAAA0000A1Z5
                    </p>
                  )}
              </div>
              <div>
                <label className={lbl}>PAN Number</label>
                <input
                  value={form.panNumber}
                  onChange={(e) => u("panNumber", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F (optional)"
                  maxLength={10}
                  className={inp}
                />
              </div>
            </div>
          </section>

          {/* Password */}
          <section>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#60a5fa",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Lock style={{ width: 16, height: 16 }} /> Account Password
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label className={lbl}>Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => u("password", e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    style={{
                      width: "100%",
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 2.5rem 0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "white",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
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
                {form.password && form.password.length < 8 && (
                  <p
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    ⚠ Min 8 characters
                  </p>
                )}
              </div>
              <div>
                <label className={lbl}>Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => u("confirmPassword", e.target.value)}
                  required
                  placeholder="Re-enter password"
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: `1px solid ${form.confirmPassword && form.confirmPassword !== form.password ? "#ef4444" : "#1e293b"}`,
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontSize: "0.875rem",
                    color: "white",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {form.confirmPassword &&
                  form.confirmPassword !== form.password && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ❌ Passwords don't match
                    </p>
                  )}
                {form.confirmPassword &&
                  form.confirmPassword === form.password &&
                  form.password.length >= 8 && (
                    <p
                      style={{
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      ✅ Passwords match
                    </p>
                  )}
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#1d4ed8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.875rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.2s",
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
                Creating Account...
              </>
            ) : (
              "Create Agency Account →"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#475569",
            marginTop: "1.5rem",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/b2b/login"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign in here
          </Link>
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
