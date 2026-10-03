import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/auth';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudentPerformance from './pages/StudentPerformance';
import StudentAttendance from './pages/StudentAttendance';
import StudentResults from './pages/StudentResults';
import StudentProfile from './pages/StudentProfile';
import StudentAnalytics from './pages/StudentAnalytics';
import StudentClass from './pages/StudentClass';
import StudentSubjects from './pages/StudentSubjects';

import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStudents from './pages/TeacherStudents';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherReports from './pages/TeacherReports';
import TeacherClasses from './pages/TeacherClasses';
import TeacherSubjects from './pages/TeacherSubjects';
import TeacherProfile from './pages/TeacherProfile';

import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminTeachers from './pages/AdminTeachers';
import AdminClasses from './pages/AdminClasses';
import AdminSubjects from './pages/AdminSubjects';
import AdminAssignments from './pages/AdminAssignments';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminML from './pages/AdminML';
import AdminImport from './pages/AdminImport';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/performance"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentPerformance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/class"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subjects"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/analytics"
          element={
            <ProtectedRoute requiredRole={ROLES.STUDENT}>
              <StudentAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/reports"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/subjects"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute requiredRole={ROLES.TEACHER}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/results" element={<Navigate to="/teacher/reports" replace />} />
        <Route path="/teacher/marks" element={<Navigate to="/teacher/reports" replace />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminSubjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assignments"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ml"
          element={
            <ProtectedRoute requiredRole={ROLES.ADMIN}>
              <AdminML />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/import" element={<ProtectedRoute requiredRole={ROLES.ADMIN}><AdminImport /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
