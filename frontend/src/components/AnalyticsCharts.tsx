'use client'

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { motion } from 'framer-motion'

interface AnalyticsChartsProps {
  trendsData?: any[]
  campusData?: any[]
  teacherData?: any[]
  classData?: any[]
}

export default function AnalyticsCharts({ 
  trendsData = [], 
  campusData = [], 
  teacherData = [], 
  classData = [] 
}: AnalyticsChartsProps) {
  
  // Sample data for demonstration
  const sampleTrendsData = [
    { date: '2024-01-01', total_xp_earned: 1000, levels_completed: 50, active_users: 25 },
    { date: '2024-01-02', total_xp_earned: 1200, levels_completed: 60, active_users: 30 },
    { date: '2024-01-03', total_xp_earned: 1500, levels_completed: 75, active_users: 35 },
    { date: '2024-01-04', total_xp_earned: 1800, levels_completed: 90, active_users: 40 },
    { date: '2024-01-05', total_xp_earned: 2000, levels_completed: 100, active_users: 45 },
    { date: '2024-01-06', total_xp_earned: 2200, levels_completed: 110, active_users: 50 },
    { date: '2024-01-07', total_xp_earned: 2500, levels_completed: 125, active_users: 55 },
  ]

  const sampleCampusData = [
    { campus_name: 'Main Campus', total_students: 100, total_teachers: 20 },
    { campus_name: 'North Campus', total_students: 80, total_teachers: 15 },
    { campus_name: 'South Campus', total_students: 60, total_teachers: 12 },
    { campus_name: 'East Campus', total_students: 40, total_teachers: 8 },
  ]

  const sampleTeacherData = [
    { teacher_name: 'Teacher 1', total_students: 25, average_completion_rate: 85 },
    { teacher_name: 'Teacher 2', total_students: 30, average_completion_rate: 90 },
    { teacher_name: 'Teacher 3', total_students: 20, average_completion_rate: 75 },
    { teacher_name: 'Teacher 4', total_students: 35, average_completion_rate: 95 },
    { teacher_name: 'Teacher 5', total_students: 28, average_completion_rate: 80 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-8">
      {/* Performance Trends Chart - Like Stock Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Performance Trends (Stock-Style)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsData.length > 0 ? trendsData : sampleTrendsData}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="levelsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  value, 
                  name === 'total_xp_earned' ? 'XP Earned' : 
                  name === 'levels_completed' ? 'Levels Completed' : 
                  'Active Users'
                ]}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total_xp_earned" 
                stroke="#3b82f6" 
                fill="url(#xpGradient)"
                strokeWidth={2}
                name="XP Earned"
              />
              <Area 
                type="monotone" 
                dataKey="levels_completed" 
                stroke="#10b981" 
                fill="url(#levelsGradient)"
                strokeWidth={2}
                name="Levels Completed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Campus Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campus Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🏫 Campus Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={campusData.length > 0 ? campusData : sampleCampusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ campus_name, total_students }) => `${campus_name}: ${total_students}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total_students"
                >
                  {(campusData.length > 0 ? campusData : sampleCampusData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'Students']}
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Campus Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🏫 Campus Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campusData.length > 0 ? campusData : sampleCampusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="campus_name" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="total_students" fill="#3b82f6" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_teachers" fill="#10b981" name="Teachers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Teacher Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🏫 Teacher Performance Analysis</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teacherData.length > 0 ? teacherData : sampleTeacherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="teacher_name" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={100}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="total_students" fill="#3b82f6" name="Students Assigned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average_completion_rate" fill="#10b981" name="Completion Rate %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Real-time Progress Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Real-time Progress Tracking</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData.length > 0 ? trendsData : sampleTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  value, 
                  name === 'total_xp_earned' ? 'XP Earned' : 
                  name === 'levels_completed' ? 'Levels Completed' : 
                  'Active Users'
                ]}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_xp_earned" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="XP Earned"
              />
              <Line 
                type="monotone" 
                dataKey="levels_completed" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                name="Levels Completed"
              />
              <Line 
                type="monotone" 
                dataKey="active_users" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}



