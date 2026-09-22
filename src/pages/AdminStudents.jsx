import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]); const [state, setState] = useState('loading'); const [error, setError] = useState('');
  useEffect(() => { api.get('/students').then(({ data }) => { setStudents(data.data.students); setState('ready'); }).catch((e) => { setError(e.response?.data?.message || 'Unable to load students'); setState('error'); }); }, []);
  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Management</h1>
        <div className="card p-6">
          {state === 'loading' && <p className="text-gray-600">Loading students…</p>}
          {state === 'error' && <p className="text-red-600">{error}</p>}
          {state === 'ready' && students.length === 0 && <p className="text-gray-600">No student records found. Import a CSV to get started.</p>}
          {students.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Student ID</th><th className="p-3">Major</th><th className="p-3">Score</th><th className="p-3">Risk</th></tr></thead><tbody>{students.map((student) => <tr key={student.studentId} className="border-b"><td className="p-3">{student.studentId}</td><td className="p-3">{student.major || '—'}</td><td className="p-3">{student.finalScore ?? '—'}</td><td className="p-3">{student.riskLevel || '—'}</td></tr>)}</tbody></table></div>}
        </div>
      </div>
    </Layout>
  );
}
