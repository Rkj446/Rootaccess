import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

export default function AdminML() {
  const [health, setHealth] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [healthResponse, studentsResponse] = await Promise.all([
          api.get('/ml/health'),
          api.get('/students', { params: { limit: 100 } }),
        ]);

        setHealth(healthResponse.data?.data || null);
        const studentList = studentsResponse.data?.data?.students || [];
        setStudents(studentList);
        if (studentList[0]) {
          setSelectedStudent(studentList[0]._id);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load ML status');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const runTraining = async () => {
    setProcessing(true);
    setError('');
    try {
      const response = await api.post('/ml/train', { force: true });
      setTraining(response.data?.data || null);
      const healthResponse = await api.get('/ml/health');
      setHealth(healthResponse.data?.data || health);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to start model training');
    } finally {
      setProcessing(false);
    }
  };

  const runPrediction = async () => {
    if (!selectedStudent) return;
    setProcessing(true);
    setError('');
    try {
      const student = students.find((entry) => entry._id === selectedStudent);
      if (!student) {
        throw new Error('No selected student found');
      }

      const payload = {
        studentId: student.studentId,
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

      const response = await api.post('/ml/predict/risk', payload);
      setPrediction(response.data?.data || null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to generate prediction');
    } finally {
      setProcessing(false);
    }
  };

  const predictedRisk = prediction?.prediction || prediction?.risk_level || prediction?.riskLevel;
  const predictedProbability = prediction?.probabilities?.[predictedRisk]
    ?? prediction?.probability
    ?? prediction?.risk_probability;

  return (
    <Layout role="ADMIN">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ML & Risk Analytics</h1>
            <p className="text-gray-600 mt-2">Model health, training, and risk monitoring</p>
          </div>
          <button onClick={runTraining} className="btn-primary" disabled={processing}>
            {processing ? 'Processing…' : 'Train model'}
          </button>
        </div>

        {loading && <div className="card p-6 text-gray-600">Loading ML status…</div>}
        {error && <div className="card p-6 text-red-600">{error}</div>}

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="text-sm text-gray-500">Model status</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{health.status || 'ready'}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Model available</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{health.model_available ? 'Yes' : 'No'}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Version</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{health.model_version || health.modelVersion || 'n/a'}</p>
            </div>
          </div>
        )}

        {health && (
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Model details</h2>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Model type:</span> {health.model_type || health.modelType || 'n/a'}</p>
                <p><span className="font-medium text-gray-900">Last trained:</span> {health.training_date || health.trainingDate || 'n/a'}</p>
                <p><span className="font-medium text-gray-900">Training rows:</span> {health.dataset_rows ?? health.datasetRows ?? 'n/a'}</p>
                <p><span className="font-medium text-gray-900">Train split:</span> {health.train_rows ?? health.trainRows ?? 'n/a'}</p>
                <p><span className="font-medium text-gray-900">Test split:</span> {health.test_rows ?? health.testRows ?? 'n/a'}</p>
              </div>
            </div>

            {(health.features || health.featureNames) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Model features</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(health.features || health.featureNames).map((feature) => (
                    <span key={feature} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{feature}</span>
                  ))}
                </div>
              </div>
            )}

            {(training?.metrics || health.metrics) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Evaluation metrics</h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(training?.metrics || health.metrics)
                    .filter(([, value]) => typeof value === 'number')
                    .map(([metric, value]) => (
                      <div key={metric} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs capitalize text-gray-500">{metric}</p>
                        <p className="mt-1 font-semibold text-gray-900">{(value * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prediction check</h2>
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <select className="input" value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)}>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{student.name || student.studentId}</option>
                ))}
              </select>
            </div>
            <button onClick={runPrediction} className="btn-secondary" disabled={processing}>
              {processing ? 'Running…' : 'Predict risk'}
            </button>
          </div>

          {prediction && (
            <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-500">Prediction result</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-medium text-gray-900">Predicted risk:</span> {predictedRisk || 'n/a'}</div>
                <div><span className="font-medium text-gray-900">Risk probability:</span> {typeof predictedProbability === 'number' ? `${(predictedProbability * 100).toFixed(1)}%` : 'n/a'}</div>
                <div><span className="font-medium text-gray-900">Model version:</span> {prediction.modelVersion || prediction.model_version || 'n/a'}</div>
                <div><span className="font-medium text-gray-900">Status:</span> {prediction.status || 'ok'}</div>
              </div>
              {prediction.probabilities && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500">Probability by risk level</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-700">
                    {Object.entries(prediction.probabilities).map(([risk, probability]) => (
                      <span key={risk}>{risk}: {(probability * 100).toFixed(1)}%</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
