import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import rootaccessLogo from '../assets/Rootaccess_logo.jpeg';

const StudentSidebarLinks = [
  { label: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { label: 'My Performance', href: '/student/performance', icon: '📈' },
  { label: 'Analytics', href: '/student/analytics', icon: '📊' },
  { label: 'Attendance', href: '/student/attendance', icon: '✓' },
  { label: 'Exam Results', href: '/student/results', icon: '📋' },
  { label: 'My Class', href: '/student/class', icon: '🏫' },
  { label: 'My Subjects', href: '/student/subjects', icon: '📚' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

const TeacherSidebarLinks = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
  { label: 'Students', href: '/teacher/students', icon: '👥' },
  { label: 'Performance Analytics', href: '/teacher/analytics', icon: '📈' },
  { label: 'Attendance', href: '/teacher/attendance', icon: '✓' },
  { label: 'Reports', href: '/teacher/reports', icon: '📋' },
  { label: 'Classes', href: '/teacher/classes', icon: '🏫' },
  { label: 'Subjects', href: '/teacher/subjects', icon: '📚' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

const AdminSidebarLinks = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Students', href: '/admin/students', icon: '👥' },
  { label: 'Teachers', href: '/admin/teachers', icon: '🏫' },
  { label: 'Classes', href: '/admin/classes', icon: '📚' },
  { label: 'Subjects', href: '/admin/subjects', icon: '📖' },
  { label: 'Assignments', href: '/admin/assignments', icon: '🔗' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'ML', href: '/admin/ml', icon: '🤖' },
  { label: 'Import Students', href: '/admin/import', icon: '📥' },
  { label: 'Profile', href: '/profile', icon: '👤' },
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
            <img src={rootaccessLogo} alt="Rootaccess logo" className="h-10 w-16 rounded-lg object-cover" />
            <span className="min-w-0">
              <span className="block truncate text-lg font-bold leading-tight text-gray-900">EduTrack</span>
              <span className="block text-xs leading-tight text-gray-500">by Rootaccess</span>
            </span>
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
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setDropdownOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
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
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <Avatar user={user} />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="truncate text-xs text-gray-500">{user?.email}</p>
                  <p className="mt-1 text-xs text-gray-500">{user?.role}</p>
                </div>
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>
                <hr className="my-2" />
                <button
                  type="button"
                  role="menuitem"
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
