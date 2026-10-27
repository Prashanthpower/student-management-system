import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationBanner from '../../components/NotificationBanner';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', department: '', year: 1 });
  const [saving, setSaving] = useState(false);

  // Account creation modal
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountStudent, setAccountStudent] = useState(null);
  const [accountForm, setAccountForm] = useState({ username: '', password: '' });
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Student Profile detail view modal
  const [viewingStudent, setViewingStudent] = useState(null);

  // Delete confirmation
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [studentsData, deptsData] = await Promise.all([
        api.getStudents(),
        api.getDepartments(),
      ]);
      setStudents(studentsData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      setError(err.message || 'Could not load student records.');
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
    setStudentForm({ name: '', email: '', department: defaultDept, year: 1 });
    setShowStudentModal(true);
  }

  function openEditModal(student) {
    setError('');
    setSuccess('');
    setEditingId(student.id);
    setStudentForm({
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
    });
    setShowStudentModal(true);
  }

  async function handleStudentSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.department.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.updateStudent(editingId, {
          name: studentForm.name.trim(),
          email: studentForm.email.trim(),
          department: studentForm.department.trim(),
          year: Number(studentForm.year),
        });
        setSuccess('Student record updated successfully.');
      } else {
        await api.createStudent({
          name: studentForm.name.trim(),
          email: studentForm.email.trim(),
          department: studentForm.department.trim(),
          year: Number(studentForm.year),
        });
        setSuccess(`New student registered! Login created: Email: "${studentForm.email}" with default password "abc@123".`);
      }
      setShowStudentModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  }

  function openAccountModal(student) {
    setError('');
    setSuccess('');
    setAccountStudent(student);
    const suggestedUsername = student.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    setAccountForm({ username: suggestedUsername, password: 'Student@123' });
    setShowAccountModal(true);
  }

  async function handleCreateAccount(e) {
    e.preventDefault();
    if (!accountStudent) return;
    setCreatingAccount(true);
    setError('');

    try {
      await api.createStudentAccount(accountStudent.id, {
        username: accountForm.username.trim(),
        password: accountForm.password,
      });
      setSuccess(`Portal account created for ${accountStudent.name}! Username: ${accountForm.username}`);
      setShowAccountModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create student account.');
    } finally {
      setCreatingAccount(false);
    }
  }

  async function confirmDelete() {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.deleteStudent(deletingStudent.id);
      setSuccess(`Student ${deletingStudent.name} deleted successfully.`);
      setDeletingStudent(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete student.');
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch = [s.name, s.email, s.department, String(s.id)]
      .some((val) => String(val || '').toLowerCase().includes(search.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || s.department.toUpperCase() === selectedDept.toUpperCase();
    const matchesYear = selectedYear === 'ALL' || String(s.year) === String(selectedYear);
    return matchesSearch && matchesDept && matchesYear;
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
            <h2>Student Roster</h2>
            <p className="card-subtext">Manage, enroll, and provision student accounts</p>
          </div>

          <button type="button" className="primary-button" onClick={openAddModal}>
            + Register Student
          </button>
        </div>

        <div className="filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, department or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="ALL">All Academic Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="message">Loading students...</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>STUDENT NAME</th>
                  <th>EMAIL</th>
                  <th>DEPARTMENT</th>
                  <th>YEAR</th>
                  <th>PORTAL ACCOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>#{student.id}</td>
                    <td>
                      <button
                        type="button"
                        className="student-name-link"
                        onClick={() => setViewingStudent(student)}
                      >
                        <strong>{student.name}</strong>
                      </button>
                    </td>
                    <td>{student.email}</td>
                    <td><span className="department-tag">{student.department}</span></td>
                    <td>Year {student.year}</td>
                    <td>
                      <span className="status-badge badge-present" title="Password: abc@123">
                        ✓ {student.email}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="view-btn"
                          onClick={() => setViewingStudent(student)}
                          title="View Profile"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditModal(student)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => setDeletingStudent(student)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <p className="message">
                {search || selectedDept !== 'ALL' || selectedYear !== 'ALL'
                  ? 'No students match your filter criteria.'
                  : 'No student records found. Add your first student above.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="modal-backdrop">
          <section className="student-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'Edit Student Record' : 'Register New Student'}</h2>
                <p>Provide student academic information below.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setShowStudentModal(false)}>×</button>
            </div>

            <form onSubmit={handleStudentSubmit}>
              <label>
                Full Name *
                <input
                  required
                  placeholder="e.g. John Doe"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                />
              </label>

              <label>
                Email Address *
                <input
                  required
                  type="email"
                  placeholder="e.g. john.doe@college.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
              </label>

              <label>
                Department *
                <select
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="CSE">CSE - Computer Science & Engineering</option>
                      <option value="ECE">ECE - Electronics & Communication</option>
                      <option value="MECH">MECH - Mechanical Engineering</option>
                      <option value="CIVIL">CIVIL - Civil Engineering</option>
                    </>
                  )}
                </select>
              </label>

              <label>
                Academic Year *
                <select
                  value={studentForm.year}
                  onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Junior)</option>
                  <option value={4}>Year 4 (Senior)</option>
                </select>
              </label>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowStudentModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Create Account Modal */}
      {showAccountModal && accountStudent && (
        <div className="modal-backdrop">
          <section className="student-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>Create Student Login</h2>
                <p>Assign credentials for <strong>{accountStudent.name}</strong></p>
              </div>
              <button type="button" className="close-button" onClick={() => setShowAccountModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateAccount}>
              <div className="info-banner">
                <span>ℹ️</span> This will create a verified <strong>STUDENT</strong> portal account linked to student ID #{accountStudent.id}.
              </div>

              <label>
                Username *
                <input
                  required
                  minLength={3}
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                />
              </label>

              <label>
                Initial Password *
                <input
                  required
                  minLength={6}
                  value={accountForm.password}
                  onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAccountModal(false)} disabled={creatingAccount}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={creatingAccount}>
                  {creatingAccount ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Student Profile View Modal */}
      {viewingStudent && (
        <div className="modal-backdrop">
          <section className="student-modal profile-detail-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>Student Profile</h2>
                <p>Record ID #{viewingStudent.id}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setViewingStudent(null)}>×</button>
            </div>

            <div className="profile-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{viewingStudent.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{viewingStudent.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value"><span className="department-tag">{viewingStudent.department}</span></span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Academic Year</span>
                <span className="detail-value">Year {viewingStudent.year}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Portal Account</span>
                <span className="detail-value">
                  {viewingStudent.user ? (
                    <span className="status-badge badge-present">Linked ({viewingStudent.user.username})</span>
                  ) : (
                    <span className="status-badge badge-neutral">Not provisioned</span>
                  )}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="primary-button" onClick={() => setViewingStudent(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingStudent}
        title="Delete Student Record"
        message={`Are you sure you want to delete student "${deletingStudent?.name}"? All associated attendance and marks records will also be removed. This operation cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingStudent(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
