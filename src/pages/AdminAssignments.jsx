import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { Plus, Edit2, Search, Link2 } from 'lucide-react';
import api from '../services/api';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({ teacherId: '', classId: '', subjectId: '', academicYear: '', semester: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assignResp, teachResp, classResp, subjResp] = await Promise.all([
          api.get('/assignments', { params: { page, limit: 20 } }),
          api.get('/teachers', { params: { limit: 1000 } }),
          api.get('/classes', { params: { limit: 1000 } }),
          api.get('/subjects', { params: { limit: 1000 } })
        ]);
        setAssignments(assignResp.data.data.assignments);
        setTeachers(teachResp.data.data.teachers);
        setClasses(classResp.data.data.classes);
        setSubjects(subjResp.data.data.subjects);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment._id}`, formData);
      } else {
        await api.post('/assignments', formData);
      }
      setFormData({ teacherId: '', classId: '', subjectId: '', academicYear: '', semester: '' });
      setEditingAssignment(null);
      setShowForm(false);
      const resp = await api.get('/assignments', { params: { page, limit: 20 } });
      setAssignments(resp.data.data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleStatusToggle = async (assignment) => {
    try {
      const newStatus = assignment.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/assignments/${assignment._id}/status`, { status: newStatus });
      const resp = await api.get('/assignments', { params: { page, limit: 20 } });
      setAssignments(resp.data.data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment status');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      teacherId: assignment.teacherId._id,
      classId: assignment.classId._id,
      subjectId: assignment.subjectId._id,
      academicYear: assignment.academicYear,
      semester: assignment.semester || ''
    });
    setShowForm(true);
  };

  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teaching Assignments</h1>
          <p className="text-gray-600">Assign teachers to classes and subjects</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Assignments" value={assignments.length} icon={Link2} />
          <StatCard title="Active Assignments" value={assignments.filter(a => a.status === 'ACTIVE').length} icon={Link2} color="green" />
          <StatCard title="Inactive Assignments" value={assignments.filter(a => a.status === 'INACTIVE').length} icon={Link2} color="amber" />
        </div>

        <div className="card mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 mb-4">
              <div className="flex-1" />
              <button onClick={() => { setShowForm(true); setEditingAssignment(null); setFormData({ teacherId: '', classId: '', subjectId: '', academicYear: '', semester: '' }); }} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Add Assignment
              </button>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} className="input" required>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="input" required>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                  </select>
                  <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="input" required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
                  </select>
                  <input type="text" placeholder="Academic Year" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="input" required />
                  <input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="input" min="1" max="10" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingAssignment(null); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-6"><EmptyState title="No assignments" description="Create your first assignment" icon={Link2} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{assignment.teacherId.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.classId.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.subjectId.subjectCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{assignment.academicYear}</td>
                      <td className="px-6 py-3 text-sm"><span className={`badge ${assignment.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{assignment.status}</span></td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(assignment)} className="text-primary-600 hover:text-primary-700"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleStatusToggle(assignment)} className="text-amber-600 hover:text-amber-700">{assignment.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
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
