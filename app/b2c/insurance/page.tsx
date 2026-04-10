'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { RefreshCcw } from 'lucide-react'

function B2CInsuranceRedirect() {
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

export default function B2CInsurancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <B2CInsuranceRedirect />
    </Suspense>
  )
}
