import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { StatCard, EmptyState } from '../components/CommonComponents';
import { Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function TeacherAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const resp = await api.get('/assignments', { params: { limit: 1000 } });
        const classMap = {};
        const subjectMap = {};
        resp.data.data.assignments.forEach(a => {
          classMap[a.classId._id] = a.classId;
          subjectMap[a.subjectId._id] = a.subjectId;
        });
        setClasses(Object.values(classMap));
        setSubjects(Object.values(subjectMap));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignments');
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    setSelectedSubject('');
    setStudents([]);
    try {
      const resp = await api.get(`/classes/${classId}/students`);
      setStudents(resp.data.data.students);
    } catch (err) {
      setError('Failed to load students');
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setAttendanceRecords({});
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords({ ...attendanceRecords, [studentId]: status });
  };

  const handleSubmitAttendance = async () => {
    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({ studentId, status }));
      await api.post('/attendance/bulk', {
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        records
      });
      alert('Attendance submitted successfully');
      setShowForm(false);
      setAttendanceRecords({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance');
    }
  };

  return (
    <Layout role="TEACHER">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">Record student attendance for your classes</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

        {!showForm && <button onClick={() => setShowForm(true)} className="btn-primary gap-2 mb-6"><Plus className="w-5 h-5" /> Mark Attendance</button>}

        {showForm && (
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="input">
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={selectedSubject} onChange={(e) => handleSubjectChange(e.target.value)} className="input" disabled={!selectedClass}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input" />
              </div>
            </div>

            {selectedClass && selectedSubject && students.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4">Student Attendance</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map(student => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{student.studentId} - {student.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleAttendanceChange(student._id, 'PRESENT')} className={`px-3 py-1 rounded text-sm ${attendanceRecords[student._id] === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          <CheckCircle className="w-4 h-4 inline mr-1" /> Present
                        </button>
                        <button onClick={() => handleAttendanceChange(student._id, 'ABSENT')} className={`px-3 py-1 rounded text-sm ${attendanceRecords[student._id] === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                          <XCircle className="w-4 h-4 inline mr-1" /> Absent
                        </button>
                        <button onClick={() => handleAttendanceChange(student._id, 'LATE')} className={`px-3 py-1 rounded text-sm ${attendanceRecords[student._id] === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
                          <Clock className="w-4 h-4 inline mr-1" /> Late
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSubmitAttendance} className="btn-primary">Submit Attendance</button>
                  <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Classes Assigned" value={classes.length} icon={CheckCircle} color="green" />
          <StatCard title="Subjects" value={subjects.length} icon={CheckCircle} color="blue" />
          <StatCard title="Students" value={students.length} icon={CheckCircle} color="amber" />
        </div>
      </div>
    </Layout>
  );
}
