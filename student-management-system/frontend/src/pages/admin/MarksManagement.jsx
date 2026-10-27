import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationBanner from '../../components/NotificationBanner';

export default function MarksManagement() {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    studentId: '',
    subjectId: '',
    examType: 'Final Exam',
    marksObtained: '',
    maxMarks: '100',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterSubject, setFilterSubject] = useState('ALL');

  // Delete confirmation
  const [deletingMark, setDeletingMark] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [marksData, studentsData, subsData] = await Promise.all([
        api.getMarks(),
        api.getStudents(),
        api.getSubjects(),
      ]);
      setMarks(marksData || []);
      setStudents(studentsData || []);
      setSubjects(subsData || []);
    } catch (err) {
      setError(err.message || 'Could not load marks data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getCalculatedGrade(obtained, max) {
    const ob = Number(obtained) || 0;
    const mx = Number(max) || 100;
    if (mx <= 0) return 'F';
    const pct = (ob / mx) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
  }

  function openAddModal() {
    setError('');
    setSuccess('');
    setEditingId(null);
    setForm({
      studentId: students.length > 0 ? String(students[0].id) : '',
      subjectId: subjects.length > 0 ? String(subjects[0].id) : '',
      examType: 'Final Exam',
      marksObtained: '',
      maxMarks: '100',
      remarks: '',
    });
    setShowModal(true);
  }

  function openEditModal(m) {
    setError('');
    setSuccess('');
    setEditingId(m.id);
    setForm({
      studentId: String(m.student.id),
      subjectId: String(m.subject.id),
      examType: m.examType,
      marksObtained: String(m.marksObtained),
      maxMarks: String(m.maxMarks),
      remarks: m.remarks || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const obtained = Number(form.marksObtained);
    const max = Number(form.maxMarks);

    if (isNaN(obtained) || isNaN(max)) {
      setError('Marks must be valid numbers.');
      return;
    }

    if (obtained < 0) {
      setError('Marks obtained cannot be negative.');
      return;
    }

    if (obtained > max) {
      setError(`Marks obtained (${obtained}) cannot exceed maximum marks (${max}).`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        studentId: Number(form.studentId),
        subjectId: Number(form.subjectId),
        examType: form.examType,
        marksObtained: obtained,
        maxMarks: max,
        remarks: form.remarks,
      };

      if (editingId) {
        await api.updateMark(editingId, payload);
        setSuccess('Academic mark updated successfully.');
      } else {
        await api.enterMark(payload);
        setSuccess('Academic mark recorded successfully.');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not save marks record.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingMark) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteMark(deletingMark.id);
      setSuccess('Mark record deleted successfully.');
      setDeletingMark(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete mark.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredMarks = marks.filter((m) => {
    if (filterSubject === 'ALL') return true;
    return String(m.subject?.id) === String(filterSubject);
  });

  const previewGrade = getCalculatedGrade(form.marksObtained, form.maxMarks);

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
            <h2>Academic Marks & Grades</h2>
            <p className="card-subtext">Record test scores, evaluation assessments, and grade points</p>
          </div>
          <button type="button" className="primary-button" onClick={openAddModal}>
            + Enter Marks
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-selects">
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="ALL">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="message">Loading grades...</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>SUBJECT</th>
                  <th>EXAM TYPE</th>
                  <th>SCORE</th>
                  <th>PERCENTAGE</th>
                  <th>GRADE</th>
                  <th>REMARKS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((m) => {
                  const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                  return (
                    <tr key={m.id}>
                      <td><strong>{m.student?.name}</strong></td>
                      <td>{m.subject?.code} - {m.subject?.name}</td>
                      <td><span className="exam-tag">{m.examType}</span></td>
                      <td>{m.marksObtained} / {m.maxMarks}</td>
                      <td>{pct}%</td>
                      <td>
                        <span className={`grade-badge grade-${m.grade.replace('+', 'plus').toLowerCase()}`}>
                          {m.grade}
                        </span>
                      </td>
                      <td>{m.remarks || '—'}</td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => openEditModal(m)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setDeletingMark(m)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredMarks.length === 0 && (
              <p className="message">No marks records found.</p>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Marks Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <section className="student-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'Edit Exam Mark' : 'Enter Academic Mark'}</h2>
                <p>Assign score and evaluate letter grade</p>
              </div>
              <button type="button" className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Student *
                <select
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  required
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{st.id} - {st.name} ({st.department})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subject / Course *
                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  required
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Assessment / Exam Type *
                <select
                  value={form.examType}
                  onChange={(e) => setForm({ ...form, examType: e.target.value })}
                >
                  <option value="Final Exam">Final Exam</option>
                  <option value="Midterm 1">Midterm 1</option>
                  <option value="Midterm 2">Midterm 2</option>
                  <option value="Assignment">Assignment / Project</option>
                  <option value="Practical Lab">Practical / Lab Exam</option>
                  <option value="Quiz">Quiz / Continuous Assessment</option>
                </select>
              </label>

              <div className="form-row-two">
                <label>
                  Marks Obtained *
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 85"
                    value={form.marksObtained}
                    onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                    required
                  />
                </label>

                <label>
                  Max Marks *
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={form.maxMarks}
                    onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                    required
                  />
                </label>
              </div>

              {/* Live calculated grade preview */}
              <div className="grade-preview-box">
                <span>Calculated Grade: </span>
                <span className={`grade-badge grade-${previewGrade.replace('+', 'plus').toLowerCase()}`}>
                  {previewGrade}
                </span>
                <small className="grade-scale-hint">
                  (≥90 A+ • ≥80 A • ≥70 B+ • ≥60 B • ≥50 C • &lt;50 F)
                </small>
              </div>

              <label>
                Remarks
                <input
                  placeholder="Optional evaluator remarks"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Record Score'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingMark}
        title="Delete Mark Record"
        message={`Delete the score entry for ${deletingMark?.student?.name} (${deletingMark?.subject?.code} - ${deletingMark?.examType})?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingMark(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
