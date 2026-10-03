import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

export default function StudentAnalytics() {
  const [comparison, setComparison] = useState([]);
  const [overview, setOverview] = useState({});
  const [student, setStudent] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [comparisonRes, overviewRes, studentRes] = await Promise.all([
          api.get('/analytics/comparison'),
          api.get('/analytics/overview'),
          api.get('/students/me'),
        ]);
        setComparison(comparisonRes.data?.data?.comparisons || []);
        setOverview(overviewRes.data?.data || {});
        setStudent(studentRes.data?.data?.student || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load your analytics');
      }
    };
    load();
  }, []);

  const getPrediction = async () => {
    try {
      const { data } = await api.get('/students/me');
      const student = data?.data?.student;
      if (!student) return;
      const payload = {
        attendancePct: student.attendancePct,
        studyHoursPerDay: student.studyHoursPerDay,
        previousCgpa: student.previousCgpa,
        sleepHoursPerDay: student.sleepHoursPerDay,
        classParticipationPct: student.classParticipationPct,
        backlogs: student.backlogs,
        internalMarks: student.internalMarks,
        assignmentAvg: student.assignmentAvg,
        midtermMarks: student.midtermMarks,
        labMarks: student.labMarks,
      };
      const predictionResponse = await api.post('/ml/predict/risk', payload);
      setPrediction(predictionResponse.data?.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to get prediction');
    }
  };

  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Student</p>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Your Final CGPA" value={Number(student?.finalCgpa || 0).toFixed(2)} />
          <StatCard label="Your Attendance" value={`${Number(student?.attendancePct || 0).toFixed(1)}%`} />
          <StatCard label="Institution Students" value={overview.totalStudents || 0} />
        </div>

        <div className="card p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Dataset Comparison</h2>
            <button onClick={getPrediction} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Predict My Risk</button>
          </div>

          <div className="space-y-3">
            {comparison.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-gray-700 font-medium">{item.label}</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">You: {typeof item.student === 'number' ? item.student.toFixed(2) : item.student}</p>
                  <p className="text-sm text-gray-500">Dataset Average: {typeof item.datasetAverage === 'number' ? item.datasetAverage.toFixed(2) : item.datasetAverage}</p>
                </div>
              </div>
            ))}
          </div>

          {prediction && (
            <div className="mt-6 border border-blue-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Model Prediction</p>
              <p className="mt-2 text-xl font-bold text-blue-900">Predicted Risk: {prediction.prediction}</p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-900">
                {Object.entries(prediction.probabilities || {}).map(([label, score]) => (
                  <div key={label} className="bg-white rounded p-2 border border-blue-100">
                    <span className="font-medium">{label}</span>
                    <p>{Number(score).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
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
