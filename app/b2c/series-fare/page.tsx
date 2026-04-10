'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { RefreshCcw } from 'lucide-react'

function B2CSeriesFareRedirect() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const qs = new URLSearchParams()
    const from   = params.get('from')   || ''
    const to     = params.get('to')     || ''
    const date   = params.get('date')   || ''
    const adults = params.get('adults') || '1'
    if (from)   qs.set('from',   from)
    if (to)     qs.set('to',     to)
    if (date)   qs.set('date',   date)
    if (adults) qs.set('adults', adults)
    router.replace(`/series-fare${qs.toString() ? '?' + qs.toString() : ''}`)
  }, [])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function B2CSeriesFarePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <B2CSeriesFareRedirect />
    </Suspense>
  )
}
