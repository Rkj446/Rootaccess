// Student dashboard data
export const studentKPIData = {
  overallScore: 86.4,
  finalCGPA: 8.72,
  attendance: 91.4,
  studyHours: 5.2,
  previousCGPA: 8.31,
  riskLevel: 'Low',
};

export const academicPerformanceData = [
  { subject: 'Internal', marks: 85 },
  { subject: 'Assignment', marks: 88 },
  { subject: 'Midterm', marks: 82 },
  { subject: 'Lab', marks: 91 },
  { subject: 'Final', marks: 86 },
];

export const performanceTrendData = [
  { week: 'Week 1', score: 68 },
  { week: 'Week 2', score: 72 },
  { week: 'Week 3', score: 74 },
  { week: 'Week 4', score: 78 },
  { week: 'Week 5', score: 81 },
  { week: 'Week 6', score: 86 },
];

export const studentInsights = {
  strongAreas: [
    { subject: 'Programming', score: 91 },
    { subject: 'Database', score: 87 },
    { subject: 'Algorithms', score: 85 },
  ],
  needsAttention: [
    { subject: 'Mathematics', score: 68 },
    { subject: 'Networking', score: 71 },
    { subject: 'Physics', score: 73 },
  ],
  recommendedPractice: [
    { subject: 'Database', topic: 'Normalization' },
    { subject: 'Programming', topic: 'Recursion' },
    { subject: 'Mathematics', topic: 'Calculus' },
  ],
};

export const studentBehaviourData = [
  { category: 'Attendance', value: 91.4, unit: '%' },
  { category: 'Study', value: 5.2, unit: 'hrs/day' },
  { category: 'Sleep', value: 7.1, unit: 'hrs/day' },
  { category: 'Participation', value: 88, unit: '%' },
  { category: 'Backlogs', value: 0, unit: '' },
];

// Teacher dashboard data
export const teacherKPIData = {
  totalStudents: 120,
  averageCGPA: 7.84,
  averageScore: 74.6,
  averageAttendance: 82.3,
  studentsAtRisk: 14,
  studentsImproving: 37,
};

export const performanceDistributionData = [
  { category: 'Excellent', count: 28, color: '#10b981' },
  { category: 'Good', count: 45, color: '#3b82f6' },
  { category: 'Average', count: 32, color: '#f59e0b' },
  { category: 'Poor', count: 15, color: '#ef4444' },
];

export const riskDistributionData = [
  { category: 'Low', count: 78, color: '#10b981' },
  { category: 'Medium', count: 28, color: '#f59e0b' },
  { category: 'High', count: 14, color: '#ef4444' },
];

export const subjectPerformanceData = [
  { subject: 'Mathematics', score: 68.2 },
  { subject: 'Science', score: 74.5 },
  { subject: 'English', score: 71.8 },
  { subject: 'Programming', score: 82.3 },
  { subject: 'Database', score: 79.6 },
];

export const attendanceDistributionData = [
  { range: '90-100%', count: 45 },
  { range: '80-89%', count: 38 },
  { range: '70-79%', count: 25 },
  { range: '60-69%', count: 10 },
  { range: '<60%', count: 2 },
];

// Admin dashboard data
export const adminKPIData = {
  totalStudents: 300,
  totalTeachers: 24,
  totalClasses: 18,
  averageCGPA: 7.82,
  averageAttendance: 84.3,
  averageScore: 76.8,
};

export const studentsByMajorData = [
  { major: 'Computer Science', count: 85 },
  { major: 'Information Technology', count: 72 },
  { major: 'Electronics', count: 58 },
  { major: 'Mechanical', count: 45 },
  { major: 'Civil', count: 40 },
];

export const performanceByMajorData = [
  { major: 'Computer Science', cgpa: 8.12 },
  { major: 'Information Technology', cgpa: 7.95 },
  { major: 'Electronics', cgpa: 7.34 },
  { major: 'Mechanical', cgpa: 7.68 },
  { major: 'Civil', cgpa: 7.42 },
];

export const cgpaByDepartmentData = [
  { department: 'CSE', cgpa: 8.04 },
  { department: 'IT', cgpa: 7.88 },
  { department: 'ECE', cgpa: 7.41 },
  { department: 'ME', cgpa: 7.72 },
  { department: 'CE', cgpa: 7.45 },
];

export const mockTeachers = [
  { id: 'T001', name: 'Dr. Sharma', subject: 'Mathematics', experience: '12 years' },
  { id: 'T002', name: 'Prof. Kumar', subject: 'Physics', experience: '8 years' },
  { id: 'T003', name: 'Ms. Reddy', subject: 'Chemistry', experience: '6 years' },
  { id: 'T004', name: 'Dr. Patel', subject: 'Computer Science', experience: '15 years' },
  { id: 'T005', name: 'Mr. Verma', subject: 'English', experience: '10 years' },
];

export const mockClasses = [
  { id: 'C001', name: 'CSE 3rd Year', students: 45, teacher: 'Dr. Patel' },
  { id: 'C002', name: 'IT 2nd Year', students: 38, teacher: 'Prof. Kumar' },
  { id: 'C003', name: 'ECE 4th Year', students: 32, teacher: 'Ms. Reddy' },
  { id: 'C004', name: 'ME 3rd Year', students: 28, teacher: 'Dr. Sharma' },
  { id: 'C005', name: 'CE 2nd Year', students: 25, teacher: 'Mr. Verma' },
];
