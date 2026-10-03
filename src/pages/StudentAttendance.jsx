import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState({ summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }, bySubject: [] });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const studentResp = await api.get('/students/me');
        const studentId = studentResp.data.data.student._id;
        const [summaryResp, recordsResp] = await Promise.all([
          api.get(`/attendance/student/${studentId}/summary`),
          api.get('/attendance', { params: { studentId, limit: 1000 } })
        ]);
        setAttendance(summaryResp.data.data);
        setRecords(recordsResp.data.data.records);
        setError('');
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load attendance');
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, []);

  if (loading) {
    return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">Attendance</h1><div className="card p-6 text-gray-600">Loading attendance…</div></div></Layout>;
  }

  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
          <p className="text-gray-600">View your attendance records and statistics</p>
        </div>

        {error && <div className="card p-6 text-red-600">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Attendance %" value={`${attendance.summary.percentage}%`} icon={TrendingUp} color="green" />
          <StatCard title="Present" value={attendance.summary.present} icon={CheckCircle} color="green" />
          <StatCard title="Absent" value={attendance.summary.absent} icon={XCircle} color="red" />
          <StatCard title="Late" value={attendance.summary.late} icon={Clock} color="amber" />
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Subject-wise Attendance</h3>
          {attendance.bySubject.length === 0 ? <EmptyState title="No attendance data" description="No attendance records available yet" icon={CheckCircle} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Present</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Absent</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Late</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">%</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.bySubject.map((subject) => (
                    <tr key={subject._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{subject.subject.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.total}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.present}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.absent}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.late}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.total > 0 ? ((subject.present / subject.total) * 100).toFixed(2) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Attendance Records</h3>
          {records.length === 0 ? <EmptyState title="No records" description="No recent attendance records" icon={CheckCircle} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{record.subjectId.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{record.classId.name}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`badge ${record.status === 'PRESENT' ? 'badge-success' : record.status === 'LATE' ? 'badge-warning' : 'badge-danger'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
