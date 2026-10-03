import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, DataTable, EmptyState } from '../components/CommonComponents';
import { Plus, Edit2, Trash2, Search, Users, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(1);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/teachers', {
        params: {
          page,
          limit: 20,
          search: searchTerm,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }
      });
      setTeachers(response.data.data.teachers);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [page, searchTerm, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, { name: formData.name, email: formData.email });
      } else {
        if (!formData.password) return setError('Password is required');
        await api.post('/teachers', formData);
      }
      setFormData({ name: '', email: '', password: '' });
      setShowPassword(false);
      setEditingTeacher(null);
      setShowForm(false);
      loadTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save teacher');
    }
  };

  const handleStatusToggle = async (teacher) => {
    try {
      const newStatus = teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/teachers/${teacher.id}/status`, { status: newStatus });
      loadTeachers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teacher status');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({ name: teacher.name, email: teacher.email, password: '' });
    setShowForm(true);
  };

  return (
    <Layout role="ADMIN">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Management</h1>
          <p className="text-gray-600">Manage all teachers in the system</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Teachers" value={teachers.length} icon={Users} />
          <StatCard title="Active Teachers" value={teachers.filter(t => t.status === 'ACTIVE').length} icon={Users} color="green" />
          <StatCard title="Inactive Teachers" value={teachers.filter(t => t.status === 'INACTIVE').length} icon={Users} color="amber" />
        </div>

        <div className="card mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="input pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <button onClick={() => { setShowForm(true); setEditingTeacher(null); setFormData({ name: '', email: '', password: '' }); }} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                Add Teacher
              </button>
            </div>
          </div>

          {showForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                  {!editingTeacher && (
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingTeacher(null); }} className="btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading teachers...</div>
          ) : teachers.length === 0 ? (
            <div className="p-6"><EmptyState title="No teachers" description="Add your first teacher to get started" icon={Users} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{teacher.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{teacher.email}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`badge ${teacher.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(teacher)} className="text-primary-600 hover:text-primary-700">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusToggle(teacher)} className="text-amber-600 hover:text-amber-700">
                            {teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
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
