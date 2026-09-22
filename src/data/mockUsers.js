export const mockUsers = [
  {
    id: 1,
    email: 'student@example.com',
    password: 'student123',
    name: 'Rahul Sharma',
    role: 'STUDENT',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
  },
  {
    id: 2,
    email: 'teacher@example.com',
    password: 'teacher123',
    name: 'Dr. Priya Sharma',
    role: 'TEACHER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  },
  {
    id: 3,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
];

export const validateCredentials = (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  return user ? { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } } : { success: false };
};
