'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'agent' | 'customer'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, token, role } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token || !user) {
      // Redirect to correct login based on required role
      if (requiredRole === 'agent') router.push('/b2b/login')
      else router.push('/b2c/login')
      return
    }
    if (requiredRole && role !== requiredRole) {
      if (role === 'agent') router.push('/b2b/dashboard')
      else router.push('/b2c/flights')
    }
  }, [token, user, role, requiredRole])

  if (!token || !user) return null
  if (requiredRole && role !== requiredRole) return null

  return <>{children}</>
}