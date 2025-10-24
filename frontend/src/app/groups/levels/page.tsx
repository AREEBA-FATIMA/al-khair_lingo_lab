'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function GroupsLevelsRedirect() {
  const { isLoggedIn, loading: authLoading } = useAuth()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    // If authenticated, redirect to groups page
    if (!authLoading && isLoggedIn) {
      window.location.href = '/groups'
    }
  }, [isLoggedIn, authLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#00bfe6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
