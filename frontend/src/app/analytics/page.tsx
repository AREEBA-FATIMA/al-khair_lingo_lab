"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

export default function AnalyticsDashboard() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [campusData, setCampusData] = useState<CampusData[]>([])
  const [teacherData, setTeacherData] = useState<TeacherData[]>([])
  const [classData, setClassData] = useState<ClassData[]>([])
  const [trendsData, setTrendsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCampus, setSelectedCampus] = useState<string>("all")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all")
  const [dateRange, setDateRange] = useState("week")
  const [refreshKey, setRefreshKey] = useState(0)

  // Mock data for demonstration
  useEffect(() => {
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

    setOverallStats(mockOverallStats)
    setCampusData(mockCampusData)
    setTeacherData(mockTeacherData)
    setLoading(false)
  }, [refreshKey])

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
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {getCurrentDate()} · WEEK {getCurrentWeek()} · Analytics
                </span>
              </div>
              <h1 className="text-4xl font-bold text-[hsl(208,98%,23%)] flex items-center gap-3">
                Dashboard
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye className="h-5 w-5" />
                </button>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 bg-[hsl(208,98%,23%)] hover:bg-[hsl(208,98%,18%)] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <div className="text-xs text-gray-500">
                Updated: {overallStats?.date ? new Date(overallStats.date).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: overallStats?.total_users || 0,
              icon: Users,
              color: "hsl(208, 98%, 23%)",
              change: "+12%",
            },
            {
              label: "Active Today",
              value: overallStats?.active_users_today || 0,
              icon: Activity,
              color: "#10b981",
              change: "+8%",
            },
            {
              label: "Levels Completed",
              value: overallStats?.total_levels_completed || 0,
              icon: Target,
              color: "#f59e0b",
              change: "+15%",
            },
            {
              label: "Total XP",
              value: (overallStats?.total_xp_earned || 0).toLocaleString(),
              icon: Zap,
              color: "#8b5cf6",
              change: "+25%",
            },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: stat.color }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-[hsl(208,98%,23%)] mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Overview Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[hsl(208,98%,23%)] flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Live
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { day: "Mon", users: 450, levels: 120, xp: 12000 },
                    { day: "Tue", users: 520, levels: 180, xp: 15000 },
                    { day: "Wed", users: 480, levels: 150, xp: 13500 },
                    { day: "Thu", users: 610, levels: 220, xp: 18000 },
                    { day: "Fri", users: 580, levels: 200, xp: 16500 },
                    { day: "Sat", users: 350, levels: 80, xp: 9000 },
                    { day: "Sun", users: 420, levels: 140, xp: 11000 },
                  ]}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(208, 98%, 23%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(208, 98%, 23%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} stroke="#e5e7eb" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(208, 98%, 23%)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(208, 98%, 23%)"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[hsl(208,98%,23%)] mb-6 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribution
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Students", value: overallStats?.total_students || 0, color: "#10B981" },
                      { name: "Teachers", value: overallStats?.total_teachers || 0, color: "hsl(208, 98%, 23%)" },
                      { name: "Admin", value: 5, color: "#8B5CF6" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { name: "Students", value: overallStats?.total_students || 0, color: "#10B981" },
                      { name: "Teachers", value: overallStats?.total_teachers || 0, color: "hsl(208, 98%, 23%)" },
                      { name: "Admin", value: 5, color: "#8B5CF6" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(208, 98%, 23%)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campus Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[hsl(208,98%,23%)] mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Campus Performance
            </h3>

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
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[hsl(208,98%,23%)] mb-6 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Top Teachers
            </h3>

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

            <div className="space-y-2">
              {teacherData.slice(0, 3).map((teacher, index) => (
                <div
                  key={teacher.teacher_id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[hsl(208,98%,23%)] rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[hsl(208,98%,23%)]">{teacher.teacher_name}</div>
                      <div className="text-xs text-gray-600">{teacher.total_students} students</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[hsl(208,98%,23%)]">
                    {teacher.average_completion_rate}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-[hsl(208,98%,23%)] mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Trends
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { day: "Mon", users: 450, levels: 120, xp: 12000 },
                  { day: "Tue", users: 520, levels: 180, xp: 15000 },
                  { day: "Wed", users: 480, levels: 150, xp: 13500 },
                  { day: "Thu", users: 610, levels: 220, xp: 18000 },
                  { day: "Fri", users: 580, levels: 200, xp: 16500 },
                  { day: "Sat", users: 350, levels: 80, xp: 9000 },
                  { day: "Sun", users: 420, levels: 140, xp: 11000 },
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
                  }}
                  labelStyle={{ color: "hsl(208, 98%, 23%)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(208, 98%, 23%)"
                  strokeWidth={2}
                  name="Active Users"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="levels"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Levels Completed"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
