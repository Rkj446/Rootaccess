import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { Plus, Edit2, Search, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', section: '', department: '', semester: '', academicYear: '' });
  const [assignmentClass, setAssignmentClass] = useState(null);
  const [assignmentStudentId, setAssignmentStudentId] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [page, setPage] = useState(1);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/classes', {
        params: { page, limit: 20, search: searchTerm, status: statusFilter !== 'ALL' ? statusFilter : undefined }
      });
      setClasses(response.data.data.classes);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [page, searchTerm, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await api.put(`/classes/${editingClass._id}`, formData);
      } else {
        await api.post('/classes', formData);
      }
      setFormData({ name: '', section: '', department: '', semester: '', academicYear: '' });
      setEditingClass(null);
      setShowForm(false);
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save class');
    }
  };

  const handleStatusToggle = async (cls) => {
    try {
      const newStatus = cls.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/classes/${cls._id}/status`, { status: newStatus });
      loadClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update class status');
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, section: cls.section || '', department: cls.department, semester: cls.semester || '', academicYear: cls.academicYear });
    setShowForm(true);
  };

  const handleOpenAssignment = async (cls) => {
    setAssignmentClass(cls);
    setAssignmentStudentId('');
    try {
      const response = await api.get(`/classes/${cls._id}/students`);
      setClassStudents(response.data.data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load class students');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!assignmentClass) return;
    try {
      await api.put(`/classes/${assignmentClass._id}/students`, { studentId: assignmentStudentId });
      const response = await api.get(`/classes/${assignmentClass._id}/students`);
      setClassStudents(response.data.data.students);
      setAssignmentStudentId('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student');
    }
  };

  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Management</h1>
          <p className="text-gray-600">Manage academic classes</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Classes" value={classes.length} icon={BookOpen} />
          <StatCard title="Active Classes" value={classes.filter(c => c.status === 'ACTIVE').length} icon={BookOpen} color="green" />
          <StatCard title="Inactive Classes" value={classes.filter(c => c.status === 'INACTIVE').length} icon={BookOpen} color="amber" />
        </div>

        <div className="card mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, section or department..."
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
              <button onClick={() => { setShowForm(true); setEditingClass(null); setFormData({ name: '', section: '', department: '', semester: '', academicYear: '' }); }} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Add Class
              </button>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
                  <input type="text" placeholder="Section" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} className="input" />
                  <input type="text" placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input" required />
                  <input type="number" placeholder="Semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="input" min="1" max="10" />
                  <input type="text" placeholder="Academic Year (e.g., 2024-25)" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="input" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingClass(null); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {assignmentClass && (
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold">Students in {assignmentClass.name}</h2>
                <button type="button" onClick={() => setAssignmentClass(null)} className="btn-outline">Close</button>
              </div>
              <form onSubmit={handleAssignStudent} className="flex flex-wrap gap-3 mb-4">
                <input type="text" placeholder="Student ID (e.g. S00001)" value={assignmentStudentId} onChange={(e) => setAssignmentStudentId(e.target.value)} className="input flex-1 min-w-56" required />
                <button type="submit" className="btn-primary">Assign Student</button>
              </form>
              <p className="text-sm text-gray-600">Assigned students: {classStudents.length}</p>
              {classStudents.length > 0 && <p className="text-sm text-gray-700 mt-2">{classStudents.slice(0, 12).map((student) => student.studentId).join(', ')}</p>}
            </div>
          )}

          {loading ? <div className="p-6 text-center text-gray-600">Loading classes...</div> : classes.length === 0 ? <div className="p-6"><EmptyState title="No classes" description="Add your first class to get started" icon={BookOpen} /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Academic Year</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr key={cls._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{cls.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cls.section || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cls.department}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cls.semester || '—'}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cls.academicYear}</td>
                      <td className="px-6 py-3 text-sm"><span className={`badge ${cls.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{cls.status}</span></td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(cls)} className="text-primary-600 hover:text-primary-700"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenAssignment(cls)} className="text-primary-600 hover:text-primary-700">Assign student</button>
                          <button onClick={() => handleStatusToggle(cls)} className="text-amber-600 hover:text-amber-700">{cls.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
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
