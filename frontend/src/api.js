const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  getDashboard: () => request('/dashboard'),
  getAnalytics: () => request('/analytics'),

  getTasks: (date) => request(`/tasks${date ? `?date=${date}` : ''}`),
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  getSubjects: () => request('/study/subjects'),
  createSubject: (body) => request('/study/subjects', { method: 'POST', body: JSON.stringify(body) }),
  deleteSubject: (id) => request(`/study/subjects/${id}`, { method: 'DELETE' }),
  getStudySessions: (period) => request(`/study/sessions${period ? `?period=${period}` : ''}`),
  createStudySession: (body) => request('/study/sessions', { method: 'POST', body: JSON.stringify(body) }),
  getStudyStats: (period) => request(`/study/stats?period=${period || 'week'}`),

  getHabits: () => request('/habits'),
  createHabit: (body) => request('/habits', { method: 'POST', body: JSON.stringify(body) }),
  toggleHabit: (id) => request(`/habits/${id}/toggle`, { method: 'PATCH' }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: 'DELETE' }),

  getNotes: () => request('/notes'),
  createNote: (body) => request('/notes', { method: 'POST', body: JSON.stringify(body) }),
  updateNote: (id, body) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  getFocusSessions: () => request('/focus/sessions'),
  createFocusSession: (body) => request('/focus/sessions', { method: 'POST', body: JSON.stringify(body) }),
  getFocusTodayCount: () => request('/focus/today-count'),
};
