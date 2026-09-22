import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Bell, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentSidebarLinks = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'My Performance', href: '/student/performance', icon: '📈' },
  { label: 'Attendance', href: '/student/attendance', icon: '✓' },
  { label: 'Exam Results', href: '/student/results', icon: '📋' },
  { label: 'Profile', href: '/student/profile', icon: '👤' },
];

const TeacherSidebarLinks = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
  { label: 'Students', href: '/teacher/students', icon: '👥' },
  { label: 'Performance Analytics', href: '/teacher/analytics', icon: '📈' },
  { label: 'Attendance', href: '/teacher/attendance', icon: '✓' },
  { label: 'Reports', href: '/teacher/reports', icon: '📋' },
  { label: 'Profile', href: '/teacher/profile', icon: '👤' },
];

const AdminSidebarLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Students', href: '/admin/students', icon: '👥' },
  { label: 'Teachers', href: '/admin/teachers', icon: '🏫' },
  { label: 'Classes', href: '/admin/classes', icon: '📚' },
  { label: 'Subjects', href: '/admin/subjects', icon: '📖' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Import Students', href: '/admin/import', icon: '📥' },
];

function Sidebar({ isOpen, onClose, links }) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-600" />
            </div>
            <span className="font-bold text-lg text-gray-900">EduTrack</span>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Help & Support */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            ❓ Help & Support
          </button>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Notification */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  Profile Settings
                </button>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let links;
  switch (role) {
    case 'STUDENT':
      links = StudentSidebarLinks;
      break;
    case 'TEACHER':
      links = TeacherSidebarLinks;
      break;
    case 'ADMIN':
      links = AdminSidebarLinks;
      break;
    default:
      links = [];
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
