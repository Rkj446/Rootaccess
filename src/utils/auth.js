const AUTH_KEY = 'student_performance_auth';

export const authService = {
  login: (user) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return localStorage.getItem(AUTH_KEY) !== null;
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },
};

export const ROLES = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};

export const ROUTES = {
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    PERFORMANCE: '/student/performance',
    ATTENDANCE: '/student/attendance',
    RESULTS: '/student/results',
    PROFILE: '/student/profile',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    STUDENTS: '/teacher/students',
    ANALYTICS: '/teacher/analytics',
    ATTENDANCE: '/teacher/attendance',
    REPORTS: '/teacher/reports',
    PROFILE: '/teacher/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    TEACHERS: '/admin/teachers',
    CLASSES: '/admin/classes',
    SUBJECTS: '/admin/subjects',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
};

export const getDefaultRoute = (role) => {
  switch (role) {
    case ROLES.STUDENT:
      return ROUTES.STUDENT.DASHBOARD;
    case ROLES.TEACHER:
      return ROUTES.TEACHER.DASHBOARD;
    case ROLES.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return '/';
  }
};
