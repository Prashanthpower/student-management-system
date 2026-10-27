import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationBanner from '../../components/NotificationBanner';

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 1,
    departmentCode: '',
  });
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [subsData, deptsData] = await Promise.all([
        api.getSubjects(),
        api.getDepartments(),
      ]);
      setSubjects(subsData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      setError(err.message || 'Could not load courses/subjects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddModal() {
    setError('');
    setSuccess('');
    setEditingId(null);
    const defaultDept = departments.length > 0 ? departments[0].code : 'CSE';
    setForm({
      code: '',
      name: '',
      credits: 3,
      semester: 1,
      departmentCode: defaultDept,
    });
    setShowModal(true);
  }

  function openEditModal(sub) {
    setError('');
    setSuccess('');
    setEditingId(sub.id);
    setForm({
      code: sub.code,
      name: sub.name,
      credits: sub.credits,
      semester: sub.semester,
      departmentCode: sub.departmentCode,
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.code.trim() || !form.name.trim() || !form.departmentCode.trim()) {
      setError('Please fill in code, name, and department.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        name: form.name.trim(),
        credits: Number(form.credits),
        semester: Number(form.semester),
        departmentCode: form.departmentCode.toUpperCase().trim(),
      };

      if (editingId) {
        await api.updateSubject(editingId, payload);
        setSuccess('Course / Subject updated successfully.');
      } else {
        await api.createSubject(payload);
        setSuccess('New course / subject created successfully.');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingSubject) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteSubject(deletingSubject.id);
      setSuccess(`Subject "${deletingSubject.code}" deleted successfully.`);
      setDeletingSubject(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete subject.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredSubjects = subjects.filter((s) => {
    const matchDept = selectedDept === 'ALL' || s.departmentCode.toUpperCase() === selectedDept.toUpperCase();
    const matchSem = selectedSemester === 'ALL' || String(s.semester) === String(selectedSemester);
    return matchDept && matchSem;
  });

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
            <h2>Courses & Subjects</h2>
            <p className="card-subtext">Manage curriculum, credit weightings, and departmental assignments</p>
          </div>
          <button type="button" className="primary-button" onClick={openAddModal}>
            + Add Course / Subject
          </button>
        </div>

        <div className="filters-row">
          <div className="filter-selects">
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>

            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="message">Loading subjects...</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>SUBJECT / COURSE TITLE</th>
                  <th>DEPARTMENT</th>
                  <th>SEMESTER</th>
                  <th>CREDITS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id}>
                    <td><strong>{sub.code}</strong></td>
                    <td>{sub.name}</td>
                    <td><span className="department-tag">{sub.departmentCode}</span></td>
                    <td>Semester {sub.semester}</td>
                    <td>
                      <span className="credits-badge">{sub.credits} Credits</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditModal(sub)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => setDeletingSubject(sub)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSubjects.length === 0 && (
              <p className="message">No subjects found for the selected filter criteria.</p>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <section className="student-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'Edit Subject' : 'Add Subject / Course'}</h2>
                <p>Provide subject details below.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Subject Code * (e.g. CS101, EC202)
                <input
                  required
                  maxLength={15}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </label>

              <label>
                Subject Name *
                <input
                  required
                  maxLength={120}
                  placeholder="e.g. Data Structures & Algorithms"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Department *
                <select
                  value={form.departmentCode}
                  onChange={(e) => setForm({ ...form, departmentCode: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </label>

              <div className="form-row-two">
                <label>
                  Credits (1-6)
                  <select
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>{c} Credit{c > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Semester (1-8)
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingSubject}
        title="Delete Subject"
        message={`Delete subject "${deletingSubject?.code} - ${deletingSubject?.name}"? Attendance or marks attached to this subject will also be deleted.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingSubject(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
