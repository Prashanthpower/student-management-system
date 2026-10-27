import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, isAdmin, isStudent, logout } = useAuth();

  const adminNav = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '🎓' },
    { id: 'departments', label: 'Departments', icon: '🏛️' },
    { id: 'subjects', label: 'Courses & Subjects', icon: '📚' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'marks', label: 'Marks & Grades', icon: '📝' },
    { id: 'reports', label: 'Academic Reports', icon: '📈' },
    { id: 'profile', label: 'My Account', icon: '⚙️' },
  ];

  const studentNav = [
    { id: 'student-overview', label: 'My Portal', icon: '🏠' },
    { id: 'student-courses', label: 'My Courses', icon: '📚' },
    { id: 'student-attendance', label: 'Attendance Record', icon: '📅' },
    { id: 'student-marks', label: 'Grades & Report Card', icon: '📜' },
    { id: 'profile', label: 'Profile & Security', icon: '👤' },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  function handleNav(id) {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand">
        <span className="brand-icon">S</span>
        <div>
          <div className="brand-title">StudentHub</div>
          <div className="brand-subtitle">{isAdmin ? 'Admin Console' : 'Student Portal'}</div>
        </div>
      </div>

      <p className="nav-label">WORKSPACE</p>
      <nav className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          className={`user-profile-badge clickable ${activeTab === 'profile' ? 'active-profile' : ''}`}
          onClick={() => handleNav('profile')}
          title="Go to Profile & Security"
        >
          <div className="avatar-circle">
            {(user?.studentName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-info-text">
            <div className="user-display-name">{user?.studentName || user?.username}</div>
            <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-student'}`}>
              {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
