import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, ChartCard, PerformanceBadge, RiskBadge } from '../components/CommonComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Download, BookOpen, Clock, AlertCircle, Target } from 'lucide-react';
import api from '../services/api';

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/students/me');
        setStudent(data.data.student);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student data');
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <Layout role="STUDENT">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Loading your dashboard…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout role="STUDENT">
        <div className="p-6">
          <div className="card p-6 text-red-600">
            <p>{error || 'Unable to load student data'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Build academic performance chart data from student model fields
  const academicPerformanceData = [
    { subject: 'Internal', marks: student.internalMarks ?? 0 },
    { subject: 'Assignment', marks: student.assignmentAvg ?? 0 },
    { subject: 'Midterm', marks: student.midtermMarks ?? 0 },
    { subject: 'Lab', marks: student.labMarks ?? 0 },
    { subject: 'Final', marks: student.finalScore ?? 0 },
  ];

  // Build engagement data from student fields
  const engagementData = [
    { category: 'Attendance', value: student.attendancePct ?? 0, unit: '%' },
    { category: 'Study', value: student.studyHoursPerDay ?? 0, unit: 'hrs/day' },
    { category: 'Sleep', value: student.sleepHoursPerDay ?? 0, unit: 'hrs/day' },
    { category: 'Participation', value: student.classParticipationPct ?? 0, unit: '%' },
    { category: 'Backlogs', value: student.backlogs ?? 0, unit: '' },
  ];

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
            value={`${(student.finalScore ?? 0).toFixed(1)}%`}
            icon={Target}
            color="primary"
          />
          <StatCard
            title="Final CGPA"
            value={((student.finalCgpa ?? 0).toFixed(2))}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="Attendance"
            value={`${(student.attendancePct ?? 0).toFixed(1)}%`}
            icon={Calendar}
            color="primary"
          />
          <StatCard
            title="Study Hours"
            value={`${(student.studyHoursPerDay ?? 0).toFixed(1)} hrs/day`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Previous CGPA"
            value={((student.previousCgpa ?? 0).toFixed(2))}
            icon={TrendingUp}
            color="primary"
          />
          <StatCard
            title="Risk Level"
            value={student.riskLevel || 'N/A'}
            icon={AlertCircle}
            color={student.riskLevel === 'Low' ? 'green' : student.riskLevel === 'Medium' ? 'amber' : 'red'}
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

          {/* Performance & Risk Summary */}
          <ChartCard title="Performance Summary">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Performance Category</p>
                <div className="flex items-center gap-2">
                  <PerformanceBadge performance={student.performanceCategory || 'Average'} />
                  <span className="text-sm text-gray-900">{student.performanceCategory || 'Not Assessed'}</span>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Risk Assessment</p>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={student.riskLevel || 'Medium'} />
                  <span className="text-sm text-gray-900">{student.riskLevel || 'Not Assessed'}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Student ID</p>
                <p className="text-lg font-semibold text-gray-900">{student.studentId}</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Behaviour & Engagement Data */}
        <ChartCard title="Behaviour & Engagement">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {engagementData.map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(typeof item.value === 'number' ? item.value.toFixed(1) : item.value)}
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
