"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload, CheckCircle, Clock, XCircle, AlertTriangle,
  Eye, RefreshCw, ArrowLeft, Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const DOC_TYPES = [
  { type: "pan",            label: "PAN Card",          required: true,  desc: "Business or owner PAN card (JPG/PNG/PDF)" },
  { type: "gst",            label: "GST Certificate",   required: true,  desc: "GST registration certificate" },
  { type: "aadhaar",        label: "Aadhaar Card",       required: false, desc: "Director/owner Aadhaar (front + back)" },
  { type: "trade_license",  label: "Trade License",      required: true,  desc: "Trade license or business registration" },
  { type: "bank_statement", label: "Bank Statement",     required: false, desc: "Last 3 months bank statement (PDF)" },
] as const;

type DocType = typeof DOC_TYPES[number]["type"];
type DocStatus = "not_uploaded" | "uploading" | "pending" | "approved" | "rejected";

interface Doc {
  type: DocType;
  status: DocStatus;
  url?: string;
  rejectionReason?: string;
}

const ss = {
  page: { minHeight: "100vh", background: "#060b14", padding: "2.5rem 1rem" } as React.CSSProperties,
  card: { background: "#0a1020", border: "1px solid #1a2840", borderRadius: "0.75rem", padding: "1rem" } as React.CSSProperties,
  btn: (color: string) => ({ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", border: "none", color: "white", background: color } as React.CSSProperties),
};

export default function B2BKycPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const fileRefs = useRef<Partial<Record<DocType, HTMLInputElement | null>>>({});

  const [kycStatus, setKycStatus] = useState<string>("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [docs, setDocs] = useState<Record<DocType, Doc>>(() => {
    const init = {} as Record<DocType, Doc>;
    DOC_TYPES.forEach((d) => { init[d.type] = { type: d.type, status: "not_uploaded" }; });
    return init;
  });
  const [uploading, setUploading] = useState<DocType | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    // FIX: Also check localStorage token as fallback (set during registration/login)
    const localToken = typeof window !== "undefined" ? localStorage.getItem("agent_token") : null;
    if (!isAuthenticated && !localToken) { router.push("/b2b/login"); return; }
    // FIX: Prevent double-fetch in React StrictMode / re-renders
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchStatus();
  }, [_hasHydrated, isAuthenticated]);

  const fetchStatus = useCallback(async () => {
    setPageLoading(true);
    // FIX: Fallback to localStorage token in case Zustand store hasn't hydrated yet
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("agent_token") : null);
    try {
      const res = await fetch(`${API}/agents/kyc/status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // FIX: Handle 404 gracefully — means agent hasn't uploaded KYC yet (new agent)
      if (res.status === 404) {
        setKycStatus("pending");
        setPageLoading(false);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKycStatus(data.kycStatus || data.data?.kycStatus || "pending");
      setRejectionReason(data.kycRejectionReason || data.data?.kycRejectionReason || "");
      const docList: any[] = data.kycDocuments || data.data?.kycDocuments || [];
      setDocs((prev) => {
        const updated = { ...prev };
        docList.forEach((d: any) => {
          updated[d.type as DocType] = {
            type: d.type, url: d.s3Url || d.url, rejectionReason: d.rejectionReason,
            status: d.status === "approved" ? "approved" : d.status === "rejected" ? "rejected" : "pending",
          };
        });
        return updated;
      });
    } catch { /* keep UI responsive */ }
    finally { setPageLoading(false); }
  }, [token]);

  const handleUpload = async (docType: DocType, file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { toast.error("Only JPG, PNG, WEBP or PDF allowed"); return; }

    // FIX: Fallback to localStorage token
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("agent_token") : null);

    setUploading(docType);
    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], status: "uploading" } }));
    const fd = new FormData();
    fd.append("document", file);
    fd.append("docType", docType);

    try {
      const res = await fetch(`${API}/agents/kyc/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      const label = DOC_TYPES.find((d) => d.type === docType)?.label;
      toast.success(`${label} uploaded!`);
      setDocs((prev) => ({ ...prev, [docType]: { type: docType, status: "pending", url: data.url || data.data?.url } }));
      if (data.kycStatus || data.data?.kycStatus) setKycStatus(data.kycStatus || data.data.kycStatus);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], status: "not_uploaded" } }));
    } finally { setUploading(null); }
  };

  const uploaded = Object.values(docs).filter((d) => d.status !== "not_uploaded").length;
  const requiredTotal = DOC_TYPES.filter((d) => d.required).length;
  const requiredDone = DOC_TYPES.filter((d) => d.required && docs[d.type]?.status !== "not_uploaded").length;
  const kycApproved = kycStatus === "approved";

  const bannerCfg: Record<string, { icon: React.ReactNode; text: string; borderColor: string; bg: string; color: string }> = {
    pending:      { icon: <AlertTriangle style={{ width: 16, height: 16 }} />, text: "Upload your documents to activate your account", borderColor: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.08)", color: "#f59e0b" },
    submitted:    { icon: <Clock style={{ width: 16, height: 16 }} />,         text: "Documents submitted — admin review in progress (24–48 hrs)", borderColor: "rgba(96,165,250,0.3)", bg: "rgba(96,165,250,0.08)", color: "#60a5fa" },
    under_review: { icon: <Clock style={{ width: 16, height: 16 }} />,         text: "Your KYC is currently under review", borderColor: "rgba(192,132,252,0.3)", bg: "rgba(192,132,252,0.08)", color: "#c084fc" },
    approved:     { icon: <CheckCircle style={{ width: 16, height: 16 }} />,   text: "✅ KYC Approved — your account is fully active!", borderColor: "rgba(74,222,128,0.3)", bg: "rgba(74,222,128,0.08)", color: "#4ade80" },
    rejected:     { icon: <XCircle style={{ width: 16, height: 16 }} />,       text: "KYC Rejected — please re-upload corrected documents", borderColor: "rgba(248,113,113,0.3)", bg: "rgba(248,113,113,0.08)", color: "#f87171" },
  };
  const banner = bannerCfg[kycStatus] || bannerCfg.pending;

  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#060b14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: 32, height: 32, color: "#60a5fa", margin: "0 auto 0.75rem", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading KYC status...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={ss.page}>
      <div style={{ maxWidth: "40rem", margin: "0 auto" }}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Link href="/b2b/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#475569", textDecoration: "none" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Dashboard
          </Link>
          <button onClick={fetchStatus} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#475569", background: "none", border: "none", cursor: "pointer" }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "0 0 0.25rem" }}>KYC Verification</h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>Upload your business documents to activate your account</p>
        </div>

        {/* Status Banner */}
        <div style={{ border: `1px solid ${banner.borderColor}`, background: banner.bg, borderRadius: "0.75rem", padding: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", color: banner.color }}>
          {banner.icon}
          <div>
            <p style={{ fontSize: "0.875rem", fontWeight: 500, margin: "0 0 0.25rem" }}>{banner.text}</p>
            {kycStatus === "rejected" && rejectionReason && (
              <p style={{ fontSize: "0.75rem", margin: 0, opacity: 0.8 }}>Admin note: {rejectionReason}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ ...ss.card, marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
            <span style={{ color: "white", fontWeight: 500 }}>Upload Progress</span>
            <span style={{ color: "#60a5fa" }}>{uploaded}/{DOC_TYPES.length} documents</span>
          </div>
          <div style={{ width: "100%", background: "#0f172a", borderRadius: "999px", height: 8 }}>
            <div style={{ background: "#2563eb", height: 8, borderRadius: "999px", width: `${(uploaded / DOC_TYPES.length) * 100}%`, transition: "width 0.5s" }} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.5rem 0 0" }}>{requiredDone}/{requiredTotal} required documents uploaded</p>
        </div>

        {/* Document Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {DOC_TYPES.map((doc) => {
            const d = docs[doc.type];
            const isUploading = uploading === doc.type;
            const isApproved = d?.status === "approved";
            const isRejected = d?.status === "rejected";
            const isPending = d?.status === "pending";

            const borderColor = isApproved ? "rgba(74,222,128,0.3)" : isRejected ? "rgba(248,113,113,0.3)" : isPending ? "rgba(96,165,250,0.2)" : "#1a2840";

            return (
              <div key={doc.type} style={{ ...ss.card, border: `1px solid ${borderColor}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "white" }}>{doc.label}</span>
                      {doc.required && <span style={{ fontSize: "0.7rem", color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "0.125rem 0.5rem", borderRadius: "999px" }}>Required</span>}
                      {isApproved && <span style={{ fontSize: "0.7rem", color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "0.125rem 0.5rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.25rem" }}><CheckCircle style={{ width: 10, height: 10 }} /> Approved</span>}
                      {isRejected && <span style={{ fontSize: "0.7rem", color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "0.125rem 0.5rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.25rem" }}><XCircle style={{ width: 10, height: 10 }} /> Rejected</span>}
                      {isPending  && <span style={{ fontSize: "0.7rem", color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "0.125rem 0.5rem", borderRadius: "999px", display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock style={{ width: 10, height: 10 }} /> Under Review</span>}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>{doc.desc}</p>
                    {isRejected && d?.rejectionReason && (
                      <p style={{ fontSize: "0.75rem", color: "#f87171", margin: "0.25rem 0 0" }}>❌ {d.rejectionReason}</p>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    {d?.url && (
                      <a href={d.url} target="_blank" rel="noreferrer"
                        style={{ padding: "0.5rem", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.5rem", color: "#64748b", display: "flex" }}>
                        <Eye style={{ width: 14, height: 14 }} />
                      </a>
                    )}

                    {!kycApproved && (
                      <button
                        onClick={() => fileRefs.current[doc.type]?.click()}
                        disabled={isUploading || isApproved}
                        style={ss.btn(
                          isApproved ? "rgba(74,222,128,0.15)" :
                          isUploading ? "#1a2840" :
                          isRejected || isPending ? "#b45309" :
                          "#2563eb"
                        )}>
                        {isUploading ? (
                          <><Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> Uploading...</>
                        ) : isApproved ? (
                          <><CheckCircle style={{ width: 12, height: 12, color: "#4ade80" }} /> <span style={{ color: "#4ade80" }}>Verified</span></>
                        ) : isRejected || isPending ? (
                          <><Upload style={{ width: 12, height: 12 }} /> Re-upload</>
                        ) : (
                          <><Upload style={{ width: 12, height: 12 }} /> Upload</>
                        )}
                      </button>
                    )}

                    <input
                      ref={(el) => { fileRefs.current[doc.type] = el; }}
                      type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
                      style={{ display: "none" }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(doc.type, f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        {kycApproved ? (
          <div style={{ marginTop: "1.5rem" }}>
            <Link href="/b2b/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", background: "#16a34a", color: "white", borderRadius: "0.75rem", padding: "0.875rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
              <CheckCircle style={{ width: 16, height: 16 }} /> Go to Dashboard
            </Link>
          </div>
        ) : requiredDone >= requiredTotal && kycStatus === "pending" ? (
          <div style={{ marginTop: "1.5rem", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: "0.75rem", padding: "1rem", fontSize: "0.875rem", color: "#60a5fa", textAlign: "center" }}>
            ✅ All required documents uploaded! Admin will review your KYC within 24–48 hours.
          </div>
        ) : null}

        {/* Help */}
        <div style={{ marginTop: "1.5rem", background: "#0a1020", border: "1px solid #1a2840", borderRadius: "0.75rem", padding: "1rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "white", margin: "0 0 0.375rem" }}>📋 Accepted formats:</p>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>JPG, PNG, WEBP, PDF &nbsp;•&nbsp; Max 10MB per file &nbsp;•&nbsp; Ensure documents are clear and not expired</p>
        </div>
      </div>
    </div>
  );
}
