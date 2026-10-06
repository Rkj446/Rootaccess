import studentAvatar from '../assets/avatars/student-default.svg';
import teacherAvatar from '../assets/avatars/teacher-default.svg';

export const mockUsers = [
  {
    id: 1,
    email: 'student@example.com',
    password: 'student123',
    name: 'Rahul Sharma',
    role: 'STUDENT',
    avatar: studentAvatar,
  },
  {
    id: 2,
    email: 'teacher@example.com',
    password: 'teacher123',
    name: 'Dr. Priya Sharma',
    role: 'TEACHER',
    avatar: teacherAvatar,
  },
];

export const validateCredentials = (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  return user ? { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } } : { success: false };
};
