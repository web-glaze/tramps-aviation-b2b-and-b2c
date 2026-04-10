'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { RefreshCcw } from 'lucide-react'

function B2CHotelsRedirect() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const qs = new URLSearchParams()
    const city     = params.get('city')     || ''
    const checkIn  = params.get('checkIn')  || ''
    const checkOut = params.get('checkOut') || ''
    const rooms    = params.get('rooms')    || '1'
    if (city)     qs.set('city',     city)
    if (checkIn)  qs.set('checkIn',  checkIn)
    if (checkOut) qs.set('checkOut', checkOut)
    if (rooms)    qs.set('rooms',    rooms)
    router.replace(`/hotels${qs.toString() ? '?' + qs.toString() : ''}`)
  }, [])
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function B2CHotelsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <B2CHotelsRedirect />
    </Suspense>
  )
}
