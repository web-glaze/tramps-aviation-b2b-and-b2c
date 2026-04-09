"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { agentApi, authApi, unwrap } from "@/lib/api/services";
import { User, Shield, Save, Loader2, KeyRound, Building2, Phone, Mail, MapPin, Eye, EyeOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry"];

type Tab = "profile" | "security";

export default function B2BProfilePage() {
  const { token, user, setAuth } = useAuthStore();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ contactPerson: "", alternatePhone: "", city: "", state: "", pincode: "", address: "" });
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [changingPwd, setChangingPwd] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => { loadProfile() }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await agentApi.getProfile();
      const d = unwrap(res) as any;
      const p = d?.agent || d;
      setProfile(p);
      setForm({
        contactPerson: p.contactPerson || "",
        alternatePhone: p.alternatePhone || "",
        city: p.city || "",
        state: p.state || "",
        pincode: p.pincode || "",
        address: p.address || "",
      });
    } catch { /* use user from store */ }
    finally { setLoading(false) }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await agentApi.updateProfile(form);
      const d = unwrap(res) as any;
      const updated = d?.agent || d;
      setProfile(updated);
      if (user) setAuth({ ...user, ...form }, token!);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false) }
  };

  const handlePasswordChange = async () => {
    if (pwd.newPwd.length < 8) return toast.error("New password must be at least 8 characters");
    if (pwd.newPwd !== pwd.confirm) return toast.error("Passwords don't match");
    if (!pwd.current) return toast.error("Enter current password");
    if (pwd.current === pwd.newPwd) return toast.error("New password must be different from current password");
    setChangingPwd(true);
    try {
      await authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success("Password changed successfully");
      setPwd({ current: "", newPwd: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to change password");
    } finally { setChangingPwd(false) }
  };

  const copyAgentId = () => {
    const id = data.agentId;
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success(`Agent ID ${id} copied!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const data = profile || user || {};

  const inp = "w-full h-11 px-4 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-all placeholder:text-muted-foreground";
  const lbl = "text-sm font-semibold block mb-1.5";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details</p>
      </div>

      {/* Agent ID Card — shown prominently at top */}
      {data.agentId && (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">
                Your Agent ID
              </p>
              <p className="text-3xl font-black font-mono text-primary tracking-wider">
                {data.agentId}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Login with this ID · Share with admin · Use for B2B bookings
              </p>
            </div>
            <button
              onClick={copyAgentId}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                copiedId
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {copiedId ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy ID</>}
            </button>
          </div>
          {/* decorative circles */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 pointer-events-none" />
          <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-primary/5 pointer-events-none" />
        </div>
      )}

      {/* Agency Info Card */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-2xl flex-shrink-0">
          {(data.agencyName || data.name || 'A')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg font-display">{data.agencyName || '—'}</p>
          <p className="text-sm text-muted-foreground">{data.email}</p>
          <div className="flex gap-2 mt-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
              data.kycStatus === 'approved' ? "bg-emerald-500/10 text-emerald-600" :
              data.kycStatus === 'submitted' ? "bg-primary/10 text-primary" :
              data.kycStatus === 'rejected' ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>
              KYC {data.kycStatus || 'pending'}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
              data.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
              {data.status || 'inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-fit">
        {([{ key: "profile", label: "Profile", icon: User }, { key: "security", label: "Security", icon: Shield }] as any[]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key as Tab)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <>
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                <div>
                  <label className={lbl}>Agency Name</label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    {data.agencyName || '—'}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Agent ID</label>
                  <div
                    onClick={copyAgentId}
                    className="flex items-center justify-between h-11 px-4 rounded-xl border border-primary/30 bg-primary/5 text-sm font-mono font-bold text-primary cursor-pointer hover:bg-primary/10 transition-all"
                  >
                    <span>{data.agentId || 'Not assigned'}</span>
                    {data.agentId && (
                      copiedId
                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                        : <Copy className="h-3.5 w-3.5 opacity-50" />
                    )}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Business Email</label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    {data.email || '—'}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Primary Phone</label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    {data.phone || '—'}
                  </div>
                </div>
                <div>
                  <label className={lbl}>GST Number</label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground font-mono">
                    {data.gstNumber || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className={lbl}>PAN Number</label>
                  <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground font-mono">
                    {data.panNumber || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Editable Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Contact Person</label>
                  <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Your name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Alternate Phone</label>
                  <input value={form.alternatePhone} onChange={e => setForm(f => ({ ...f, alternatePhone: e.target.value.replace(/\D/g,'').slice(0,10) }))} placeholder="Optional" inputMode="numeric" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g,'').slice(0,6) }))} placeholder="400001" inputMode="numeric" className={inp} />
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" className={inp} />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={cn(inp, "cursor-pointer")}>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Full Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop 12, ABC Building, Street..." className={inp} />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
              </button>
            </>
          )}
        </div>
      )}

      {tab === "security" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">Change Password</h3>
          {[
            { key: "current", label: "Current Password", show: showPwd.current, toggle: () => setShowPwd(s => ({ ...s, current: !s.current })) },
            { key: "newPwd",  label: "New Password",     show: showPwd.new,     toggle: () => setShowPwd(s => ({ ...s, new: !s.new })) },
            { key: "confirm", label: "Confirm New Password", show: showPwd.confirm, toggle: () => setShowPwd(s => ({ ...s, confirm: !s.confirm })) },
          ].map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className={lbl}>{label}</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={(pwd as any)[key]}
                  onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={key === "current" ? "Current password" : "Min 8 characters"}
                  className={cn(inp, "pr-10")} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          {pwd.confirm && pwd.newPwd !== pwd.confirm && (
            <p className="text-xs text-red-500">❌ Passwords don&apos;t match</p>
          )}
          <button onClick={handlePasswordChange} disabled={changingPwd || !pwd.current || !pwd.newPwd || pwd.newPwd !== pwd.confirm}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-all">
            {changingPwd ? <><Loader2 className="h-4 w-4 animate-spin" /> Changing...</> : <><KeyRound className="h-4 w-4" /> Change Password</>}
          </button>
        </div>
      )}
    </div>
  );
}