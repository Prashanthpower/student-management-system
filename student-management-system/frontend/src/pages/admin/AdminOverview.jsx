import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function AdminOverview({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumData, deptData, studentsData] = await Promise.all([
          api.getReportsSummary(),
          api.getDepartmentStats(),
          api.getStudents(),
        ]);
        setSummary(sumData);
        setDeptStats(deptData || []);
        setRecentStudents((studentsData || []).slice(0, 5));
      } catch (err) {
        setError(err.message || 'Could not load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="dashboard-content">
      {error && <div className="error-banner">{error}</div>}

      {/* Administrator Campus Welcome Banner */}
      <section className="admin-hero-card">
        <div className="admin-hero-image-wrap">
          <img
            src="/admin_campus.jpg"
            alt="University Campus Academic Center"
            className="admin-hero-img"
          />
          <div className="admin-hero-overlay"></div>
        </div>
        <div className="admin-hero-content">
          <div className="admin-hero-badge">🏛️ Campus Central Administration</div>
          <h2>Welcome to the Academic Management Console</h2>
          <p>
            Monitor live student enrollment, faculty branches, real-time classroom attendance,
            and semester examination records across all university departments.
          </p>
          <div className="admin-hero-actions">
            <button
              type="button"
              className="hero-action-btn primary"
              onClick={() => setActiveTab('students')}
            >
              🎓 Manage Students
            </button>
            <button
              type="button"
              className="hero-action-btn"
              onClick={() => setActiveTab('attendance')}
            >
              📅 Log Attendance
            </button>
            <button
              type="button"
              className="hero-action-btn"
              onClick={() => setActiveTab('marks')}
            >
              📝 Evaluation &amp; Marks
            </button>
            <button
              type="button"
              className="hero-action-btn secondary"
              onClick={() => setActiveTab('reports')}
            >
              📈 View Reports
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-icon blue">🎓</span>
            <span className="stat-tag">Active</span>
          </div>
          <p>Total Students</p>
          <h2>{loading ? '...' : summary?.totalStudents ?? 0}</h2>
          <small className="stat-caption">Across all academic years</small>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-icon green">🏛️</span>
            <span className="stat-tag green">Departments</span>
          </div>
          <p>Academic Departments</p>
          <h2>{loading ? '...' : summary?.totalDepartments ?? 0}</h2>
          <small className="stat-caption">Active engineering branches</small>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-icon purple">📚</span>
            <span className="stat-tag purple">Courses</span>
          </div>
          <p>Subjects Offered</p>
          <h2>{loading ? '...' : summary?.totalSubjects ?? 0}</h2>
          <small className="stat-caption">Semester curriculum</small>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-icon orange">📅</span>
            <span className="stat-tag orange">Rate</span>
          </div>
          <p>Overall Attendance</p>
          <h2>{loading ? '...' : `${summary?.overallAttendanceRate ?? 100}%`}</h2>
          <small className="stat-caption">Based on recorded sessions</small>
        </article>
      </section>

      <div className="overview-two-col">
        <section className="table-card">
          <div className="card-header-row">
            <div>
              <h3>Department Student Distribution</h3>
              <p className="card-subtext">Enrollment distribution across active departments</p>
            </div>
            <button type="button" className="text-link-button" onClick={() => setActiveTab('departments')}>
              Manage Departments →
            </button>
          </div>

          <div className="dept-distribution-list">
            {deptStats.length === 0 ? (
              <p className="empty-hint">No departments configured yet.</p>
            ) : (
              deptStats.map((dept) => {
                const total = summary?.totalStudents || 1;
                const percent = Math.min(100, Math.round((dept.studentCount / total) * 100));
                return (
                  <div key={dept.id || dept.code} className="dept-progress-item">
                    <div className="dept-progress-info">
                      <span className="dept-code-tag">{dept.code}</span>
                      <span className="dept-name">{dept.name}</span>
                      <span className="dept-count">
                        <strong>{dept.studentCount}</strong> students ({percent}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="table-card">
          <div className="card-header-row">
            <div>
              <h3>Quick Academic Actions</h3>
              <p className="card-subtext">Frequent administration tasks</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <button type="button" className="quick-action-tile" onClick={() => setActiveTab('students')}>
              <span className="tile-icon">🎓</span>
              <strong>Add New Student</strong>
              <span>Register student and create portal login</span>
            </button>

            <button type="button" className="quick-action-tile" onClick={() => setActiveTab('attendance')}>
              <span className="tile-icon">📅</span>
              <strong>Mark Attendance</strong>
              <span>Record daily attendance by subject</span>
            </button>

            <button type="button" className="quick-action-tile" onClick={() => setActiveTab('marks')}>
              <span className="tile-icon">📝</span>
              <strong>Enter Exam Marks</strong>
              <span>Input test scores and calculate grades</span>
            </button>

            <button type="button" className="quick-action-tile" onClick={() => setActiveTab('reports')}>
              <span className="tile-icon">📥</span>
              <strong>Download Reports</strong>
              <span>Export CSV roster and performance stats</span>
            </button>
          </div>
        </section>
      </div>

      <section className="table-card">
        <div className="card-header-row">
          <div>
            <h3>Recent Student Enrollments</h3>
            <p className="card-subtext">Latest student records registered in the system</p>
          </div>
          <button type="button" className="secondary-button" onClick={() => setActiveTab('students')}>
            View All Students
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>STUDENT</th>
                <th>EMAIL</th>
                <th>DEPARTMENT</th>
                <th>YEAR</th>
                <th>LOGIN ACCOUNT</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td><span className="department-tag">{s.department}</span></td>
                  <td>Year {s.year}</td>
                  <td>
                    <span className={`status-badge ${s.user ? 'badge-present' : 'badge-neutral'}`}>
                      {s.user ? '✓ Active Login' : 'No Account'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
