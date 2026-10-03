import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

export default function StudentClass() {
  const [studentClass, setStudentClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClass = async () => {
      try {
        const response = await api.get('/classes', { params: { limit: 20 } });
        const classes = response.data?.data?.classes || [];
        const myClass = classes[0] || null;
        setStudentClass(myClass);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load class information');
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, []);

  return (
    <Layout role="STUDENT">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Class</h1>
          <p className="text-gray-600 mt-2">Your assigned class and academic details</p>
        </div>

        {loading && <div className="card p-6 text-gray-600">Loading class information…</div>}
        {error && <div className="card p-6 text-red-600">{error}</div>}

        {!loading && !error && !studentClass && (
          <div className="card p-6 text-gray-600">No class is currently assigned to your account.</div>
        )}

        {studentClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="card p-5">
              <p className="text-sm text-gray-500">Class</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{studentClass.name}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Section</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{studentClass.section || '—'}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Department</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{studentClass.department || '—'}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Semester</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{studentClass.semester || '—'}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{studentClass.academicYear || '—'}</p>
            </div>
          </div>
        )}

        {studentClass && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Class overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div><span className="font-medium text-gray-900">Status:</span> {studentClass.status}</div>
              <div><span className="font-medium text-gray-900">Academic year:</span> {studentClass.academicYear}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
