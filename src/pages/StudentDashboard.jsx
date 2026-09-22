import { Layout } from '../components/Layout';
import { StatCard, ChartCard, PerformanceBadge, RiskBadge } from '../components/CommonComponents';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Download, BookOpen, Clock, AlertCircle, Target } from 'lucide-react';
import {
  studentKPIData,
  academicPerformanceData,
  performanceTrendData,
  studentInsights,
  studentBehaviourData,
} from '../data/mockAnalytics';

export default function StudentDashboard() {
  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your academic performance and progress</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="input py-2">
              <option>Academic Year 2025-26</option>
              <option>Academic Year 2024-25</option>
            </select>
            <button className="btn-outline">
              <Calendar className="w-4 h-4 mr-2" />
              Select Range
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
            title="Overall Score"
            value={`${studentKPIData.overallScore}%`}
            icon={Target}
            color="primary"
            trend={{ positive: true, label: '+4.2% from last month' }}
          />
          <StatCard
            title="Final CGPA"
            value={studentKPIData.finalCGPA}
            icon={BookOpen}
            color="green"
            trend={{ positive: true, label: '+0.41 from last semester' }}
          />
          <StatCard
            title="Attendance"
            value={`${studentKPIData.attendance}%`}
            icon={Calendar}
            color="primary"
          />
          <StatCard
            title="Study Hours"
            value={`${studentKPIData.studyHours} hrs/day`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Previous CGPA"
            value={studentKPIData.previousCGPA}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            title="Risk Level"
            value={studentKPIData.riskLevel}
            icon={AlertCircle}
            color="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Performance */}
          <ChartCard title="Academic Performance">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={academicPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="marks" fill="#0078d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Performance Trend */}
          <ChartCard title="Performance Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0078d4" strokeWidth={3} dot={{ fill: '#0078d4', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strong Areas */}
          <ChartCard title="Strong Areas">
            <div className="space-y-3">
              {studentInsights.strongAreas.map((area, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{area.subject}</span>
                  <span className="font-bold text-green-600">{area.score}%</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Needs Attention */}
          <ChartCard title="Needs Attention">
            <div className="space-y-3">
              {studentInsights.needsAttention.map((area, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="font-medium text-gray-900">{area.subject}</span>
                  <span className="font-bold text-amber-600">{area.score}%</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Recommended Practice */}
          <ChartCard title="Recommended Practice">
            <div className="space-y-3">
              {studentInsights.recommendedPractice.map((rec, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{rec.subject}</p>
                  <p className="text-xs text-gray-600 mt-1">{rec.topic}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Behaviour Data */}
        <ChartCard title="Behaviour & Engagement">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {studentBehaviourData.map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                  <span className="text-sm font-normal text-gray-600 ml-1">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
}
