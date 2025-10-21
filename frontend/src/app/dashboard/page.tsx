'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RoleBasedRedirect() {
  const { user, isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isLoggedIn && user) {
      switch (user.role) {
        case 'admin':
        case 'superuser':
          router.push('/analytics')
          break
        case 'doner':
          router.push('/analytics')
          break
        case 'teacher':
          router.push('/teachers/dashboard')
          break
        case 'student':
          router.push('/groups')
          break
        default:
          router.push('/')
      }
    }
  }, [user, isLoggedIn, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}
