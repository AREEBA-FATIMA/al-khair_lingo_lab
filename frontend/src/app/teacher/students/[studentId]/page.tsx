'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import { apiService } from '@/services/api'
import { ArrowLeft, Zap, BarChart3, Flame, Heart } from 'lucide-react'

export default function TeacherStudentDetailPage() {
  const params = useParams()
  const { studentId } = params
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getStudentProgress(Number(studentId))
        setSummary(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load student')
      } finally {
        setLoading(false)
      }
    }
    if (studentId) load()
  }, [studentId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation showBackButton backHref="/teacher" backLabel="Teacher" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6]">Student Detail</h1>
          <p className="text-gray-600">Overview of progress, streaks and activity</p>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-600 shadow-sm">Loading...</div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-red-600 shadow-sm">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-yellow-500" /><span className="text-sm text-gray-500">Total XP</span></div>
                <div className="text-2xl font-bold mt-2 text-gray-900">{summary?.total_xp ?? 0}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-green-600" /><span className="text-sm text-gray-500">Highest Level</span></div>
                <div className="text-2xl font-bold mt-2 text-gray-900">{summary?.highest_level ?? 0}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-orange-500" /><span className="text-sm text-gray-500">Streak</span></div>
                <div className="text-2xl font-bold mt-2 text-gray-900">{summary?.current_streak ?? 0}</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-red-500" /><span className="text-sm text-gray-500">Hearts</span></div>
                <div className="text-2xl font-bold mt-2 text-gray-900">{summary?.hearts ?? 0}</div>
              </div>
            </div>

            {/* Placeholder for recent activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Activity</h3>
              <p className="text-gray-600 text-sm">Coming soon: recent levels and quiz history.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


