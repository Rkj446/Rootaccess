import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminProfile from './AdminProfile';
import StudentProfile from './StudentProfile';
import TeacherProfile from './TeacherProfile';

export default function ProfileSettings() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'STUDENT':
      return <StudentProfile />;
    case 'TEACHER':
      return <TeacherProfile />;
    case 'ADMIN':
      return <AdminProfile />;
    default:
      return <Navigate to="/" replace />;
  }
}
