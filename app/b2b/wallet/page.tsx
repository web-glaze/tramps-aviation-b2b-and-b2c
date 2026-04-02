'use client'
import { useEffect, useState } from 'react'
import { agentApi } from '@/lib/api/services'
import { cn } from '@/lib/utils'
import { Wallet, ArrowUpRight, ArrowDownRight, DollarSign, RefreshCw, Loader2, Clock } from 'lucide-react'

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0)
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => { loadBalance() }, [])
  useEffect(() => { loadTxns() }, [filter, page])

  const loadBalance = async () => {
    try {
      const res = await agentApi.getWallet()
      const d = res.data as any
      // Backend GET /agents/wallet/balance returns { balance: number, currency: 'INR' }
      setBalance(typeof d === 'number' ? d : d?.balance ?? d?.walletBalance ?? 0)
    } catch { setBalance(0) }
  }

  const loadTxns = async () => {
    setTxLoading(true)
    try {
      const params: any = { page, limit: 15 }
      if (filter !== 'all') params.category = filter
      const res = await agentApi.getWalletTransactions(params)
      const d = res.data as any
      setTxns(Array.isArray(d?.transactions) ? d.transactions : Array.isArray(d?.data) ? d.data : [])
      setTotal(d?.pagination?.total ?? d?.total ?? 0)
    } catch { setTxns([]) }
    finally { setTxLoading(false); setLoading(false) }
  }

  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'topup', label: 'Top-ups' },
    { key: 'booking_debit', label: 'Bookings' },
    { key: 'refund', label: 'Refunds' },
    { key: 'commission', label: 'Commission' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your travel wallet balance</p>
        </div>
        <button onClick={() => { loadBalance(); loadTxns() }} className="h-9 w-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-primary-foreground/70">Available Balance</p>
            <p className="text-3xl font-bold font-display">{loading ? '—' : fmtINR(balance)}</p>
          </div>
        </div>
        <p className="text-xs text-primary-foreground/60">Contact admin to add funds to your wallet</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1) }}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold font-display">Transactions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{total} total transactions</p>
        </div>
        <div className="divide-y divide-border">
          {txLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-muted animate-pulse rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-5 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))
          ) : txns.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
              No transactions found
            </div>
          ) : txns.map((t: any, i) => {
            const isCredit = t.type === 'CREDIT' || t.type === 'credit'
            return (
              <div key={t._id || i} className="px-5 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  isCredit ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                  {isCredit
                    ? <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                    : <ArrowDownRight className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description || t.category || (isCredit ? 'Credit' : 'Debit')}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </p>
                    {t.transactionRef && <span className="text-xs text-muted-foreground font-mono">· {t.transactionRef}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn('text-sm font-bold', isCredit ? 'text-emerald-500' : 'text-red-500')}>
                    {isCredit ? '+' : '-'}{fmtINR(t.amount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Bal: {fmtINR(t.balanceAfter || 0)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {((page-1)*15)+1}–{Math.min(page*15, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted transition-colors">
                ← Prev
              </button>
              <button onClick={() => setPage(p => p+1)} disabled={page * 15 >= total}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-50 hover:bg-muted transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
