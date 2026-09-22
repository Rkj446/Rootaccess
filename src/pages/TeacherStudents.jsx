import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]); const [state, setState] = useState('loading');
  useEffect(() => { api.get('/students').then(({ data }) => { setStudents(data.data.students); setState('ready'); }).catch(() => setState('error')); }, []);
  return (
    <Layout role="TEACHER">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Students</h1>
        <div className="card p-6">
          {state === 'loading' && <p className="text-gray-600">Loading students…</p>}
          {state === 'error' && <p className="text-red-600">Unable to load students.</p>}
          {state === 'ready' && !students.length && <p className="text-gray-600">No student records are available.</p>}
          {students.length > 0 && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><tbody>{students.map((student) => <tr key={student.studentId} className="border-b"><td className="p-3">{student.studentId}</td><td className="p-3">{student.major || '—'}</td><td className="p-3">{student.finalScore ?? '—'}</td></tr>)}</tbody></table></div>}
        </div>
      </div>
    </Layout>
  );
}
