# Quick Start Guide - EduTrack by Rootaccess

## 🎯 Current Status
✅ **Application is RUNNING** at http://localhost:5173

## ⚡ Quick Access

### Login Now
Visit: **http://localhost:5173**

### Demo Accounts (Click demo buttons on login page)
```
STUDENT:  student@example.com  /  student123
TEACHER:  teacher@example.com  /  teacher123
```

### Initial Admin Bootstrap
Create the real administrator once with environment values and the dedicated command:

```bash
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=your-strong-bootstrap-password
npm run bootstrap:admin
```

The admin bootstrap does not overwrite an existing admin password.

To change the existing admin login, set `INITIAL_ADMIN_EMAIL` and a fresh
12-character-or-longer `INITIAL_ADMIN_PASSWORD` in `.env`, then run
`npm run replace:admin -- --replace-existing`. This updates the admin in place and
refuses to proceed if the account selection is ambiguous.

---

## 📊 What You'll See

### Student Dashboard
- Overall Score: 86.4%
- Final CGPA: 8.72
- Attendance: 91.4%
- Academic performance charts
- Performance trends
- Insights on strong areas & improvement areas
- Behavior metrics

### Teacher Dashboard
- 120 Total Students
- Performance distribution analysis
- Risk assessment (14 at-risk students)
- Subject performance breakdown
- Searchable student table
- Attendance trends

### Admin Dashboard
- 300 Total Students
- 24 Teachers
- 18 Classes
- System-wide analytics
- Department performance
- Complete student management

---

## 🎨 Design Features

✅ Modern professional UI  
✅ Responsive mobile design  
✅ Interactive charts  
✅ Color-coded badges  
✅ Smooth animations  
✅ Intuitive navigation  

---

## 📁 Project Files

```
src/
├── components/
│   ├── Layout.jsx              ← Main layout with sidebar
│   ├── ProtectedRoute.jsx      ← Route protection
│   └── CommonComponents.jsx    ← UI components
├── pages/
│   ├── Login.jsx               ← Login page
│   ├── StudentDashboard.jsx    ← Student view
│   ├── TeacherDashboard.jsx    ← Teacher view
│   └── AdminDashboard.jsx      ← Admin view
├── data/
│   ├── mockUsers.js            ← User credentials
│   ├── mockStudents.js         ← Student data
│   └── mockAnalytics.js        ← Charts data
└── utils/
    └── auth.js                 ← Auth logic
```

---

## 🔒 How to Test Authentication

1. Go to http://localhost:5173
2. Try the quick-fill buttons at bottom of login page
3. Or manually type credentials
4. Each role redirects to different dashboard
5. Try accessing other role's routes - you'll be redirected

---

## 📈 Interactive Elements

- **Search Tables:** Type in search boxes to filter students
- **Pagination:** Navigate through student records
- **Charts:** Hover over charts to see data values
- **Badges:** Color-coded performance & risk indicators
- **Sidebar:** Click menu items to navigate
- **User Menu:** Click profile to logout

---

## 🔧 Development Commands

```bash
# Start dev server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Responsive Test

Try these screen sizes:
- **Mobile:** Resize to ~375px width
- **Tablet:** Resize to ~768px width
- **Desktop:** Full screen

All layouts adapt automatically!

---

## ✨ Key Pages

| Route | Access | Purpose |
|-------|--------|---------|
| / | Everyone | Login page |
| /student/dashboard | Students | Main dashboard |
| /teacher/dashboard | Teachers | Class analytics |
| /admin/dashboard | Admins | System overview |

Protected routes auto-redirect if unauthorized.

---

## 🚀 What's Next?

### Phase 2 (Backend)
- Node.js/Express server
- MongoDB database
- Real authentication
- API endpoints

### Phase 3 (Integration)
- Connect frontend to backend
- Real data persistence
- User management
- CSV import

---

## 📞 Test Scenarios

### Scenario 1: Student Journey
1. Login as student
2. View your dashboard
3. Check performance trends
4. See strong/weak areas

### Scenario 2: Teacher Journey
1. Login as teacher
2. View all students
3. Search for specific student
4. Check performance distribution

### Scenario 3: Admin Journey
1. Login as admin
2. View system analytics
3. Check department performance
4. Manage all users

---

## 🎓 Learn the UI

### Sidebar Navigation
- Different menus per role
- Quick access to all pages
- Logout button at bottom

### Header
- Notification bell (visual only)
- User profile menu
- Role display

### Main Content
- Large charts and analytics
- KPI cards with trends
- Data tables with search
- Status indicators

---

## 💡 Tips

✅ Scroll down dashboards to see all content  
✅ Use search bars to find students  
✅ Hover over charts to see values  
✅ Check responsive design on mobile  
✅ Try all three demo accounts  
✅ Click logout to return to login  

---

## 📝 Notes

- All data is currently mocked (Phase 1)
- No real database yet (Phase 2)
- No real emails (Phase 3+)
- All features are local in-browser

---

## 🎉 You're All Set!

The application is ready to use. Start by logging in with any demo account and exploring the dashboards.

**Enjoy EduTrack by Rootaccess! 🎓**
