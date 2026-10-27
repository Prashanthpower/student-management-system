import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import NotificationBanner from '../../components/NotificationBanner';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import EditProfileModal from '../../components/EditProfileModal';

const INSPIRING_QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Strive for progress, not perfection.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" }
];

export default function StudentPortal({ subView = 'student-overview', setActiveTab }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState({ records: [], summary: null });
  const [marksData, setMarksData] = useState({ marks: [], overallGrade: '—', averagePercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Daily inspiring quote (picks a new one every time portal opens)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => 
    Math.floor(Math.random() * INSPIRING_QUOTES.length)
  );

  // Solid modals for password change & profile update
  const [showPassModal, setShowPassModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      setError('');
      try {
        const [prof, subs, att, mrk] = await Promise.all([
          api.getStudentProfile(),
          api.getStudentSubjects(),
          api.getStudentAttendance(),
          api.getStudentMarks(),
        ]);
        setProfile(prof);
        setSubjects(subs || []);
        setAttendanceData(att || { records: [], summary: null });
        setMarksData(mrk || { marks: [], overallGrade: '—', averagePercentage: 0 });
      } catch (err) {
        setError(err.message || 'Could not load student portal records.');
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  function nextQuote() {
    setCurrentQuoteIndex((prev) => (prev + 1) % INSPIRING_QUOTES.length);
  }

  async function handleSaveProfile(newName) {
    const updated = await api.updateStudentProfile({ name: newName });
    setProfile(updated);
    setSuccess('Profile display name updated successfully.');
  }

  const currentQuote = INSPIRING_QUOTES[currentQuoteIndex];
  const attPct = attendanceData.summary?.attendancePercentage ?? 100;
  const totalClasses = attendanceData.summary?.totalClasses ?? 0;
  const presentCount = attendanceData.summary?.presentCount ?? 0;
  const absentCount = attendanceData.summary?.absentCount ?? 0;
  const lateCount = attendanceData.summary?.lateCount ?? 0;

  const presentPct = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;
  const absentPct = totalClasses > 0 ? (absentCount / totalClasses) * 100 : 0;
  const latePct = totalClasses > 0 ? (lateCount / totalClasses) * 100 : 0;

  return (
    <div className="module-container">
      <NotificationBanner
        error={error}
        success={success}
        onClearError={() => setError('')}
        onClearSuccess={() => setSuccess('')}
      />

      {/* =========================================================================
          TAB 1: MY PORTAL (Statistical Executive Overview)
          Only displays statistical summaries and motivational quote.
          Specific details are separated into corresponding sidebar tabs.
         ========================================================================= */}
      {subView === 'student-overview' && (
        <>
          {/* Daily Motivational Quote & Picture Card */}
          <section className="student-quote-card">
            <div className="quote-image-wrapper">
              <img
                src="/student_study.jpg"
                alt="Inspiring Student Study Space"
                className="quote-banner-img"
              />
              <div className="quote-image-overlay"></div>
            </div>
            <div className="quote-card-content">
              <div className="quote-header-row">
                <span className="quote-badge">💡 Daily Word of Inspiration</span>
                <button
                  type="button"
                  className="quote-shuffle-btn"
                  onClick={nextQuote}
                  title="Shuffle Quote"
                >
                  ✨ New Quote
                </button>
              </div>
              <blockquote className="quote-text">
                &ldquo;{currentQuote.text}&rdquo;
              </blockquote>
              <cite className="quote-author">— {currentQuote.author}</cite>
            </div>
          </section>

          {/* Student Welcome Header Card */}
          <section className="student-hero-card">
            <div className="student-hero-content">
              <div className="student-hero-avatar">
                {(profile?.name || user?.username || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="eyebrow white-eyebrow">ACADEMIC DASHBOARD</div>
                <h2>Welcome, {profile?.name || user?.username}!</h2>
                <div className="student-meta-pills">
                  <span className="hero-pill">Roll ID: #{profile?.id}</span>
                  <span className="hero-pill">Department: {profile?.department}</span>
                  <span className="hero-pill">Academic Year: Year {profile?.year}</span>
                  <span className="hero-pill">Status: Active &amp; Enrolled</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats Grid */}
          <section className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon blue">📚</span>
              <p>Enrolled Courses</p>
              <h2>{loading ? '...' : subjects.length}</h2>
              <small className="stat-caption">Department Curriculum</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon green">📅</span>
              <p>Overall Attendance</p>
              <h2>{loading ? '...' : `${attPct}%`}</h2>
              <small className="stat-caption">
                {attPct >= 75 ? '🟢 Eligible for Finals' : '🔴 Action Required (<75%)'}
              </small>
            </article>

            <article className="stat-card">
              <span className="stat-icon purple">🏆</span>
              <p>Letter Grade</p>
              <h2>{loading ? '...' : marksData.overallGrade}</h2>
              <small className="stat-caption">Avg Score: {marksData.averagePercentage}%</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon orange">📝</span>
              <p>Assessments Completed</p>
              <h2>{loading ? '...' : marksData.marks?.length ?? 0}</h2>
              <small className="stat-caption">Evaluations Recorded</small>
            </article>
          </section>

          {/* Statistical Analytics Views */}
          <div className="portal-stats-container">
            {/* Attendance Analytics Breakdown */}
            <div className="portal-chart-card">
              <div className="portal-chart-header">
                <h3>Attendance Ratio Breakdown</h3>
                <span className={`status-badge ${attPct >= 75 ? 'badge-present' : 'badge-absent'}`}>
                  {attPct}% Average
                </span>
              </div>
              <p className="card-subtext">Overall verified session engagement</p>

              <div className="attendance-progress-wrap">
                <div className="attendance-multi-bar">
                  <div
                    className="bar-segment bar-present"
                    style={{ width: `${presentPct}%` }}
                    title={`Present: ${presentCount}`}
                  ></div>
                  <div
                    className="bar-segment bar-late"
                    style={{ width: `${latePct}%` }}
                    title={`Late: ${lateCount}`}
                  ></div>
                  <div
                    className="bar-segment bar-absent"
                    style={{ width: `${absentPct}%` }}
                    title={`Absent: ${absentCount}`}
                  ></div>
                </div>
              </div>

              <div className="attendance-legend-grid">
                <div className="legend-item">
                  <span className="legend-dot dot-present"></span>
                  <span>Present: <strong>{presentCount}</strong></span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-late"></span>
                  <span>Late: <strong>{lateCount}</strong></span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-absent"></span>
                  <span>Absent: <strong>{absentCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Academic Evaluation Summary */}
            <div className="portal-chart-card">
              <div className="portal-chart-header">
                <h3>Academic Standing &amp; Evaluation</h3>
                <span className="grade-badge-lg">
                  Grade: <strong>{marksData.overallGrade}</strong>
                </span>
              </div>
              <p className="card-subtext">Cumulative examination score performance</p>

              <div className="profile-detail-grid single-col-gap" style={{ marginTop: '14px', marginBottom: '0' }}>
                <div className="detail-item">
                  <span className="detail-label">Total Marks Obtained</span>
                  <span className="detail-value">
                    <strong>{marksData.totalObtained ?? 0}</strong> / {marksData.totalMax ?? 0}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Average Score</span>
                  <span className="detail-value">{marksData.averagePercentage}%</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Academic Standing</span>
                  <span className="detail-value">
                    <span className="status-badge badge-present">Good Standing</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards directly to corresponding left tabs */}
          <div className="portal-quick-nav-row">
            <div
              className="quick-nav-card"
              onClick={() => setActiveTab && setActiveTab('student-courses')}
            >
              <div className="quick-nav-card-top">
                <span className="quick-nav-icon">📚</span>
                <h4>My Courses ({subjects.length})</h4>
              </div>
              <p>Explore your complete department curriculum, semester credits, and course syllabus.</p>
              <span className="quick-nav-link">View Enrolled Courses →</span>
            </div>

            <div
              className="quick-nav-card"
              onClick={() => setActiveTab && setActiveTab('student-attendance')}
            >
              <div className="quick-nav-card-top">
                <span className="quick-nav-icon">📅</span>
                <h4>Attendance Log</h4>
              </div>
              <p>Check daily classroom attendance, verified faculty logs, and session remarks.</p>
              <span className="quick-nav-link">View Attendance Log →</span>
            </div>

            <div
              className="quick-nav-card"
              onClick={() => setActiveTab && setActiveTab('student-marks')}
            >
              <div className="quick-nav-card-top">
                <span className="quick-nav-icon">📜</span>
                <h4>Grade Sheet &amp; Report Card</h4>
              </div>
              <p>Review individual examination marks, scored percentages, and letter grades.</p>
              <span className="quick-nav-link">View Report Card →</span>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          TAB 2: MY COURSES
          Displays only the enrolled course catalog.
         ========================================================================= */}
      {subView === 'student-courses' && (
        <section className="table-card">
          <div className="table-heading-bar">
            <div>
              <h3>Enrolled Course Curriculum</h3>
              <p className="card-subtext">Approved syllabus for {profile?.department} department</p>
            </div>
            <span className="status-badge badge-present">{subjects.length} Total Subjects</span>
          </div>

          <div className="subjects-cards-grid">
            {subjects.length === 0 ? (
              <p className="empty-hint">No active courses registered for this department yet.</p>
            ) : (
              subjects.map((sub) => (
                <div key={sub.id} className="subject-card">
                  <div className="subject-card-header">
                    <span className="subject-code">{sub.code}</span>
                    <span className="credits-badge">{sub.credits} Credits</span>
                  </div>
                  <h4>{sub.name}</h4>
                  <div className="subject-card-footer">
                    <span>Semester {sub.semester}</span>
                    <span className="dept-pill">{sub.departmentCode}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 3: ATTENDANCE RECORD
          Displays only the verified classroom attendance records.
         ========================================================================= */}
      {subView === 'student-attendance' && (
        <section className="table-card">
          <div className="table-heading-bar">
            <div>
              <h3>Verified Class Attendance Logs</h3>
              <p className="card-subtext">Attendance authenticated by faculty</p>
            </div>
            {attendanceData.summary && (
              <div className="attendance-pills-row">
                <span className="status-badge badge-present">Present: {attendanceData.summary.presentCount}</span>
                <span className="status-badge badge-absent">Absent: {attendanceData.summary.absentCount}</span>
                <span className="status-badge badge-late">Late: {attendanceData.summary.lateCount}</span>
              </div>
            )}
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course / Subject</th>
                  <th>Status</th>
                  <th>Faculty Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.records.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">No attendance recorded yet.</td>
                  </tr>
                ) : (
                  attendanceData.records.map((rec) => (
                    <tr key={rec.id}>
                      <td>{rec.date}</td>
                      <td>
                        <strong>{rec.subject?.name}</strong>
                        <div className="table-subtext">{rec.subject?.code}</div>
                      </td>
                      <td>
                        <span className={`status-badge badge-${rec.status?.toLowerCase()}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td>{rec.remarks || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 4: GRADES & REPORT CARD
          Displays only the examination results.
         ========================================================================= */}
      {subView === 'student-marks' && (
        <section className="table-card">
          <div className="table-heading-bar">
            <div>
              <h3>Official Examination Report Card</h3>
              <p className="card-subtext">Marks scored across internal and semester examinations</p>
            </div>
            <div className="grade-badge-lg">
              <span>Overall: </span>
              <strong>{marksData.overallGrade}</strong>
              <small>({marksData.averagePercentage}%)</small>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Evaluation Exam</th>
                  <th>Marks Scored</th>
                  <th>Max Marks</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {marksData.marks?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">No examination marks published yet.</td>
                  </tr>
                ) : (
                  marksData.marks?.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.subject?.name}</strong>
                        <div className="table-subtext">{m.subject?.code}</div>
                      </td>
                      <td>{m.examType}</td>
                      <td><strong>{m.marksObtained}</strong></td>
                      <td>{m.maxMarks}</td>
                      <td>
                        <span className="grade-pill">{m.grade}</span>
                      </td>
                      <td>{m.remarks || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 5: PROFILE & SECURITY (NO QUOTE HERE)
          Only displays profile information, popup modals, and Logout button.
         ========================================================================= */}
      {subView === 'profile' && (
        <div className="profile-center-layout">
          <section className="table-card modern-profile-card">
            <div className="profile-card-top-banner student-banner-gradient">
              <div className="profile-card-avatar">
                {(profile?.name || user?.username || 'S').charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="profile-card-body">
              <div className="profile-card-identity">
                <h2>{profile?.name}</h2>
                <span className="role-pill role-student">🎓 Enrolled Student</span>
              </div>

              <div className="profile-detail-grid single-col-gap">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value"><strong>{profile?.name}</strong></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registered Institutional Email</span>
                  <span className="detail-value">{profile?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Academic Department</span>
                  <span className="detail-value">{profile?.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Academic Year</span>
                  <span className="detail-value">Year {profile?.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Student Roll ID</span>
                  <span className="detail-value">#{profile?.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Security</span>
                  <span className="detail-value">Protected with BCrypt Password Hash</span>
                </div>
              </div>

              {/* Action Buttons opening Solid Popups */}
              <div className="profile-action-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEditModal(true)}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setShowPassModal(true)}
                >
                  🔒 Change Password
                </button>
              </div>

              {/* Prominent Logout Option right in Profile & Security Tab */}
              <div className="profile-logout-section">
                <div className="profile-logout-info">
                  <h4>Account Session</h4>
                  <p>Securely end your portal session on this device</p>
                </div>
                <button
                  type="button"
                  className="logout-action-btn"
                  onClick={logout}
                  title="Sign Out"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Solid Modern Popups / Modals (100% Opaque, No Transparency) */}
      <ChangePasswordModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        onSuccess={(msg) => setSuccess(msg)}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
