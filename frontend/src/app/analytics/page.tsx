"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from '@/contexts/AuthContext'
import {
  Users,
  GraduationCap,
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Zap,
  Eye,
  RefreshCw,
  Building2,
  ArrowUpRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface OverallStats {
  date: string
  total_users: number
  total_teachers: number
  total_students: number
  active_users_today: number
  total_levels: number
  total_groups: number
  levels_completed_today: number
  total_levels_completed: number
  average_completion_rate: number
  average_xp_per_student: number
  total_xp_earned: number
  students_with_streak: number
  students_active_this_week: number
  students_active_this_month: number
  top_student_xp: number
  top_student_streak: number
  top_class_completion: number
}

interface CampusData {
  campus_id: number
  campus_name: string
  total_teachers: number
  total_students: number
  total_classes: number
  active_students_today: number
  total_xp_earned: number
  average_class_completion: number
}

interface TeacherData {
  teacher_id: number
  teacher_name: string
  teacher_code: string
  assigned_class: string | null
  total_students: number
  students_completed_levels: number
  active_students_today: number
  average_completion_rate: number
  average_xp_per_student: number
  top_student_name: string
  top_student_xp: number
  struggling_students: number
}

interface ClassData {
  class_id: number
  class_name: string
  class_code: string
  grade: string
  section: string
  class_teacher: string | null
  total_students: number
  active_students_today: number
  active_students_this_week: number
  total_levels_completed: number
  average_completion_rate: number
  total_xp_earned: number
  average_xp_per_student: number
  students_with_streak: number
  average_streak: number
  top_student_name: string
  top_student_xp: number
  struggling_students: number
}

interface StudentData {
  student_id: number
  student_name: string
  student_code: string
  class_name: string
  campus_name: string
  total_xp: number
  levels_completed: number
  current_streak: number
  longest_streak: number
  last_active: string
  completion_rate: number
  rank: number
  teacher_name: string
}

export default function AnalyticsDashboard() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [campusData, setCampusData] = useState<CampusData[]>([])
  const [teacherData, setTeacherData] = useState<TeacherData[]>([])
  const [classData, setClassData] = useState<ClassData[]>([])
  const [studentData, setStudentData] = useState<StudentData[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [dailyActivityData, setDailyActivityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCampus, setSelectedCampus] = useState<string>("all")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all")
  const [dateRange, setDateRange] = useState("week")
  const [refreshKey, setRefreshKey] = useState(0)
  const { isLoggedIn, user, loading: authLoading } = useAuth()

  // Check authentication and load data
  useEffect(() => {
    // Check if user is logged in
    if (!authLoading && !isLoggedIn) {
      window.location.href = '/login'
      return
    }
    
    // Only allow donors and teachers to access analytics
    if (!authLoading && isLoggedIn && user?.role !== 'donor' && user?.role !== 'teacher') {
      window.location.href = '/'
      return
    }
    
    if (!authLoading && isLoggedIn) {
      loadAnalyticsData()
    }
  }, [authLoading, isLoggedIn, user])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      console.log('🔄 Loading analytics data...')
      
      // Fetch real data from backend APIs
      const [overallResponse, campusResponse, teacherResponse, studentResponse, dailyActivityResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/analytics/overall-stats/'),
        fetch('http://127.0.0.1:8000/api/analytics/campus-data/'),
        fetch('http://127.0.0.1:8000/api/analytics/teacher-performance/'),
        fetch('http://127.0.0.1:8000/api/analytics/student-performance/'),
        fetch('http://127.0.0.1:8000/api/analytics/daily-activity/')
      ])

      console.log('📊 API Responses:', {
        overall: overallResponse.status,
        campus: campusResponse.status,
        teacher: teacherResponse.status,
        student: studentResponse.status,
        daily: dailyActivityResponse.status
      })

      if (overallResponse.ok) {
        const overallData = await overallResponse.json()
        console.log('✅ Overall Stats:', overallData)
        setOverallStats(overallData)
      } else {
        console.error('❌ Overall Stats failed:', overallResponse.status, await overallResponse.text())
      }

      if (campusResponse.ok) {
        const campusData = await campusResponse.json()
        console.log('✅ Campus Data:', campusData)
        setCampusData(campusData.results || campusData)
      } else {
        console.error('❌ Campus Data failed:', campusResponse.status, await campusResponse.text())
      }

      if (teacherResponse.ok) {
        const teacherData = await teacherResponse.json()
        console.log('✅ Teacher Data:', teacherData)
        setTeacherData(teacherData.results || teacherData)
      } else {
        console.error('❌ Teacher Data failed:', teacherResponse.status, await teacherResponse.text())
      }

      if (studentResponse.ok) {
        const studentData = await studentResponse.json()
        console.log('✅ Student Data:', studentData)
        setStudentData(studentData.results || studentData)
      } else {
        console.error('❌ Student Data failed:', studentResponse.status, await studentResponse.text())
      }

      if (dailyActivityResponse.ok) {
        const dailyData = await dailyActivityResponse.json()
        console.log('✅ Daily Activity:', dailyData)
        setDailyActivityData(dailyData.results || dailyData)
      } else {
        console.error('❌ Daily Activity failed:', dailyActivityResponse.status, await dailyActivityResponse.text())
      }

      // Check if we got any real data
      const hasRealData = overallResponse.ok || campusResponse.ok || teacherResponse.ok || studentResponse.ok || dailyActivityResponse.ok
      
      if (!hasRealData) {
        console.warn('⚠️ No real data received, using mock data')
        loadMockData()
      }

    } catch (error) {
      console.error('💥 Error loading analytics data:', error)
      console.warn('⚠️ Using mock data as fallback')
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockOverallStats: OverallStats = {
      date: new Date().toISOString(),
      total_users: 1250,
      total_teachers: 45,
      total_students: 1200,
      active_users_today: 890,
      total_levels: 150,
      total_groups: 25,
      levels_completed_today: 45,
      total_levels_completed: 3450,
      average_completion_rate: 78,
      average_xp_per_student: 2500,
      total_xp_earned: 3000000,
      students_with_streak: 450,
      students_active_this_week: 950,
      students_active_this_month: 1100,
      top_student_xp: 15000,
      top_student_streak: 45,
      top_class_completion: 92,
    }

    const mockCampusData: CampusData[] = [
      {
        campus_id: 1,
        campus_name: "Main Campus",
        total_teachers: 20,
        total_students: 500,
        total_classes: 15,
        active_students_today: 380,
        total_xp_earned: 1200000,
        average_class_completion: 82,
      },
      {
        campus_id: 2,
        campus_name: "North Campus",
        total_teachers: 15,
        total_students: 400,
        total_classes: 12,
        active_students_today: 310,
        total_xp_earned: 950000,
        average_class_completion: 75,
      },
      {
        campus_id: 3,
        campus_name: "South Campus",
        total_teachers: 10,
        total_students: 300,
        total_classes: 10,
        active_students_today: 200,
        total_xp_earned: 850000,
        average_class_completion: 70,
      },
    ]

    const mockTeacherData: TeacherData[] = [
      {
        teacher_id: 1,
        teacher_name: "Ahmed Khan",
        teacher_code: "T001",
        assigned_class: "Class 5A",
        total_students: 35,
        students_completed_levels: 28,
        active_students_today: 32,
        average_completion_rate: 85,
        average_xp_per_student: 3200,
        top_student_name: "Ali Ahmed",
        top_student_xp: 12000,
        struggling_students: 3,
      },
      {
        teacher_id: 2,
        teacher_name: "Fatima Hassan",
        teacher_code: "T002",
        assigned_class: "Class 6B",
        total_students: 32,
        students_completed_levels: 25,
        active_students_today: 28,
        average_completion_rate: 78,
        average_xp_per_student: 2800,
        top_student_name: "Zainab Ali",
        top_student_xp: 10500,
        struggling_students: 5,
      },
      {
        teacher_id: 3,
        teacher_name: "Mohammed Ibrahim",
        teacher_code: "T003",
        assigned_class: "Class 7C",
        total_students: 38,
        students_completed_levels: 32,
        active_students_today: 35,
        average_completion_rate: 88,
        average_xp_per_student: 3400,
        top_student_name: "Hassan Omar",
        top_student_xp: 13500,
        struggling_students: 2,
      },
    ]

    const mockStudentData: StudentData[] = [
      {
        student_id: 1,
        student_name: "Ali Ahmed",
        student_code: "S001",
        class_name: "Class 5A",
        campus_name: "Main Campus",
        total_xp: 15000,
        levels_completed: 45,
        current_streak: 12,
        longest_streak: 25,
        last_active: new Date().toISOString(),
        completion_rate: 95,
        rank: 1,
        teacher_name: "Ahmed Khan"
      },
      {
        student_id: 2,
        student_name: "Zainab Ali",
        student_code: "S002",
        class_name: "Class 6B",
        campus_name: "Main Campus",
        total_xp: 13500,
        levels_completed: 42,
        current_streak: 8,
        longest_streak: 20,
        last_active: new Date().toISOString(),
        completion_rate: 92,
        rank: 2,
        teacher_name: "Fatima Hassan"
      },
      {
        student_id: 3,
        student_name: "Hassan Omar",
        student_code: "S003",
        class_name: "Class 7C",
        campus_name: "North Campus",
        total_xp: 12800,
        levels_completed: 40,
        current_streak: 15,
        longest_streak: 18,
        last_active: new Date().toISOString(),
        completion_rate: 88,
        rank: 3,
        teacher_name: "Mohammed Ibrahim"
      }
    ]

    const mockDailyActivityData = [
      { day: "Mon", active_students: 450, levels_completed: 120, xp_earned: 12000, login_count: 380 },
      { day: "Tue", active_students: 520, levels_completed: 180, xp_earned: 15000, login_count: 420 },
      { day: "Wed", active_students: 480, levels_completed: 150, xp_earned: 13500, login_count: 390 },
      { day: "Thu", active_students: 610, levels_completed: 220, xp_earned: 18000, login_count: 480 },
      { day: "Fri", active_students: 580, levels_completed: 200, xp_earned: 16500, login_count: 460 },
      { day: "Sat", active_students: 350, levels_completed: 80, xp_earned: 9000, login_count: 280 },
      { day: "Sun", active_students: 420, levels_completed: 140, xp_earned: 11000, login_count: 320 },
    ]

    setOverallStats(mockOverallStats)
    setCampusData(mockCampusData)
    setTeacherData(mockTeacherData)
    setStudentData(mockStudentData)
    setDailyActivityData(mockDailyActivityData)
    setLoading(false)
  }

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  const getCurrentWeek = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil(days / 7)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(208,98%,23%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect if not logged in or not authorized
  if (!isLoggedIn || (user?.role !== 'donor' && user?.role !== 'teacher')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(208,98%,23%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(208,98%,23%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#03045e]/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00bfe6]/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-[#03045e]/5 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      {/* Modern Header with Website Colors */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  {getCurrentDate()} · WEEK {getCurrentWeek()} · Analytics
                </span>
                <div className="w-2 h-2 bg-[#00bfe6] rounded-full animate-pulse shadow-lg shadow-[#00bfe6]/50"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent flex items-center gap-4">
                Analytics Dashboard
                <motion.button 
                  className="text-gray-400 hover:text-[#00bfe6] transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="h-6 w-6" />
                </motion.button>
              </h1>
            </motion.div>
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.button
                onClick={refreshData}
                className="flex items-center gap-3 bg-gradient-to-r from-[#03045e] to-[#00bfe6] hover:from-[#02033a] hover:to-[#0099cc] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="h-5 w-5" />
                Refresh Data
              </motion.button>
              <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
                Updated: {overallStats?.date ? new Date(overallStats.date).toLocaleDateString() : "N/A"}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Ultra Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            {
              label: "Total Users",
              value: overallStats?.total_users || 0,
              icon: Users,
              color: "from-[#03045e] to-[#00bfe6]",
              bgColor: "from-blue-50 to-cyan-50",
              change: "+12%",
              changeColor: "text-green-600",
              glowColor: "shadow-blue-500/25",
            },
            {
              label: "Active Today",
              value: overallStats?.active_users_today || 0,
              icon: Activity,
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50",
              change: "+8%",
              changeColor: "text-green-600",
              glowColor: "shadow-green-500/25",
            },
            {
              label: "Levels Completed",
              value: overallStats?.total_levels_completed || 0,
              icon: Target,
              color: "from-orange-500 to-yellow-500",
              bgColor: "from-orange-50 to-yellow-50",
              change: "+15%",
              changeColor: "text-orange-600",
              glowColor: "shadow-orange-500/25",
            },
            {
              label: "Total XP",
              value: (overallStats?.total_xp_earned || 0).toLocaleString(),
              icon: Zap,
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-50 to-pink-50",
              change: "+25%",
              changeColor: "text-purple-600",
              glowColor: "shadow-purple-500/25",
            },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}
                className="group relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                whileHover={{ scale: 1.03, rotateY: 5 }}
                style={{ 
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
                }}
              >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl`}></div>
                
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl ${stat.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg border border-gray-200`}
                      whileHover={{ rotate: 10, scale: 1.15 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <Icon className="h-8 w-8 text-white drop-shadow-lg" />
                    </motion.div>
                    <motion.div 
                      className={`flex items-center gap-2 text-sm font-bold ${stat.changeColor} bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-200`}
                      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    {stat.change}
                    </motion.div>
                  </div>
                  <motion.div 
                    className="text-4xl font-black text-[#03045e] mb-3 drop-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-gray-600 font-semibold tracking-wide">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Ultra Modern System Overview Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 25px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <motion.h3 
                className="text-2xl font-black bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent flex items-center gap-4"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                  <BarChart3 className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                System Overview
              </motion.h3>
              <motion.div 
                className="flex items-center gap-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-3 h-3 bg-[#00bfe6] rounded-full animate-pulse shadow-lg shadow-[#00bfe6]/50"></div>
                Live Data Stream
              </motion.div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyActivityData.length > 0 ? dailyActivityData : [
                    { day: "Mon", active_students: 450, levels_completed: 120, xp_earned: 12000 },
                    { day: "Tue", active_students: 520, levels_completed: 180, xp_earned: 15000 },
                    { day: "Wed", active_students: 480, levels_completed: 150, xp_earned: 13500 },
                    { day: "Thu", active_students: 610, levels_completed: 220, xp_earned: 18000 },
                    { day: "Fri", active_students: 580, levels_completed: 200, xp_earned: 16500 },
                    { day: "Sat", active_students: 350, levels_completed: 80, xp_earned: 9000 },
                    { day: "Sun", active_students: 420, levels_completed: 140, xp_earned: 11000 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorActiveStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#03045e" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#03045e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#03045e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLevelsCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bfe6" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#00bfe6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00bfe6" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 14, fill: "#6b7280", fontWeight: "bold" }} 
                    stroke="rgba(0,0,0,0.1)" 
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: "#6b7280", fontWeight: "bold" }} 
                    stroke="rgba(0,0,0,0.1)" 
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                    labelStyle={{ color: "#03045e", fontWeight: "bold", fontSize: "16px" }}
                    formatter={(value: any, name: string) => {
                      if (name === 'active_students') return [`${value} students`, 'Active Students']
                      if (name === 'levels_completed') return [`${value} levels`, 'Levels Completed']
                      if (name === 'xp_earned') return [`${value.toLocaleString()} XP`, 'XP Earned']
                      return [value, name]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active_students"
                    stroke="#03045e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorActiveStudents)"
                    name="Active Students"
                    filter="url(#glow)"
                  />
                  <Area
                    type="monotone"
                    dataKey="levels_completed"
                    stroke="#00bfe6"
                    strokeWidth={3}
                    fillOpacity={0.8}
                    fill="url(#colorLevelsCompleted)"
                    name="Levels Completed"
                    filter="url(#glow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 25px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
            }}
          >
            <motion.h3 
              className="text-2xl font-black bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-8 flex items-center gap-4"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#03045e] to-[#00bfe6] rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                <Users className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              User Distribution
            </motion.h3>

            {/* Modern Circular Chart Design */}
            <div className="flex items-start justify-between gap-8">
              {/* Circular Diagram */}
              <div className="relative w-96 h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                        { name: 'Students', value: overallStats?.total_students || 0, color: '#03045e' },
                        { name: 'Teachers', value: overallStats?.total_teachers || 0, color: '#00bfe6' },
                        { name: 'Coordinators', value: 5, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                      innerRadius={80}
                      outerRadius={160}
                      paddingAngle={3}
                    dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {[
                        { name: 'Students', value: overallStats?.total_students || 0, color: '#03045e' },
                        { name: 'Teachers', value: overallStats?.total_teachers || 0, color: '#00bfe6' },
                        { name: 'Coordinators', value: 5, color: '#10b981' },
                    ].map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={4}
                          style={{ 
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.25)) brightness(1.1)'
                            e.target.style.transform = 'scale(1.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))'
                            e.target.style.transform = 'scale(1)'
                          }}
                        />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                        borderRadius: "20px",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                        backdropFilter: "blur(10px)",
                        padding: "16px 20px",
                      }}
                      labelStyle={{ 
                        color: "#03045e", 
                        fontWeight: "bold", 
                        fontSize: "18px",
                        marginBottom: "8px"
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Students') return [`${value} students`, 'Students']
                        if (name === 'Teachers') return [`${value} teachers`, 'Teachers']
                        if (name === 'Coordinators') return [`${value} coordinators`, 'Coordinators']
                        return [`${value} users`, name]
                      }}
                      labelFormatter={(label) => {
                        if (label === 'Students') return 'Students'
                        if (label === 'Teachers') return 'Teachers'
                        if (label === 'Coordinators') return 'Coordinators'
                        return label
                      }}
                  />
                </PieChart>
              </ResponsiveContainer>
                
                {/* Central Circle with Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-xl border-4 border-gray-100 flex items-center justify-center">
                  <Users className="h-12 w-12 text-[#03045e]" />
                </div>
                
                {/* Floating Icons - Removed to avoid overlap */}
              </div>
              
              {/* Numbered Information Bars */}
              <div className="flex-1 space-y-6">
                {[
                  { 
                    number: "01", 
                    title: "Students", 
                    value: overallStats?.total_students || 0, 
                    color: "#03045e",
                    description: "Active learners across all campuses"
                  },
                  { 
                    number: "02", 
                    title: "Teachers", 
                    value: overallStats?.total_teachers || 0, 
                    color: "#00bfe6",
                    description: "Educators guiding student progress"
                  },
                  { 
                    number: "03", 
                    title: "Coordinators", 
                    value: 5, 
                    color: "#10b981",
                    description: "Administrative staff managing operations"
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    style={{ 
                      background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
                      boxShadow: `0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)`
                    }}
                  >
                    {/* Number Badge */}
                    <div 
                      className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.number}
                    </div>
                    
                    <div className="ml-10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-black text-gray-900">{item.title}</h4>
                        <span 
                          className="text-3xl font-black"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">{item.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="h-3 rounded-full shadow-lg"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / (overallStats?.total_users || 1)) * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1.5 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campus Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.h3 
              className="text-xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-6 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              Campus Performance
            </motion.h3>

            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campusData.map((campus) => ({
                    name: campus.campus_name.split(" ")[0],
                    students: campus.total_students,
                    completion: campus.average_class_completion,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(208, 98%, 23%)" }}
                  />
                  <Bar dataKey="students" fill="hsl(208, 98%, 23%)" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {campusData.map((campus, index) => (
                <div
                  key={campus.campus_id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[hsl(208,98%,23%)] rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[hsl(208,98%,23%)]">{campus.campus_name}</div>
                      <div className="text-xs text-gray-600">{campus.total_students} students</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">{campus.average_class_completion}%</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Teachers Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.h3 
              className="text-xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-6 flex items-center gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Top Teachers
            </motion.h3>

            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teacherData.slice(0, 3).map((teacher) => ({
                    name: teacher.teacher_name.split(" ")[0],
                    completion: teacher.average_completion_rate,
                    students: teacher.total_students,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(208, 98%, 23%)" }}
                  />
                  <Bar dataKey="completion" fill="hsl(208, 98%, 23%)" radius={[4, 4, 0, 0]} name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {teacherData.slice(0, 5).map((teacher, index) => (
                <motion.div
                  key={teacher.teacher_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{teacher.teacher_name}</div>
                      <div className="text-sm text-gray-600">{teacher.assigned_class || 'No Class Assigned'}</div>
                      <div className="text-xs text-gray-500">{teacher.total_students} students • {teacher.active_students_today} active today</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{teacher.average_completion_rate}%</div>
                    <div className="text-xs text-gray-500">{teacher.average_xp_per_student.toLocaleString()} avg XP</div>
                    <div className="text-xs text-green-600">{teacher.students_completed_levels}/{teacher.total_students} completed</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Student Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
        >
          <motion.h3 
            className="text-xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-6 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            Top Students Leaderboard
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top XP Students */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Highest XP Earners
              </h4>
              <div className="space-y-3">
                {studentData.slice(0, 5).map((student, index) => (
                  <motion.div
                    key={student.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                      {index + 1}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800">{student.student_name}</div>
                        <div className="text-xs text-gray-600">{student.class_name}</div>
                    </div>
                  </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{student.total_xp.toLocaleString()} XP</div>
                      <div className="text-xs text-gray-500">{student.levels_completed} levels</div>
                  </div>
                  </motion.div>
                ))}
                </div>
            </div>

            {/* Top Streak Students */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Longest Streaks
              </h4>
              <div className="space-y-3">
                {studentData
                  .sort((a, b) => b.longest_streak - a.longest_streak)
                  .slice(0, 5)
                  .map((student, index) => (
                  <motion.div
                    key={student.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{student.student_name}</div>
                        <div className="text-xs text-gray-600">{student.class_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{student.longest_streak} days</div>
                      <div className="text-xs text-gray-500">Current: {student.current_streak}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Top Completion Rate */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Best Performers
              </h4>
              <div className="space-y-3">
                {studentData
                  .sort((a, b) => b.completion_rate - a.completion_rate)
                  .slice(0, 5)
                  .map((student, index) => (
                  <motion.div
                    key={student.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{student.student_name}</div>
                        <div className="text-xs text-gray-600">{student.class_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{student.completion_rate}%</div>
                      <div className="text-xs text-gray-500">{student.levels_completed} levels</div>
            </div>
          </motion.div>
                ))}
        </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <motion.h3 
            className="text-xl font-bold bg-gradient-to-r from-[#03045e] to-[#00bfe6] bg-clip-text text-transparent mb-6 flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Activity Trends
          </motion.h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyActivityData.length > 0 ? dailyActivityData : [
                  { day: "Mon", active_students: 450, levels_completed: 120, xp_earned: 12000 },
                  { day: "Tue", active_students: 520, levels_completed: 180, xp_earned: 15000 },
                  { day: "Wed", active_students: 480, levels_completed: 150, xp_earned: 13500 },
                  { day: "Thu", active_students: 610, levels_completed: 220, xp_earned: 18000 },
                  { day: "Fri", active_students: 580, levels_completed: 200, xp_earned: 16500 },
                  { day: "Sat", active_students: 350, levels_completed: 80, xp_earned: 9000 },
                  { day: "Sun", active_students: 420, levels_completed: 140, xp_earned: 11000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "#03045e", fontWeight: "bold" }}
                  formatter={(value: any, name: string) => {
                    if (name === 'active_students') return [`${value} students`, 'Active Students']
                    if (name === 'levels_completed') return [`${value} levels`, 'Levels Completed']
                    if (name === 'xp_earned') return [`${value.toLocaleString()} XP`, 'XP Earned']
                    return [value, name]
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active_students"
                  stroke="#03045e"
                  strokeWidth={3}
                  name="Active Students"
                  dot={{ fill: "#03045e", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="levels_completed"
                  stroke="#00bfe6"
                  strokeWidth={3}
                  name="Levels Completed"
                  dot={{ fill: "#00bfe6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="xp_earned"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="XP Earned"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
