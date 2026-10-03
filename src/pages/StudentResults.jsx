import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({ overall: { avgPercentage: 0, totalExams: 0 }, subjectWise: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      try {
        const studentResp = await api.get('/students/me');
        const studentId = studentResp.data.data.student._id;
        const [resultsResp, summaryResp] = await Promise.all([
          api.get('/results', { params: { studentId } }),
          api.get(`/results/student/${studentId}`)
        ]);
        setResults(resultsResp.data.data.results);
        setSummary(summaryResp.data.data);
        setError('');
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load results');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

  if (loading) {
    return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">Exam Results</h1><div className="card p-6 text-gray-600">Loading results…</div></div></Layout>;
  }

  if (error) {
    return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">Exam Results</h1><div className="card p-6 text-red-600">{error}</div></div></Layout>;
  }

  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Results</h1>
          <p className="text-gray-600">View your academic performance and exam results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Overall Average" value={`${summary.overall.avgPercentage.toFixed(2)}%`} icon={TrendingUp} color="green" />
          <StatCard title="Total Exams" value={summary.overall.totalExams} icon={BookOpen} />
          <StatCard title="Subjects" value={summary.subjectWise.length} icon={Award} color="blue" />
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
          {summary.subjectWise.length === 0 ? <EmptyState title="No results" description="No exam results recorded yet" icon={BookOpen} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Average Marks</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Average %</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exams Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.subjectWise.map((subject) => (
                    <tr key={subject._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{subject.subject.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.avgMarks.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.avgPercentage.toFixed(2)}%</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.examsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
          {results.length === 0 ? <EmptyState title="No exam results" description="No detailed exam results recorded yet" icon={BookOpen} /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{result.examId.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{result.subjectId.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{new Date(result.examId.examDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{result.marksObtained}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{result.totalMarks}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{result.percentage.toFixed(2)}%</td>
                      <td className="px-6 py-3 text-sm"><span className={`badge ${result.grade === 'F' ? 'badge-danger' : result.grade === 'D' ? 'badge-warning' : 'badge-success'}`}>{result.grade}</span></td>
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
