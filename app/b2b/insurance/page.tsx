'use client'
/**
 * /b2b/insurance — Redirects to common /insurance page.
 */
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { RefreshCcw } from 'lucide-react'

function B2BInsuranceRedirect() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const planId = params.get('planId') || ''
    const qs = new URLSearchParams()
    if (planId) qs.set('planId', planId)
    router.replace(`/insurance${qs.toString() ? '?' + qs.toString() : ''}`)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function B2BInsurancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <B2BInsuranceRedirect />
    </Suspense>
  )
}
