import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { Plus, Edit2, Search, BookMarked } from 'lucide-react';
import api from '../services/api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ subjectCode: '', subjectName: '', department: '', semester: '', credits: '' });
  const [page, setPage] = useState(1);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subjects', {
        params: { page, limit: 20, search: searchTerm, status: statusFilter !== 'ALL' ? statusFilter : undefined }
      });
      setSubjects(response.data.data.subjects);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [page, searchTerm, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject._id}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      setFormData({ subjectCode: '', subjectName: '', department: '', semester: '', credits: '' });
      setEditingSubject(null);
      setShowForm(false);
      loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleStatusToggle = async (subject) => {
    try {
      const newStatus = subject.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/subjects/${subject._id}/status`, { status: newStatus });
      loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update subject status');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ subjectCode: subject.subjectCode, subjectName: subject.subjectName, department: subject.department, semester: subject.semester || '', credits: subject.credits });
    setShowForm(true);
  };

  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h1>
          <p className="text-gray-600">Manage all subjects</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Subjects" value={subjects.length} icon={BookMarked} />
          <StatCard title="Active Subjects" value={subjects.filter(s => s.status === 'ACTIVE').length} icon={BookMarked} color="green" />
          <StatCard title="Inactive Subjects" value={subjects.filter(s => s.status === 'INACTIVE').length} icon={BookMarked} color="amber" />
        </div>

        <div className="card mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="input pl-10"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input">
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <button onClick={() => { setShowForm(true); setEditingSubject(null); setFormData({ subjectCode: '', subjectName: '', department: '', semester: '', credits: '' }); }} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input type="text" placeholder="Code" value={formData.subjectCode} onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })} className="input" required />
                  <input type="text" placeholder="Subject Name" value={formData.subjectName} onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })} className="input" required />
                  <input type="text" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input" required />
                  <input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="input" min="1" max="10" />
                  <input type="number" placeholder="Credits" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} className="input" min="1" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingSubject(null); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? <div className="p-6 text-center text-gray-600">Loading subjects...</div> : subjects.length === 0 ? <div className="p-6"><EmptyState title="No subjects" description="Add your first subject to get started" icon={BookMarked} /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{subject.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-900">{subject.subjectName}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.department}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.semester || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{subject.credits}</td>
                      <td className="px-6 py-3 text-sm"><span className={`badge ${subject.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{subject.status}</span></td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(subject)} className="text-primary-600 hover:text-primary-700"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusToggle(subject)} className="text-amber-600 hover:text-amber-700">{subject.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
