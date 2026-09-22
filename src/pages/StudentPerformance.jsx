import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/CommonComponents';
import { TrendingUp, Award, Calendar } from 'lucide-react';
import api from '../services/api';
export default function StudentPerformance() {
  const [state, setState] = useState({ loading: true, error: '', performance: null });
  useEffect(() => { api.get('/students/me/performance').then(({ data }) => setState({ loading: false, error: '', performance: data.data.performance })).catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Unable to load performance', performance: null })); }, []);
  const p = state.performance;
  return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">My Performance</h1>{state.loading && <div className="card p-6 text-gray-600">Loading performance…</div>}{state.error && <div className="card p-6 text-red-600">{state.error}</div>}{p && <><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><StatCard title="Final Score" value={`${p.finalScore}%`} icon={TrendingUp} color="primary" /><StatCard title="Final CGPA" value={p.finalCgpa} icon={Award} color="green" /><StatCard title="Attendance" value={`${p.attendancePct}%`} icon={Calendar} color="amber" /></div><div className="card p-6 text-gray-600">Subject-level performance details are not available in the current dataset.</div></>}</div></Layout>;
}
