import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AdminOverview from './pages/admin/AdminOverview';
import StudentManagement from './pages/admin/StudentManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import MarksManagement from './pages/admin/MarksManagement';
import ReportsPage from './pages/admin/ReportsPage';
import StudentPortal from './pages/student/StudentPortal';
import ProfilePage from './pages/common/ProfilePage';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isStudent, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Synchronize default tab whenever authentication role changes
  useEffect(() => {
    if (isAdmin && (!activeTab || activeTab.startsWith('student-'))) {
      setActiveTab('overview');
    } else if (isStudent && (!activeTab || !activeTab.startsWith('student-'))) {
      setActiveTab('student-overview');
    }
  }, [isAdmin, isStudent]);

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner"></div>
        <p>Connecting to StudentHub...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Safe fallback to prevent blank page on first login
  const validAdminTabs = ['overview', 'students', 'departments', 'subjects', 'attendance', 'marks', 'reports', 'profile'];
  const validStudentTabs = ['student-overview', 'student-courses', 'student-attendance', 'student-marks', 'profile'];

  const currentTab = isAdmin
    ? (validAdminTabs.includes(activeTab) ? activeTab : 'overview')
    : (validStudentTabs.includes(activeTab) ? activeTab : 'student-overview');

  return (
    <main className="app-shell">
      <Sidebar
        activeTab={currentTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <section className="main-content">
        {isAdmin && (
          <>
            {currentTab === 'overview' && (
              <>
                <TopBar
                  eyebrow="ADMIN CONSOLE"
                  title="Institution Overview"
                  subtitle="System metrics, department allocation, and quick actions"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <AdminOverview setActiveTab={setActiveTab} />
              </>
            )}

            {currentTab === 'students' && (
              <>
                <TopBar
                  eyebrow="WORKSPACE / STUDENTS"
                  title="Student Management"
                  subtitle="Manage student records, enrollment status, and portal credentials"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentManagement />
              </>
            )}

            {currentTab === 'departments' && (
              <>
                <TopBar
                  eyebrow="ACADEMICS / DEPARTMENTS"
                  title="Department Management"
                  subtitle="Create and monitor engineering faculties and disciplines"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <DepartmentManagement />
              </>
            )}

            {currentTab === 'subjects' && (
              <>
                <TopBar
                  eyebrow="ACADEMICS / COURSES"
                  title="Course & Subject Curriculum"
                  subtitle="Manage subject codes, credit weightings, and semester schedules"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <SubjectManagement />
              </>
            )}

            {currentTab === 'attendance' && (
              <>
                <TopBar
                  eyebrow="ACADEMICS / ATTENDANCE"
                  title="Daily Attendance Tracker"
                  subtitle="Log student class attendance and prevent duplicate sessions"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <AttendanceManagement />
              </>
            )}

            {currentTab === 'marks' && (
              <>
                <TopBar
                  eyebrow="EVALUATION / MARKS"
                  title="Examinations & Grades"
                  subtitle="Record student scores and auto-calculate letter grades"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <MarksManagement />
              </>
            )}

            {currentTab === 'reports' && (
              <>
                <TopBar
                  eyebrow="ANALYTICS / REPORTS"
                  title="Academic Reports & Export"
                  subtitle="Download CSV rosters and analyze faculty performance"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <ReportsPage />
              </>
            )}

            {currentTab === 'profile' && (
              <>
                <TopBar
                  eyebrow="SETTINGS / ACCOUNT"
                  title="Administrator Account"
                  subtitle="Security credentials and profile configuration"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <ProfilePage />
              </>
            )}
          </>
        )}

        {isStudent && (
          <>
            {currentTab === 'student-overview' && (
              <>
                <TopBar
                  eyebrow="STUDENT PORTAL"
                  title="My Academic Hub"
                  subtitle="Real-time courses, attendance rate, and exam results"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentPortal subView="student-overview" setActiveTab={setActiveTab} />
              </>
            )}

            {currentTab === 'student-courses' && (
              <>
                <TopBar
                  eyebrow="PORTAL / COURSES"
                  title="My Enrolled Courses"
                  subtitle="Curriculum subjects for your department and semester"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentPortal subView="student-courses" setActiveTab={setActiveTab} />
              </>
            )}

            {currentTab === 'student-attendance' && (
              <>
                <TopBar
                  eyebrow="PORTAL / ATTENDANCE"
                  title="My Class Attendance"
                  subtitle="Verified classroom attendance records and attendance percentage"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentPortal subView="student-attendance" setActiveTab={setActiveTab} />
              </>
            )}

            {currentTab === 'student-marks' && (
              <>
                <TopBar
                  eyebrow="PORTAL / GRADES"
                  title="Academic Grades & Report Card"
                  subtitle="Official exam evaluations, marks obtained, and letter grades"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentPortal subView="student-marks" setActiveTab={setActiveTab} />
              </>
            )}

            {currentTab === 'profile' && (
              <>
                <TopBar
                  eyebrow="PORTAL / SETTINGS"
                  title="Profile & Account Security"
                  subtitle="Update display name and change password"
                  onToggleMobile={() => setMobileOpen(!mobileOpen)}
                />
                <StudentPortal subView="profile" setActiveTab={setActiveTab} />
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
