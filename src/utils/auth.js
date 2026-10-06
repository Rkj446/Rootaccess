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
    PROFILE: '/profile',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    STUDENTS: '/teacher/students',
    ANALYTICS: '/teacher/analytics',
    ATTENDANCE: '/teacher/attendance',
    REPORTS: '/teacher/reports',
    PROFILE: '/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    TEACHERS: '/admin/teachers',
    CLASSES: '/admin/classes',
    SUBJECTS: '/admin/subjects',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    PROFILE: '/profile',
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
