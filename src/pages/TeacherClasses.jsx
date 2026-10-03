import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await api.get('/classes', { params: { limit: 100 } });
        setClasses(response.data?.data?.classes || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load assigned classes');
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, []);

  return (
    <Layout role="TEACHER">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-2">Classes assigned to you for teaching</p>
        </div>

        {loading && <div className="card p-6 text-gray-600">Loading classes…</div>}
        {error && <div className="card p-6 text-red-600">{error}</div>}

        {!loading && !error && classes.length === 0 && (
          <div className="card p-6 text-gray-600">You currently have no assigned classes.</div>
        )}

        {!loading && classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map((item) => (
              <div key={item._id} className="card p-5">
                <p className="text-xs uppercase tracking-wide font-semibold text-primary-600">{item.department}</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">{item.name}</h2>
                <p className="mt-1 text-gray-600">Section: {item.section || '—'}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  <div><span className="font-medium text-gray-900">Semester:</span> {item.semester || '—'}</div>
                  <div><span className="font-medium text-gray-900">Year:</span> {item.academicYear || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
