import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function AnalyticsDashboard({ title = 'Analytics', role = 'ADMIN' }) {
  const [overview, setOverview] = useState({});
  const [performance, setPerformance] = useState([]);
  const [risk, setRisk] = useState([]);
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({ classWiseAttendance: [], subjectWiseAttendance: [], statusSummary: [] });
  const [results, setResults] = useState({ gradeDistribution: {} });
  const [rankings, setRankings] = useState({ overall: [] });
  const [atRisk, setAtRisk] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, performanceRes, riskRes, majorRes, classRes, attendanceRes, resultRes, rankingRes, atRiskRes, topRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/performance-distribution'),
          api.get('/analytics/risk-distribution'),
          api.get('/analytics/by-major'),
          api.get('/analytics/by-class'),
          api.get('/analytics/attendance'),
          api.get('/analytics/results'),
          api.get('/analytics/rankings'),
          api.get('/analytics/at-risk'),
          api.get('/analytics/top-performers', { params: { limit: 5 } }),
        ]);

        setOverview(overviewRes.data?.data || {});
        setPerformance(performanceRes.data?.data?.distribution || []);
        setRisk(riskRes.data?.data?.distribution || []);
        setMajors(majorRes.data?.data?.majors || []);
        setClasses(classRes.data?.data?.classes || []);
        setAttendance(attendanceRes.data?.data || { classWiseAttendance: [], subjectWiseAttendance: [], statusSummary: [] });
        setResults(resultRes.data?.data || { gradeDistribution: {} });
        setRankings(rankingRes.data?.data || { overall: [] });
        setAtRisk(atRiskRes.data?.data?.students || []);
        setTopPerformers(topRes.data?.data?.students || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load analytics');
      }
    };
    load();
  }, [role]);

  const gradeEntries = Object.entries(results.gradeDistribution || {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">{role}</p>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={overview.totalStudents || 0} />
        <StatCard label="Average CGPA" value={(overview.averageCgpa || 0).toFixed(2)} />
        <StatCard label="Average Attendance" value={`${((overview.averageAttendance || 0)).toFixed(1)}%`} />
        <StatCard label="Average Final Score" value={(overview.averageFinalScore || 0).toFixed(1)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Performance Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={risk} dataKey="count" nameKey="riskLevel" outerRadius={90} label>
                {risk.map((entry, index) => (
                  <Cell key={`${entry.riskLevel}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TableCard title="Major Analytics" rows={majors.slice(0, 5)} columns={['major', 'studentCount', 'averageCgpa', 'averageFinalScore']} />
        <TableCard title="Top Performers" rows={topPerformers} columns={['studentId', 'cgpa', 'finalScore', 'attendance']} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TableCard title="Class Overview" rows={classes.slice(0, 5)} columns={['className', 'totalStudents', 'averageCgpa', 'averageScore']} />
        <TableCard title="At-Risk Students" rows={atRisk.slice(0, 5)} columns={['studentId', 'major', 'cgpa', 'riskLevel']} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Attendance by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendance.statusSummary || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grade Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={gradeEntries.map(([grade, count]) => ({ grade, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TableCard title="Rankings" rows={(rankings.overall || []).slice(0, 5)} columns={['studentId', 'finalCgpa', 'finalScore', 'major']} />
        <TableCard title="High Level Summary" rows={[
          { label: 'Low Risk', value: overview.lowRiskStudentCount || 0 },
          { label: 'Medium Risk', value: overview.mediumRiskStudentCount || 0 },
          { label: 'High Risk', value: overview.highRiskStudentCount || 0 },
          { label: 'Total Backlogs', value: overview.totalBacklogs || 0 },
        ]} columns={['label', 'value']} />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function TableCard({ title, rows, columns }) {
  return (
    <div className="card p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              {columns.map((column) => (
                <th key={column} className="pb-2 pr-4 uppercase tracking-wide text-xs font-semibold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-gray-100">
                {columns.map((column) => (
                  <td key={`${column}-${index}`} className="py-2 pr-4 text-gray-700">
                    {typeof row[column] === 'number' ? Number(row[column]).toFixed(row[column] % 1 === 0 ? 0 : 2) : row[column] ?? '—'}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="py-4 text-gray-500" colSpan={columns.length}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
