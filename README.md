# Student Performance Management System - Phase 1

A polished, production-ready frontend prototype for a Student Performance Management System built with React, Vite, Tailwind CSS, and Recharts.

## 🎯 Features

### ✅ Phase 1 Complete
- **Role-Based Authentication** - Secure login with three user roles (Student, Teacher, Admin)
- **Protected Routes** - Role-based access control with automatic redirects
- **Three Dashboards** - Fully functional dashboards for each user role with mock data
- **Responsive Design** - Mobile-first responsive layout working on all screen sizes
- **Professional UI** - Polished interface with consistent design system
- **Charts & Analytics** - Interactive Recharts visualizations and data tables
- **Mock Data System** - Organized data structure ready for backend integration

### 📊 Student Dashboard
- Overall performance KPIs (Score, CGPA, Attendance, Study Hours)
- Academic performance breakdown by subject
- Performance trend visualization
- Insights section (Strong areas, Needs attention, Recommended practice)
- Behavior & engagement metrics

### 👨‍🏫 Teacher Dashboard
- Class-level analytics and performance metrics
- Student performance distribution charts
- Risk assessment and monitoring
- Subject-wise performance analysis
- Student management table with search, filter, and pagination
- Attendance tracking visualization

### 🛡️ Admin Dashboard
- System-wide analytics and KPIs
- Student distribution by major/department
- Performance analysis across departments
- Risk assessment overview
- Student management interface
- Multiple visualization types (Bar, Pie, Line charts)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project directory
cd student-performance-system

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔐 Demo Accounts

Three demo accounts are pre-configured for testing:

### Student Account
```
Email: student@example.com
Password: student123
```

### Teacher Account
```
Email: teacher@example.com
Password: teacher123
```

### Admin Account
```
Email: admin@example.com
Password: admin123
```

Use the quick-fill buttons on the login page to easily switch between roles.

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx                 # Main layout with sidebar & header
│   ├── ProtectedRoute.jsx         # Route protection component
│   └── CommonComponents.jsx       # Reusable UI components
│
├── pages/
│   ├── Login.jsx                  # Login page
│   ├── StudentDashboard.jsx       # Student dashboard
│   ├── TeacherDashboard.jsx       # Teacher dashboard
│   ├── AdminDashboard.jsx         # Admin dashboard
│   └── [Other placeholder pages]
│
├── data/
│   ├── mockUsers.js               # User credentials & validation
│   ├── mockStudents.js            # 12+ dummy student records
│   └── mockAnalytics.js           # Dashboard analytics data
│
├── utils/
│   └── auth.js                    # Auth service & route definitions
│
├── App.jsx                        # Main routing configuration
├── main.jsx                       # Entry point
├── index.css                      # Tailwind + custom styles
└── vite.config.js                 # Vite configuration

```

## 🎨 Design System

### Colors
- **Primary**: Blue (#0078d4) - Main action color
- **Success**: Green (#10b981) - Positive indicators
- **Warning**: Amber (#f59e0b) - Caution indicators
- **Danger**: Red (#ef4444) - Error indicators
- **Background**: Light gray (#f5f7fa) - Clean, professional look

### Components
- **StatCard** - KPI display with trends
- **ChartCard** - Wrapper for chart visualizations
- **DataTable** - Searchable, filterable, paginated tables
- **PerformanceBadge** - Performance level indicators
- **RiskBadge** - Risk level indicators
- **Layout** - Full-page layout with sidebar navigation

## 🔄 Mock Data Architecture

All dummy data is organized in the `src/data/` directory:

- **mockUsers.js** - Authentication credentials for 3 demo users
- **mockStudents.js** - 12 realistic student profiles with complete data
- **mockAnalytics.js** - Pre-calculated analytics for dashboards

This structure allows easy backend integration:
1. Replace localStorage with API calls
2. Fetch real data from MongoDB/backend
3. UI components remain unchanged

## 🔌 Ready for Backend Integration

The frontend is structured to seamlessly integrate with a Node.js/Express/MongoDB backend:

### To Add Real Backend:
1. Update `src/utils/auth.js` to make API calls instead of localStorage
2. Replace mock data imports with API service calls
3. Add API configuration in a new `src/services/api.js` file
4. Components require no changes - they consume data the same way

### Future Phases:
- Phase 2: Node.js/Express backend
- Phase 3: MongoDB database
- Phase 4: CSV import functionality
- Phase 5: Real student/teacher/class management

## 📱 Responsive Design

The application is fully responsive:

- **Mobile** (<640px): Single column, collapsible sidebar, adaptive charts
- **Tablet** (640px-1024px): Two-column layout, optimized navigation
- **Desktop** (1024px+): Full three-column layout per screenshots

## 🛠️ Tech Stack

- **React** 19.2.8 - UI library
- **Vite** 8.3.0 - Build tool
- **Tailwind CSS** 4.3.3 - Styling
- **React Router** 7.18.4 - Navigation
- **Recharts** 3.10.1 - Charts & visualizations
- **Lucide React** 1.47.0 - Icons

## 📊 Data Features

### Authentication
- localStorage-based session storage
- Role-based access control (STUDENT, TEACHER, ADMIN)
- Automatic redirect on unauthorized access
- Session persistence across page reloads

### Analytics
- Real-time KPI calculations
- Multiple chart types (Bar, Line, Pie)
- Trend analysis
- Risk assessment
- Performance categorization

### Tables
- Search across all columns
- Sortable columns
- Pagination (10 items per page)
- Responsive horizontal scrolling on mobile
- Status badges with color coding

## 🎯 Next Steps

For Phase 2 and beyond:
1. Set up Node.js/Express server
2. Create MongoDB schemas
3. Implement real authentication with JWT
4. Create API endpoints matching current data structure
5. Replace mock data with API calls
6. Add CSV import functionality
7. Implement real email/password recovery

## 📝 Notes

- All dashboard data is currently mocked for rapid prototyping
- No backend server required for Phase 1
- localStorage clears on browser data clear
- All routes are protected - unauthorized access redirects to dashboard
- Charts update reactively with mock data changes

## 🎓 Learning Resources

The codebase demonstrates:
- React functional components with hooks
- React Router v7 patterns
- Tailwind CSS utility-first styling
- Component composition and reusability
- State management with localStorage
- Chart integration with Recharts
- Responsive design patterns

## 📄 License

Phase 1 - Educational/Prototype Use

---

**Built with ❤️ for modern education analytics**
