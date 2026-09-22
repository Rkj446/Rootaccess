import { Layout } from '../components/Layout';
import { StatCard, ChartCard, DataTable, PerformanceBadge, RiskBadge } from '../components/CommonComponents';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Calendar, Download, AlertTriangle, Award } from 'lucide-react';
import {
  teacherKPIData,
  performanceDistributionData,
  riskDistributionData,
  subjectPerformanceData,
  attendanceDistributionData,
} from '../data/mockAnalytics';
import { mockStudents } from '../data/mockStudents';

export default function TeacherDashboard() {
  const tableColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'major', label: 'Major' },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value) => `${value}%`
    },
    {
      key: 'averageScore',
      label: 'Avg Score',
      render: (value) => `${value}%`
    },
    { key: 'cgpa', label: 'CGPA' },
    {
      key: 'performance',
      label: 'Performance',
      render: (value) => <PerformanceBadge performance={value} />
    },
    {
      key: 'risk',
      label: 'Risk',
      render: (value) => <RiskBadge risk={value} />
    },
  ];

  return (
    <Layout role="TEACHER">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor and analyze student performance</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="input py-2">
              <option>CSE 3rd Year</option>
              <option>CSE 2nd Year</option>
              <option>IT 3rd Year</option>
            </select>
            <select className="input py-2">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Programming</option>
              <option>Database</option>
            </select>
            <button className="btn-outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={teacherKPIData.totalStudents}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Average CGPA"
            value={teacherKPIData.averageCGPA}
            icon={Award}
            color="green"
          />
          <StatCard
            title="Average Score"
            value={`${teacherKPIData.averageScore}%`}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            title="Average Attendance"
            value={`${teacherKPIData.averageAttendance}%`}
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Students At Risk"
            value={teacherKPIData.studentsAtRisk}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Students Improving"
            value={teacherKPIData.studentsImproving}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Distribution */}
          <ChartCard title="Performance Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {performanceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Risk Distribution */}
          <ChartCard title="Risk Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Subject Performance */}
        <ChartCard title="Average Score by Subject">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#0078d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attendance Distribution */}
        <ChartCard title="Attendance Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Student Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Performance Overview</h2>
          <DataTable columns={tableColumns} data={mockStudents} />
        </div>
      </div>
    </Layout>
  );
}
