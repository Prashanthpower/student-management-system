const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function getStoredToken() {
  return localStorage.getItem('sms_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('sms_token', token);
  } else {
    localStorage.removeItem('sms_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('sms_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('sms_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sms_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return await response.blob();
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    if (typeof data === 'string') {
      errorMsg = data;
    } else if (data?.message) {
      errorMsg = data.message;
    } else if (data?.error && data.error !== 'Bad Request') {
      errorMsg = data.error;
    } else if (data && typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .filter(([k, v]) => typeof v === 'string' && !['status', 'path', 'timestamp', 'error'].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join(' • ');
      errorMsg = fieldErrors || data.error || 'Request failed';
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/api/auth/me'),
  changePassword: (passwords) => apiRequest('/api/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
  createStudentAccount: (studentId, credentials) =>
    apiRequest(`/api/auth/students/${studentId}/create-account`, { method: 'POST', body: JSON.stringify(credentials) }),

  // Students
  getStudents: () => apiRequest('/api/students'),
  getStudentById: (id) => apiRequest(`/api/students/${id}`),
  createStudent: (student) => apiRequest('/api/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id, student) => apiRequest(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  deleteStudent: (id) => apiRequest(`/api/students/${id}`, { method: 'DELETE' }),

  // Departments
  getDepartments: () => apiRequest('/api/departments'),
  createDepartment: (dept) => apiRequest('/api/departments', { method: 'POST', body: JSON.stringify(dept) }),
  updateDepartment: (id, dept) => apiRequest(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(dept) }),
  deleteDepartment: (id) => apiRequest(`/api/departments/${id}`, { method: 'DELETE' }),

  // Subjects
  getSubjects: (dept) => apiRequest(dept ? `/api/subjects?department=${encodeURIComponent(dept)}` : '/api/subjects'),
  createSubject: (subject) => apiRequest('/api/subjects', { method: 'POST', body: JSON.stringify(subject) }),
  updateSubject: (id, subject) => apiRequest(`/api/subjects/${id}`, { method: 'PUT', body: JSON.stringify(subject) }),
  deleteSubject: (id) => apiRequest(`/api/subjects/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/api/attendance?${query}` : '/api/attendance');
  },
  getAttendanceSummary: (studentId) => apiRequest(`/api/attendance/summary/${studentId}`),
  recordAttendance: (data) => apiRequest('/api/attendance', { method: 'POST', body: JSON.stringify(data) }),
  deleteAttendance: (id) => apiRequest(`/api/attendance/${id}`, { method: 'DELETE' }),

  // Marks
  getMarks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(query ? `/api/marks?${query}` : '/api/marks');
  },
  enterMark: (data) => apiRequest('/api/marks', { method: 'POST', body: JSON.stringify(data) }),
  updateMark: (id, data) => apiRequest(`/api/marks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMark: (id) => apiRequest(`/api/marks/${id}`, { method: 'DELETE' }),

  // Reports
  getReportsSummary: () => apiRequest('/api/reports/summary'),
  getDepartmentStats: () => apiRequest('/api/reports/department-stats'),
  downloadStudentsCsv: () => apiRequest('/api/reports/students/csv'),

  // Student Portal
  getStudentProfile: () => apiRequest('/api/student-portal/profile'),
  updateStudentProfile: (data) => apiRequest('/api/student-portal/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getStudentSubjects: () => apiRequest('/api/student-portal/subjects'),
  getStudentAttendance: () => apiRequest('/api/student-portal/attendance'),
  getStudentMarks: () => apiRequest('/api/student-portal/marks'),
};
