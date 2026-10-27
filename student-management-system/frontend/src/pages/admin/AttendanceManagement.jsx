import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import NotificationBanner from '../../components/NotificationBanner';

export default function AttendanceManagement() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Recording form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' | 'LATE' }
  const [savingAttendance, setSavingAttendance] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [subsData, studentsData, attHistory] = await Promise.all([
        api.getSubjects(),
        api.getStudents(),
        api.getAttendance(),
      ]);
      setSubjects(subsData || []);
      setStudents(studentsData || []);
      setHistory(attHistory || []);

      if (subsData && subsData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(String(subsData[0].id));
      }
    } catch (err) {
      setError(err.message || 'Could not load attendance data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update attendance sheet whenever students or selected subject changes
  const selectedSubject = subjects.find((s) => String(s.id) === String(selectedSubjectId));

  const eligibleStudents = students.filter((st) => {
    if (!selectedSubject) return true;
    return st.department.toUpperCase() === selectedSubject.departmentCode.toUpperCase();
  });

  useEffect(() => {
    const initial = {};
    eligibleStudents.forEach((st) => {
      // Check if there is already a record for this student, subject, and date
      const existing = history.find(
        (h) =>
          h.student.id === st.id &&
          String(h.subject.id) === String(selectedSubjectId) &&
          h.date === selectedDate
      );
      initial[st.id] = existing ? existing.status : 'PRESENT';
    });
    setAttendanceSheet(initial);
  }, [selectedSubjectId, selectedDate, students, history]);

  function setAllStatus(status) {
    const updated = {};
    eligibleStudents.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceSheet(updated);
  }

  function handleStatusChange(studentId, status) {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  }

  async function handleSaveAttendance(e) {
    e.preventDefault();
    if (!selectedSubjectId || eligibleStudents.length === 0) {
      setError('Please select a subject with eligible students.');
      return;
    }

    setSavingAttendance(true);
    setError('');
    setSuccess('');

    try {
      // Record for each eligible student
      const promises = eligibleStudents.map((st) =>
        api.recordAttendance({
          studentId: st.id,
          subjectId: Number(selectedSubjectId),
          date: selectedDate,
          status: attendanceSheet[st.id] || 'PRESENT',
          remarks: 'Recorded via Admin Console',
        })
      );

      await Promise.all(promises);
      setSuccess(`Attendance recorded for ${eligibleStudents.length} students on ${selectedDate}.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not save attendance.');
    } finally {
      setSavingAttendance(false);
    }
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm('Delete this attendance entry?')) return;
    try {
      await api.deleteAttendance(id);
      setSuccess('Attendance record deleted.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete record.');
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

      <div className="attendance-grid">
        {/* Attendance Recording Sheet */}
        <section className="table-card">
          <div className="table-heading-bar">
            <div>
              <h2>Record Attendance Session</h2>
              <p className="card-subtext">Select class date and subject to log attendance</p>
            </div>
            <div className="quick-fill-row">
              <button type="button" className="text-pill-btn" onClick={() => setAllStatus('PRESENT')}>
                Mark All Present
              </button>
              <button type="button" className="text-pill-btn" onClick={() => setAllStatus('ABSENT')}>
                Mark All Absent
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAttendance}>
            <div className="attendance-selectors-row">
              <label>
                Session Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Subject / Course
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name} ({sub.departmentCode})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ROLL / ID</th>
                    <th>STUDENT NAME</th>
                    <th>DEPARTMENT</th>
                    <th>STATUS SELECTION</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.map((st) => {
                    const currentStatus = attendanceSheet[st.id] || 'PRESENT';
                    return (
                      <tr key={st.id}>
                        <td>#{st.id}</td>
                        <td><strong>{st.name}</strong></td>
                        <td><span className="department-tag">{st.department}</span></td>
                        <td>
                          <div className="status-radio-group">
                            <label className={`radio-pill ${currentStatus === 'PRESENT' ? 'radio-present' : ''}`}>
                              <input
                                type="radio"
                                name={`status-${st.id}`}
                                value="PRESENT"
                                checked={currentStatus === 'PRESENT'}
                                onChange={() => handleStatusChange(st.id, 'PRESENT')}
                              />
                              Present
                            </label>

                            <label className={`radio-pill ${currentStatus === 'ABSENT' ? 'radio-absent' : ''}`}>
                              <input
                                type="radio"
                                name={`status-${st.id}`}
                                value="ABSENT"
                                checked={currentStatus === 'ABSENT'}
                                onChange={() => handleStatusChange(st.id, 'ABSENT')}
                              />
                              Absent
                            </label>

                            <label className={`radio-pill ${currentStatus === 'LATE' ? 'radio-late' : ''}`}>
                              <input
                                type="radio"
                                name={`status-${st.id}`}
                                value="LATE"
                                checked={currentStatus === 'LATE'}
                                onChange={() => handleStatusChange(st.id, 'LATE')}
                              />
                              Late
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {eligibleStudents.length === 0 && (
                <p className="message">No students match this course's department.</p>
              )}
            </div>

            {eligibleStudents.length > 0 && (
              <div className="form-submit-row">
                <button type="submit" className="primary-button" disabled={savingAttendance}>
                  {savingAttendance ? 'Saving Attendance...' : `Save Attendance (${eligibleStudents.length} Students)`}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Recent Attendance Log */}
        <section className="table-card">
          <div className="table-heading-bar">
            <div>
              <h3>Recent Attendance Records</h3>
              <p className="card-subtext">Logged classroom entries</p>
            </div>
            <span className="count-pill">{history.length} records</span>
          </div>

          <div className="table-scroll max-height-scroll">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>STUDENT</th>
                  <th>SUBJECT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 25).map((h) => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td><strong>{h.student?.name}</strong></td>
                    <td>{h.subject?.code}</td>
                    <td>
                      <span className={`status-badge badge-${h.status.toLowerCase()}`}>
                        {h.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete-icon-btn"
                        onClick={() => handleDeleteRecord(h.id)}
                        title="Delete entry"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {history.length === 0 && (
              <p className="message">No attendance records logged yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
