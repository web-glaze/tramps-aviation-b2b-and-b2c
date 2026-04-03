'use client'
import { useState, useEffect } from 'react'
import { agentApi, unwrap } from '@/lib/api/services'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable, Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Clock, CheckCircle, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function CommissionPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await agentApi.getCommissions()
      const d = unwrap(res) as any
      setData(d?.report || d?.commissions ? d : d)
    } catch { toast.error('Failed to load commissions') }
    finally { setLoading(false) }
  }

  const commissions = data?.commissions || []
  const totalCommission = commissions.reduce((s: number, c: any) => s + (c.agentCommission || 0), 0)
  const released = commissions.filter((c: any) => c.status === 'released').reduce((s: number, c: any) => s + (c.agentCommission || 0), 0)
  const pending = commissions.filter((c: any) => c.status === 'pending').reduce((s: number, c: any) => s + (c.agentCommission || 0), 0)

  const columns: Column<any>[] = [
    { key: 'commissionId', label: 'Commission ID', render: r => <span className="font-mono text-xs text-primary">{r.commissionId || r._id?.slice(-8)}</span> },
    { key: 'bookingRef', label: 'Booking', render: r => <span className="text-sm">{r.bookingId?.bookingRef || r.bookingRef || '—'}</span> },
    { key: 'agentCommission', label: 'Commission', render: r => <span className="font-semibold text-emerald-500">₹{(r.agentCommission || 0).toLocaleString()}</span> },
    { key: 'platformCommission', label: 'Platform', render: r => <span className="text-sm">₹{(r.platformCommission || 0).toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'createdAt', label: 'Date', render: r => <span className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Commission" subtitle="Your earnings and commission history" />
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-1.5">
          <RefreshCcw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Earned" value={`₹${totalCommission.toLocaleString()}`} icon={DollarSign} iconColor="text-emerald-500" iconBg="bg-emerald-500/10" isLoading={loading} />
        <StatCard title="Released" value={`₹${released.toLocaleString()}`} icon={CheckCircle} iconColor="text-blue-500" iconBg="bg-blue-500/10" isLoading={loading} />
        <StatCard title="Pending" value={`₹${pending.toLocaleString()}`} icon={Clock} iconColor="text-amber-500" iconBg="bg-amber-500/10" isLoading={loading} />
      </div>

      <DataTable columns={columns} data={commissions} isLoading={loading} total={commissions.length} searchPlaceholder="Search commissions..." onSearch={() => {}} />
    </div>
  )
}
