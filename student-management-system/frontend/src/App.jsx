
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = `${
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
}/api/students`

function getErrorMessage(data, fallback) {
  if (!data) return fallback

  if (data.message) return data.message
  if (data.error && data.error !== 'Bad Request') return data.error

  // Spring validation errors are often returned as field-to-message objects.
  const fieldMessages = Object.entries(data)
    .filter(([key, value]) =>
      typeof value === 'string' &&
      !['timestamp', 'status', 'error', 'path'].includes(key)
    )
    .map(([field, message]) => `${field}: ${message}`)

  if (fieldMessages.length) return fieldMessages.join(' • ')

  return fallback
}

async function readResponse(response, fallback) {
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, fallback))
  }

  return data
}

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    year: 1,
  })

  async function loadStudents() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)
      const data = await readResponse(response, 'Could not load students.')
      setStudents(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load students. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  function openAddForm() {
    setError('')
    setSuccess('')
    setEditingId(null)
    setForm({ name: '', email: '', department: '', year: 1 })
    setShowForm(true)
  }

  function openEditForm(student) {
    setError('')
    setSuccess('')
    setEditingId(student.id)
    setForm({
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
    })
    setShowForm(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      year: Number(form.year),
    }

    if (!payload.name || !payload.email || !payload.department) {
      setError('Please fill in all required fields.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      await readResponse(response, 'Could not save the student.')

      setShowForm(false)
      setSuccess(editingId
        ? 'Student updated successfully.'
        : 'Student created successfully.')

      await loadStudents()
    } catch (err) {
      setError(err.message || 'Could not save the student.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name}?`)) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/${student.id}`, {
        method: 'DELETE',
      })

      await readResponse(response, 'Could not delete the student.')

      setSuccess('Student deleted successfully.')
      await loadStudents()
    } catch (err) {
      setError(err.message || 'Could not delete the student.')
    }
  }

  const filteredStudents = students.filter((student) =>
    [student.name, student.email, student.department]
      .some((value) =>
        String(value ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
  )

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">S</span> StudentHub
        </div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Students</div>
        <div className="sidebar-note">Student Management System</div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / STUDENTS</p>
            <h1>Student Management</h1>
            <p className="subtitle">
              Manage your student records in one place.
            </p>
          </div>
          <button className="primary-button" onClick={openAddForm}>
            + Add Student
          </button>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-banner" role="status">
            {success}
            <button
              type="button"
              onClick={() => setSuccess('')}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon blue">♙</span>
            <p>Total Students</p>
            <h2>{students.length}</h2>
          </article>
          <article className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Departments</p>
            <h2>{new Set(students.map((s) => s.department)).size}</h2>
          </article>
          <article className="stat-card">
            <span className="stat-icon purple">▤</span>
            <p>Search Results</p>
            <h2>{filteredStudents.length}</h2>
          </article>
        </section>

        <section className="table-card">
          <div className="table-heading">
            <div>
              <h2>All Students</h2>
              <p>View and manage student information</p>
            </div>
            <input
              className="search-input"
              placeholder="Search students..."
              aria-label="Search students"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <p className="message">Loading students...</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>STUDENT</th>
                    <th>EMAIL</th>
                    <th>DEPARTMENT</th>
                    <th>YEAR</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>#{student.id}</td>
                      <td><strong>{student.name}</strong></td>
                      <td>{student.email}</td>
                      <td>
                        <span className="department-tag">
                          {student.department}
                        </span>
                      </td>
                      <td>{student.year}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit-button"
                            onClick={() => openEditForm(student)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deleteStudent(student)}
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
                  {search
                    ? 'No students match your search.'
                    : 'No students found. Add your first student.'}
                </p>
              )}
            </div>
          )}
        </section>

        {showForm && (
          <div className="modal-backdrop">
            <section
              className="student-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-modal-title"
            >
              <div className="modal-heading">
                <div>
                  <h2 id="student-modal-title">
                    {editingId ? 'Edit Student' : 'Add Student'}
                  </h2>
                  <p>Enter the student details below.</p>
                </div>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="error-banner" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label>
                  Full Name
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </label>

                <label>
                  Email Address
                  <input
                    required
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </label>

                <label>
                  Department
                  <input
                    required
                    maxLength={100}
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  />
                </label>

                <label>
                  Academic Year
                  <select
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: e.target.value })
                    }
                  >
                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingId
                        ? 'Save Changes'
                        : 'Create Student'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
