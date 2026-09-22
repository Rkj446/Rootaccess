import { Layout } from '../components/Layout';
import { StatCard, ChartCard, DataTable, PerformanceBadge, RiskBadge } from '../components/CommonComponents';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar, Download } from 'lucide-react';
import {
  adminKPIData,
  studentsByMajorData,
  performanceByMajorData,
  cgpaByDepartmentData,
  performanceDistributionData,
  riskDistributionData,
} from '../data/mockAnalytics';
import { mockStudents } from '../data/mockStudents';

export default function AdminDashboard() {
  const tableColumns = [
    { key: 'id', label: 'Student ID' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'major', label: 'Major' },
    {
      key: 'averageScore',
      label: 'Avg Marks',
      render: (value) => `${value}%`
    },
    { key: 'cgpa', label: 'CGPA' },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (value) => `${value}%`
    },
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
    <Layout role="ADMIN">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive system-wide analytics and management</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="input py-2">
              <option>Academic Year 2025-26</option>
              <option>Academic Year 2024-25</option>
            </select>
            <select className="input py-2">
              <option>All Departments</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>ME</option>
              <option>CE</option>
            </select>
            <button className="btn-outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={adminKPIData.totalStudents}
            icon={Users}
            color="primary"
            trend={{ positive: true, label: '+12 from last month' }}
          />
          <StatCard
            title="Total Teachers"
            value={adminKPIData.totalTeachers}
            icon={GraduationCap}
            color="green"
          />
          <StatCard
            title="Total Classes"
            value={adminKPIData.totalClasses}
            icon={BookOpen}
            color="amber"
          />
          <StatCard
            title="Average CGPA"
            value={adminKPIData.averageCGPA}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            title="Average Attendance"
            value={`${adminKPIData.averageAttendance}%`}
            icon={Calendar}
            color="green"
          />
          <StatCard
            title="Average Score"
            value={`${adminKPIData.averageScore}%`}
            icon={TrendingUp}
            color="primary"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Major */}
          <ChartCard title="Students by Major">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsByMajorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="major" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0078d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Performance by Major */}
          <ChartCard title="Average CGPA by Major">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceByMajorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="major" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="cgpa" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Distribution */}
          <ChartCard title="Students by Performance Category">
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

        {/* CGPA by Department */}
        <ChartCard title="Average CGPA by Department">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cgpaByDepartmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="cgpa" fill="#0078d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Student Management Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Management</h2>
          <DataTable columns={tableColumns} data={mockStudents} />
        </div>
      </div>
    </Layout>
  );
}
