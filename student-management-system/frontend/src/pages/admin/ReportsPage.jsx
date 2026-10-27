import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import NotificationBanner from '../../components/NotificationBanner';

export default function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [sumData, deptsData] = await Promise.all([
          api.getReportsSummary(),
          api.getDepartmentStats(),
        ]);
        setSummary(sumData);
        setDeptStats(deptsData || []);
      } catch (err) {
        setError(err.message || 'Could not load report statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  async function handleDownloadCsv() {
    setDownloading(true);
    setError('');
    setSuccess('');
    try {
      const blob = await api.downloadStudentsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Student roster CSV downloaded successfully.');
    } catch (err) {
      setError(err.message || 'Failed to download CSV report.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="module-container">
      <NotificationBanner
        error={error}
        success={success}
        onClearError={() => setError('')}
        onClearSuccess={() => setSuccess('')}
      />

      <section className="table-card">
        <div className="table-heading-bar">
          <div>
            <h2>Academic Summary & Analytics</h2>
            <p className="card-subtext">Comprehensive institution-wide statistics and data export</p>
          </div>
          <button
            type="button"
            className="primary-button export-button"
            onClick={handleDownloadCsv}
            disabled={downloading}
          >
            {downloading ? 'Generating CSV...' : '📥 Export Student Roster (CSV)'}
          </button>
        </div>

        <div className="analytics-summary-cards">
          <div className="analytics-card">
            <span className="analytics-title">Total Enrolled Students</span>
            <span className="analytics-number">{loading ? '...' : summary?.totalStudents ?? 0}</span>
            <span className="analytics-meta">Across 4 academic years</span>
          </div>

          <div className="analytics-card">
            <span className="analytics-title">Active Departments</span>
            <span className="analytics-number">{loading ? '...' : summary?.totalDepartments ?? 0}</span>
            <span className="analytics-meta">Specialized branches</span>
          </div>

          <div className="analytics-card">
            <span className="analytics-title">Curriculum Courses</span>
            <span className="analytics-number">{loading ? '...' : summary?.totalSubjects ?? 0}</span>
            <span className="analytics-meta">Active semester subjects</span>
          </div>

          <div className="analytics-card">
            <span className="analytics-title">Institution Attendance</span>
            <span className="analytics-number">{loading ? '...' : `${summary?.overallAttendanceRate ?? 100}%`}</span>
            <span className="analytics-meta">{summary?.totalAttendanceRecords ?? 0} class logs recorded</span>
          </div>

          <div className="analytics-card">
            <span className="analytics-title">Evaluations Recorded</span>
            <span className="analytics-number">{loading ? '...' : summary?.totalMarksRecords ?? 0}</span>
            <span className="analytics-meta">Exam and quiz grades</span>
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-heading-bar">
          <div>
            <h3>Department Breakdown Report</h3>
            <p className="card-subtext">Faculty distribution and course offerings</p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>DEPARTMENT CODE</th>
                <th>DEPARTMENT NAME</th>
                <th>ENROLLED STUDENTS</th>
                <th>CURRICULUM COURSES</th>
                <th>ENROLLMENT SHARE</th>
              </tr>
            </thead>
            <tbody>
              {deptStats.map((d) => {
                const total = summary?.totalStudents || 1;
                const share = Math.round((d.studentCount / total) * 100);
                return (
                  <tr key={d.id || d.code}>
                    <td><span className="department-tag">{d.code}</span></td>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.studentCount} students</td>
                    <td>{d.subjectCount} subjects</td>
                    <td>
                      <div className="share-cell">
                        <span>{share}%</span>
                        <div className="mini-progress-track">
                          <div className="mini-progress-fill" style={{ width: `${share}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
