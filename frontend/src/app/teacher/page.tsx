'use client'

import { useEffect, useMemo, useState } from 'react'
import Navigation from '@/components/Navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Zap, BarChart3, Star, Filter, ChevronRight, Flame, Heart } from 'lucide-react'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface StudentItem {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  email?: string
  class_name?: string
  campus_name?: string
}

interface StudentProgressSummary {
  total_xp: number
  highest_level: number
  completed_levels: number
  current_streak: number
  hearts: number
}

export default function TeacherDashboardPage() {
  const { isLoggedIn, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [progressById, setProgressById] = useState<Record<number, StudentProgressSummary>>({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [next, setNext] = useState<string | null>(null)
  const [prev, setPrev] = useState<string | null>(null)

  // Basic guard – in a real app we would check role === 'teacher'
  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login'
    }
  }, [isLoggedIn])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use teacher dashboard API instead of students API
        const dashboardData = await apiService.getTeacherDashboard()
        
        // Transform dashboard data to match expected format
        const studentProgress = dashboardData.student_progress || []
        const list: StudentItem[] = studentProgress.map((student: any) => ({
          id: student.student_id,
          username: student.name,
          first_name: student.name?.split(' ')[0] || '',
          last_name: student.name?.split(' ').slice(1).join(' ') || '',
          email: `${student.student_id}@student.edu`,
          class_name: `${student.grade} - ${student.section}`,
          campus_name: dashboardData.teacher_info?.campus || ''
        }))
        
        setStudents(list)
        setNext(null)
        setPrev(null)

        // Transform progress data
        const byId: Record<number, StudentProgressSummary> = {}
        for (const student of studentProgress) {
          byId[student.student_id] = {
            total_xp: student.total_xp || 0,
            highest_level: student.completed_levels || 0,
            completed_levels: student.completed_levels || 0,
            current_streak: student.current_streak || 0,
            hearts: 5 // Default hearts
          }
        }
        setProgressById(byId)
        
      } catch (e: any) {
        console.error('Teacher dashboard error:', e)
        setError(e?.message || 'Failed to load teacher dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, page])

  const kpis = useMemo(() => {
    if (!students.length) return { total: 0, avgXP: 0, avgCompletion: 0, active: 0 }
    const totals = students.reduce(
      (acc, s) => {
        const p = progressById[s.id]
        if (p) {
          acc.xp += p.total_xp
          acc.completed += p.completed_levels
          if (p.current_streak > 0) acc.active += 1
        }
        return acc
      },
      { xp: 0, completed: 0, active: 0 }
    )
    const avgXP = Math.round(totals.xp / students.length)
    const avgCompletion = Math.round((totals.completed / (students.length * 200)) * 100) // Updated to 200 levels
    return { total: students.length, avgXP, avgCompletion: isFinite(avgCompletion) ? avgCompletion : 0, active: totals.active }
  }, [students, progressById])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#03045e] to-[#00bfe6]">Teacher Dashboard</h1>
          <p className="text-gray-600">Monitor students’ progress and activity</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[#03045e]" />
              <span className="text-sm text-gray-500">Total Students</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{kpis.total}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">Avg XP</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{kpis.avgXP}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-500">Avg Completion</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{kpis.avgCompletion}%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500">Active Today</span>
            </div>
            <div className="text-2xl font-bold mt-2 text-gray-900">{kpis.active}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#00bfe6]"
              />
            </div>
            <button
              onClick={() => setPage(1)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#03045e] to-[#00bfe6] text-white font-semibold"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Class / Campus</th>
                  <th className="px-6 py-3">XP</th>
                  <th className="px-6 py-3">Levels</th>
                  <th className="px-6 py-3">Highest</th>
                  <th className="px-6 py-3">Streak</th>
                  <th className="px-6 py-3">Hearts</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      Loading students...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const p = progressById[s.id]
                    const name = s.first_name || s.last_name ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : (s.username || 'Student')
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="font-semibold text-gray-900">{name}</div>
                          <div className="text-gray-500 text-xs">{s.email}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-700">
                          {s.class_name || '—'}
                          <span className="text-gray-400">{s.campus_name ? ` • ${s.campus_name}` : ''}</span>
                        </td>
                        <td className="px-6 py-3 font-semibold text-gray-900">{p?.total_xp ?? '—'}</td>
                        <td className="px-6 py-3 text-gray-700">{p?.completed_levels ?? '—'}</td>
                        <td className="px-6 py-3 text-gray-700">{p?.highest_level ?? '—'}</td>
                        <td className="px-6 py-3 text-gray-700">{p?.current_streak ?? '—'}</td>
                        <td className="px-6 py-3">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`w-3 h-3 rounded-full ${i < (p?.hearts ?? 0) ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <a href={`/teacher/students/${s.id}`} className="inline-flex items-center gap-1 text-[#03045e] hover:text-[#0099cc] font-semibold">
                            View
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button disabled={!prev} onClick={() => setPage((p) => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-lg border ${prev ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>Previous</button>
            <div className="text-xs text-gray-500">Page {page}</div>
            <button disabled={!next} onClick={() => setPage((p) => p + 1)} className={`px-3 py-1.5 rounded-lg border ${next ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}


