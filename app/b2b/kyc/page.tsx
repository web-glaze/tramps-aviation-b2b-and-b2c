// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { agentApi } from '@/lib/api/services'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  FileCheck, CheckCircle, Clock, XCircle, Loader2, BadgeCheck,
  CreditCard, FileText, RefreshCw, Building2, Shield, AlertTriangle,
  ChevronRight, Upload, Info
} from 'lucide-react'

const KYC_STATUS_CONFIG: Record<string, {
  label: string; icon: any; color: string; bg: string; border: string; desc: string
}> = {
  pending_kyc:   { label: 'Not Submitted', icon: Clock,      color: 'text-muted-foreground', bg: 'bg-muted/50',         border: 'border-border',          desc: 'Submit your KYC documents to activate your agent account and start booking.' },
  kyc_submitted: { label: 'Under Review',  icon: Clock,      color: 'text-amber-600',        bg: 'bg-amber-500/10',     border: 'border-amber-500/20',    desc: 'Your documents are being reviewed. This usually takes 24-48 hours on business days.' },
  approved:      { label: 'KYC Approved',  icon: BadgeCheck, color: 'text-emerald-600',      bg: 'bg-emerald-500/10',   border: 'border-emerald-500/20',  desc: 'Your KYC is verified! You can now book flights and earn commissions.' },
  rejected:      { label: 'KYC Rejected',  icon: XCircle,    color: 'text-red-500',          bg: 'bg-red-500/10',       border: 'border-red-500/20',      desc: 'Your KYC was rejected. Please check the reason below and resubmit.' },
}

type KycTab = 'identity' | 'bank' | 'documents'

const TAB_CONFIG: { key: KycTab; label: string; icon: any; desc: string }[] = [
  { key: 'identity',  label: 'Identity',   icon: Shield,      desc: 'PAN, Aadhaar, GST' },
  { key: 'bank',      label: 'Bank',        icon: Building2,   desc: 'Bank account details' },
  { key: 'documents', label: 'Documents',   icon: FileText,    desc: 'Upload proof documents' },
]

export default function KycPage() {
  const [kycData, setKycData] = useState<any>(null)
  const [agentStatus, setAgentStatus] = useState<string>('pending_kyc')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<KycTab>('identity')
  const [form, setForm] = useState({
    panNumber: '', aadharNumber: '', gstNumber: '',
    bankName: '', accountNumber: '', ifscCode: '', accountHolder: '', accountType: 'savings',
    panDoc: '', aadharDoc: '', gstDoc: '', bankDoc: '',
  })

  useEffect(() => { loadKyc() }, [])

  const loadKyc = async () => {
    setLoading(true)
    try {
      const res = await agentApi.getKycStatus()
      const data = res.data as any
      // Backend /agents/kyc/status returns: { kycStatus, kycDocuments, agencyName, contactPerson }
      // OR /kyc/my returns the kyc document directly
      const kyc = data.kyc || data.data || data
      setKycData(kyc)
      // Normalize status — agents schema uses kycStatus, kyc schema uses status
      const status = data?.kycStatus || kyc?.status || data?.agentStatus || 'pending_kyc'
      setAgentStatus(status)
      if (kyc?.panNumber) {
        setForm(f => ({
          ...f,
          panNumber:     kyc.panNumber || '',
          aadharNumber:  kyc.aadharNumber || '',
          gstNumber:     kyc.gstNumber || '',
          bankName:      kyc.bankDetails?.bankName || '',
          accountNumber: kyc.bankDetails?.accountNumber || '',
          ifscCode:      kyc.bankDetails?.ifscCode || '',
          accountHolder: kyc.bankDetails?.accountHolder || '',
          accountType:   kyc.bankDetails?.accountType || 'savings',
        }))
      }
    } catch { setKycData(null) }
    finally { setLoading(false) }
  }

  const setF = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.panNumber) { toast.error('PAN number is required'); return }
    if (!form.aadharNumber) { toast.error('Aadhaar number is required'); return }
    if (form.panNumber.length !== 10) { toast.error('PAN must be exactly 10 characters'); return }
    if (form.aadharNumber.replace(/\s/g, '').length !== 12) { toast.error('Aadhaar must be 12 digits'); return }
    if (form.bankName && (!form.accountNumber || !form.ifscCode)) {
      toast.error('Account number and IFSC required with bank name'); return
    }
    if (form.ifscCode && form.ifscCode.length !== 11) { toast.error('IFSC must be 11 characters'); return }

    setSubmitting(true)
    try {
      await agentApi.submitKyc({
        panNumber: form.panNumber.toUpperCase().trim(),
        aadharNumber: form.aadharNumber.replace(/\s/g, ''),
        ...(form.gstNumber && { gstNumber: form.gstNumber.toUpperCase().trim() }),
        ...(form.bankName && {
          bankDetails: {
            bankName: form.bankName,
            accountNumber: form.accountNumber,
            ifscCode: form.ifscCode.toUpperCase(),
            accountHolder: form.accountHolder,
            accountType: form.accountType,
          }
        }),
        ...(form.panDoc && { panDoc: form.panDoc }),
        ...(form.aadharDoc && { aadharDoc: form.aadharDoc }),
        ...(form.gstDoc && { gstDoc: form.gstDoc }),
        ...(form.bankDoc && { bankDoc: form.bankDoc }),
      })
      toast.success('KYC submitted successfully! We will review within 24-48 hours.')
      loadKyc()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit KYC')
    } finally { setSubmitting(false) }
  }

  const statusConfig = KYC_STATUS_CONFIG[agentStatus] || KYC_STATUS_CONFIG.pending_kyc
  const StatusIcon = statusConfig.icon
  const canEdit = agentStatus === 'pending_kyc' || agentStatus === 'rejected'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">KYC Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your Know Your Customer verification to activate your account
          </p>
        </div>
        <button
          onClick={loadKyc}
          className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Status Card */}
      <div className={cn('p-5 rounded-2xl border', statusConfig.bg, statusConfig.border)}>
        <div className="flex items-start gap-4">
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0', statusConfig.bg, statusConfig.border, 'border')}>
            <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
          </div>
          <div className="flex-1">
            <p className={cn('font-bold text-base', statusConfig.color)}>{statusConfig.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{statusConfig.desc}</p>
            {kycData?.rejectionReason && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Rejection Reason
                </p>
                <p className="text-xs text-red-600 mt-1">{kycData.rejectionReason}</p>
              </div>
            )}
          </div>
          {agentStatus === 'approved' && (
            <BadgeCheck className="h-7 w-7 text-emerald-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-sm font-semibold mb-4">Verification Steps</p>
        <div className="space-y-3">
          {[
            { label: 'Submit KYC Documents', done: agentStatus !== 'pending_kyc' },
            { label: 'Admin Review',          done: agentStatus === 'approved' || agentStatus === 'rejected' },
            { label: 'Account Activated',     done: agentStatus === 'approved' },
          ].map(({ label, done }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
              )}>
                {done ? <CheckCircle className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              </div>
              <span className={cn('text-sm', done ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      {(canEdit || agentStatus === 'kyc_submitted') && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Tab navigation */}
          <div className="flex border-b border-border">
            {TAB_CONFIG.map(({ key, label, icon: Icon, desc }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-4 px-3 text-xs font-medium transition-all border-b-2',
                  activeTab === key
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* Identity Tab */}
            {activeTab === 'identity' && (
              <div className="space-y-4 animate-in">
                <FieldGroup
                  label="PAN Number"
                  required
                  hint="Format: AAAAA0000A (10 characters)"
                  disabled={!canEdit}
                  value={form.panNumber}
                  onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
                  placeholder="AAPFU0939F"
                  maxLength={10}
                />
                <FieldGroup
                  label="Aadhaar Number"
                  required
                  hint="12-digit Aadhaar number"
                  disabled={!canEdit}
                  value={form.aadharNumber}
                  onChange={setF('aadharNumber')}
                  placeholder="1234 5678 9012"
                  maxLength={12}
                  type="tel"
                />
                <FieldGroup
                  label="GST Number"
                  hint="Optional — 15-character GST registration number"
                  disabled={!canEdit}
                  value={form.gstNumber}
                  onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                  placeholder="27AAPFU0939F1ZV"
                  maxLength={15}
                />
              </div>
            )}

            {/* Bank Tab */}
            {activeTab === 'bank' && (
              <div className="space-y-4 animate-in">
                <div className="p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Bank details are required for commission payouts. Add IFSC and account number carefully.
                </div>
                <FieldGroup label="Bank Name" disabled={!canEdit} value={form.bankName} onChange={setF('bankName')} placeholder="State Bank of India" />
                <FieldGroup label="Account Holder Name" disabled={!canEdit} value={form.accountHolder} onChange={setF('accountHolder')} placeholder="Rajesh Kumar" />
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Account Number" disabled={!canEdit} value={form.accountNumber} onChange={setF('accountNumber')} placeholder="1234567890" type="tel" />
                  <FieldGroup
                    label="IFSC Code"
                    hint="11 characters"
                    disabled={!canEdit}
                    value={form.ifscCode}
                    onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Account Type</label>
                  <div className="field-wrapper !h-auto py-0">
                    <select
                      value={form.accountType}
                      onChange={setF('accountType')}
                      disabled={!canEdit}
                      className="flex-1 h-12 bg-transparent text-sm outline-none text-foreground disabled:opacity-60"
                    >
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4 animate-in">
                <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <Upload className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  In production, upload actual document images/PDFs. Currently enter document URLs or identifiers.
                </div>
                {[
                  { label: 'PAN Card', key: 'panDoc', required: true },
                  { label: 'Aadhaar Card', key: 'aadharDoc', required: true },
                  { label: 'GST Certificate', key: 'gstDoc', required: false },
                  { label: 'Bank Statement / Cancelled Cheque', key: 'bankDoc', required: false },
                ].map(({ label, key, required }) => (
                  <FieldGroup
                    key={key}
                    label={label}
                    required={required}
                    hint="Enter document URL or reference ID"
                    disabled={!canEdit}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="https://example.com/doc.pdf"
                  />
                ))}
              </div>
            )}

            {/* Submit */}
            {canEdit && (
              <div className="flex items-center gap-3 pt-2">
                {activeTab !== 'identity' && (
                  <button
                    onClick={() => setActiveTab(prev => prev === 'bank' ? 'identity' : 'bank')}
                    className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    ← Back
                  </button>
                )}
                {activeTab !== 'documents' ? (
                  <button
                    onClick={() => setActiveTab(prev => prev === 'identity' ? 'bank' : 'documents')}
                    className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><FileCheck className="h-4 w-4" /> Submit KYC</>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldGroup({
  label, required, hint, disabled, value, onChange, placeholder, maxLength, type = 'text'
}: {
  label: string; required?: boolean; hint?: string; disabled?: boolean
  value: string; onChange: any; placeholder?: string; maxLength?: number; type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className={cn('field-wrapper', disabled && 'opacity-60 cursor-not-allowed')}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        {value && !disabled && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
