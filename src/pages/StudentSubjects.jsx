import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await api.get('/subjects', { params: { limit: 100 } });
        setSubjects(response.data?.data?.subjects || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load subjects');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-2">Subjects assigned to your class and academic schedule</p>
        </div>

        {loading && <div className="card p-6 text-gray-600">Loading subjects…</div>}
        {error && <div className="card p-6 text-red-600">{error}</div>}

        {!loading && !error && subjects.length === 0 && (
          <div className="card p-6 text-gray-600">No subjects are currently assigned to your class.</div>
        )}

        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div key={subject._id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{subject.subjectCode}</p>
                    <h2 className="mt-2 text-xl font-bold text-gray-900">{subject.subjectName}</h2>
                  </div>
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">{subject.status}</span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Department:</span> {subject.department}</p>
                  <p><span className="font-medium text-gray-900">Semester:</span> {subject.semester || '—'}</p>
                  <p><span className="font-medium text-gray-900">Credits:</span> {subject.credits}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
