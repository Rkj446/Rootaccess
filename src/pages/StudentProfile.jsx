import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
export default function StudentProfile() {
  const [state, setState] = useState({ loading: true, error: '', student: null });
  useEffect(() => { api.get('/students/me').then(({ data }) => setState({ loading: false, error: '', student: data.data.student })).catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Unable to load profile', student: null })); }, []);
  const s = state.student;
  return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">My Profile</h1>{state.loading && <div className="card p-6 text-gray-600">Loading profile…</div>}{state.error && <div className="card p-6 text-red-600">{state.error}</div>}{s && <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700"><p><b>Student ID:</b> {s.studentId}</p><p><b>Major:</b> {s.major || 'Unavailable'}</p><p><b>Age:</b> {s.age || 'Unavailable'}</p><p><b>Gender:</b> {s.gender || 'Unavailable'}</p><p><b>Class:</b> {s.classId ? `${s.classId.name}${s.classId.section ? ` (${s.classId.section})` : ''}` : 'Not assigned'}</p><p><b>Department:</b> {s.classId?.department || s.major || 'Unavailable'}</p></div>}</div></Layout>;
}
