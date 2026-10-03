import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';

export default function TeacherReports() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedExam, setSelectedExam] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [formData, setFormData] = useState({ name: '', examType: 'INTERNAL', classId: '', subjectId: '', examDate: '', totalMarks: '', passingMarks: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examResp, assignResp] = await Promise.all([
          api.get('/exams', { params: { limit: 1000 } }),
          api.get('/assignments', { params: { limit: 1000 } })
        ]);
        setExams(examResp.data.data.exams);
        const classMap = {};
        const subjectMap = {};
        assignResp.data.data.assignments.forEach(a => {
          classMap[a.classId._id] = a.classId;
          subjectMap[a.subjectId._id] = a.subjectId;
        });
        setClasses(Object.values(classMap));
        setSubjects(Object.values(subjectMap));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', formData);
      setFormData({ name: '', examType: 'INTERNAL', classId: '', subjectId: '', examDate: '', totalMarks: '', passingMarks: '' });
      setShowForm(false);
      const resp = await api.get('/exams', { params: { limit: 1000 } });
      setExams(resp.data.data.exams);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId);
    const exam = exams.find(e => e._id === examId);
    if (exam) {
      try {
        const resp = await api.get(`/classes/${exam.classId._id}/students`);
        setStudents(resp.data.data.students);
        setMarks({});
      } catch (err) {
        setError('Failed to load students');
      }
    }
  };

  const handleMarksChange = (studentId, marksValue) => {
    setMarks({ ...marks, [studentId]: marksValue });
  };

  const handleSubmitMarks = async () => {
    try {
      const selectedExamData = exams.find(e => e._id === selectedExam);
      const results = Object.entries(marks).map(([studentId, marksObtained]) => ({ studentId, marksObtained }));
      await api.post('/results/bulk', {
        examId: selectedExam,
        subjectId: selectedExamData.subjectId._id,
        results
      });
      alert('Marks submitted successfully');
      setSelectedExam('');
      setMarks({});
      setStudents([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit marks');
    }
  };

  return (
    <Layout role="TEACHER">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Exams & Results</h1>
          <p className="text-gray-600">Create exams and enter student marks</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Exams" value={exams.length} icon={Plus} />
          <StatCard title="Classes" value={classes.length} icon={Plus} color="green" />
          <StatCard title="Subjects" value={subjects.length} icon={Plus} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Exam Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Create Exam</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <input type="text" placeholder="Exam Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
              <select value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} className="input">
                <option value="INTERNAL">Internal</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="LAB">Lab</option>
              </select>
              <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} className="input" required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="input" required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode}</option>)}
              </select>
              <input type="date" value={formData.examDate} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })} className="input" required />
              <input type="number" placeholder="Total Marks" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })} className="input" required />
              <input type="number" placeholder="Passing Marks" value={formData.passingMarks} onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })} className="input" required />
              <button type="submit" className="btn-primary w-full">Create Exam</button>
            </form>
          </div>

          {/* Enter Marks Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Enter Marks</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
              <select value={selectedExam} onChange={(e) => handleExamSelect(e.target.value)} className="input">
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            {selectedExam && students.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Marks</label>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {students.map(student => (
                    <div key={student._id} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600 flex-1">{student.studentId}</span>
                      <input
                        type="number"
                        placeholder="Marks"
                        value={marks[student._id] || ''}
                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                        className="input w-24"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleSubmitMarks} className="btn-primary w-full">Submit Marks</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
