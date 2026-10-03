import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await api.get('/assignments', { params: { limit: 100 } });
        setAssignments(response.data?.data?.assignments || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load assignment summary');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  return (
    <Layout role="TEACHER">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Teaching account overview</p>
        </div>

        {loading && <div className="card p-6 text-gray-600">Loading profile…</div>}
        {error && <div className="card p-6 text-red-600">{error}</div>}

        {!loading && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-6">
              <p className="text-sm text-gray-500">Teacher name</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{user.name}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{user.email}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500">Role</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{user.role}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-gray-500">Account status</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{user.status}</p>
            </div>
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Teaching assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-primary-600 font-medium uppercase tracking-wide">{assignment.subjectId?.subjectCode || 'Subject'}</p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">{assignment.classId?.name || 'Class'}</h3>
                  <p className="mt-1 text-sm text-gray-600">{assignment.classId?.department || 'Department'} · {assignment.classId?.section || 'Section'}</p>
                  <p className="mt-4 text-sm text-gray-700">Academic year: {assignment.academicYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
