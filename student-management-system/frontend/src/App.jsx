
import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080/api/students'

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
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
      if (!response.ok) throw new Error('Could not load students')
      setStudents(await response.json())
    } catch {
      setError('Unable to connect to the backend. Check Spring Boot and CORS.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  function openAddForm() {
    setEditingId(null)
    setForm({ name: '', email: '', department: '', year: 1 })
    setShowForm(true)
  }

  function openEditForm(student) {
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

    try {
      const response = await fetch(
        editingId ? `${API_URL}/${editingId}` : API_URL,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            year: Number(form.year),
          }),
        },
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Could not save student')
      }

      setShowForm(false)
      await loadStudents()
    } catch (err) {
      setError(err.message || 'Could not save student')
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name}?`)) return

    setError('')

    try {
      const response = await fetch(`${API_URL}/${student.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Could not delete student')
      await loadStudents()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredStudents = students.filter((student) =>
    [student.name, student.email, student.department]
      .some((value) => value.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">S</span> StudentHub</div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Students</div>
        <div className="sidebar-note">Student Management System</div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE / STUDENTS</p>
            <h1>Student Management</h1>
            <p className="subtitle">Manage your student records in one place.</p>
          </div>
          <button className="primary-button" onClick={openAddForm}>
            + Add Student
          </button>
        </header>

        {error && <div className="error-banner">{error}</div>}

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
                      <td><span className="department-tag">{student.department}</span></td>
                      <td>{student.year}</td>
                      <td>
                        <div className="actions">
                          <button className="edit-button" onClick={() => openEditForm(student)}>Edit</button>
                          <button className="delete-button" onClick={() => deleteStudent(student)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <p className="message">
                  {search ? 'No students match your search.' : 'No students found. Add your first student.'}
                </p>
              )}
            </div>
          )}
        </section>

        {showForm && (
          <div className="modal-backdrop">
            <section className="student-modal">
              <div className="modal-heading">
                <div>
                  <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>
                  <p>Enter the student details below.</p>
                </div>
                <button className="close-button" onClick={() => setShowForm(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <label>
                  Full Name
                  <input required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label>
                  Email Address
                  <input required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </label>
                <label>
                  Department
                  <input required value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </label>
                <label>
                  Academic Year
                  <select value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}>
                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>Year {year}</option>
                    ))}
                  </select>
                </label>
                <div className="form-actions">
                  <button type="button" className="cancel-button"
                    onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-button">
                    {editingId ? 'Save Changes' : 'Create Student'}
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
