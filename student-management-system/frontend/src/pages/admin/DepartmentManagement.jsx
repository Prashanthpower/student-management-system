import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationBanner from '../../components/NotificationBanner';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingDept, setDeletingDept] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [deptsData, statsData] = await Promise.all([
        api.getDepartments(),
        api.getDepartmentStats(),
      ]);
      setDepartments(deptsData || []);
      setDeptStats(statsData || []);
    } catch (err) {
      setError(err.message || 'Could not load departments.');
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
    setForm({ code: '', name: '', description: '' });
    setShowModal(true);
  }

  function openEditModal(dept) {
    setError('');
    setSuccess('');
    setEditingId(dept.id);
    setForm({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.code.trim() || !form.name.trim()) {
      setError('Please provide both department code and name.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateDepartment(editingId, form);
        setSuccess('Department updated successfully.');
      } else {
        await api.createDepartment(form);
        setSuccess('Department created successfully.');
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingDept) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteDepartment(deletingDept.id);
      setSuccess(`Department ${deletingDept.code} deleted successfully.`);
      setDeletingDept(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete department.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function getStudentCount(code) {
    const item = deptStats.find((s) => String(s.code).toUpperCase() === String(code).toUpperCase());
    return item ? item.studentCount : 0;
  }

  function getSubjectCount(code) {
    const item = deptStats.find((s) => String(s.code).toUpperCase() === String(code).toUpperCase());
    return item ? item.subjectCount : 0;
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
            <h2>Academic Departments</h2>
            <p className="card-subtext">Manage college engineering faculties and disciplines</p>
          </div>
          <button type="button" className="primary-button" onClick={openAddModal}>
            + Add Department
          </button>
        </div>

        {loading ? (
          <p className="message">Loading departments...</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>DEPARTMENT NAME</th>
                  <th>DESCRIPTION</th>
                  <th>ENROLLED STUDENTS</th>
                  <th>OFFERED SUBJECTS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const studentCount = getStudentCount(dept.code);
                  const subjectCount = getSubjectCount(dept.code);
                  return (
                    <tr key={dept.id}>
                      <td><span className="department-tag">{dept.code}</span></td>
                      <td><strong>{dept.name}</strong></td>
                      <td>{dept.description || '—'}</td>
                      <td>
                        <span className="count-pill">{studentCount} students</span>
                      </td>
                      <td>
                        <span className="count-pill">{subjectCount} subjects</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => openEditModal(dept)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setDeletingDept(dept)}
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

            {departments.length === 0 && (
              <p className="message">No departments configured yet. Click above to add your first department.</p>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <section className="student-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'Edit Department' : 'Add Department'}</h2>
                <p>Provide department details below.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Department Code * (e.g. CSE, ECE)
                <input
                  required
                  maxLength={10}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </label>

              <label>
                Department Name *
                <input
                  required
                  maxLength={100}
                  placeholder="e.g. Computer Science & Engineering"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  placeholder="Optional brief description of the department"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingDept}
        title="Delete Department"
        message={`Delete department "${deletingDept?.code} - ${deletingDept?.name}"? Note: If any student or course is currently attached to this department, the system will block deletion for data safety.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDept(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
