'use client'
/**
 * /b2b/flights — Redirects to the common /flights page.
 * The common page already handles:
 *   - Agent (role==='agent') → shows agent mode banner, books via agentApi (wallet)
 *   - Customer → BookingDialog (card/UPI)
 *   - Guest → BookingRoleModal (choose B2C or B2B)
 *
 * B2B sidebar links should point here; users will land on /flights seamlessly.
 */
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { RefreshCcw } from 'lucide-react'

function B2BFlightsRedirect() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    // Forward all query params to common page
    const origin      = params.get('origin')      || params.get('from') || ''
    const destination = params.get('destination') || params.get('to')   || ''
    const date        = params.get('date')         || ''
    const adults      = params.get('adults')       || '1'
    const tripType    = params.get('tripType')     || ''

    const qs = new URLSearchParams()
    if (origin)      qs.set('from',     origin)
    if (destination) qs.set('to',       destination)
    if (date)        qs.set('date',     date)
    if (adults)      qs.set('adults',   adults)
    if (tripType)    qs.set('tripType', tripType)

    router.replace(`/flights${qs.toString() ? '?' + qs.toString() : ''}`)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function B2BFlightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <B2BFlightsRedirect />
    </Suspense>
  )
}
