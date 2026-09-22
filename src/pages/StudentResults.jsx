import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
export default function StudentResults() {
  const [state, setState] = useState({ loading: true, error: '', performance: null });
  useEffect(() => { api.get('/students/me/performance').then(({ data }) => setState({ loading: false, error: '', performance: data.data.performance })).catch((e) => setState({ loading: false, error: e.response?.data?.message || 'Unable to load results', performance: null })); }, []);
  return <Layout role="STUDENT"><div className="p-6 space-y-6"><h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>{state.loading && <div className="card p-6 text-gray-600">Loading results…</div>}{state.error && <div className="card p-6 text-red-600">{state.error}</div>}{state.performance && <div className="card p-6"><p className="text-gray-700">Final score: <strong>{state.performance.finalScore}%</strong></p><p className="text-gray-700 mt-2">Detailed exam/subject results are unavailable in the current dataset.</p></div>}</div></Layout>;
}
