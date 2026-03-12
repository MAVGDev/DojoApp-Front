import api from './api'

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },
  register: async (payload) => {
    const res = await api.post('/auth/register', payload)
    return res.data
  },
}

// ─── STUDENTS ────────────────────────────────────────────────────────────────
export const studentService = {
  // Student self
  getMyProfile: async () => {
    const res = await api.get('/students/me')
    return res.data
  },
  updateMyProfile: async (payload) => {
    const res = await api.put('/students/me', payload)
    return res.data
  },
  uploadMyPhoto: async (file) => {
    const form = new FormData()
    form.append('foto', file)
    const res = await api.put('/students/me/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  deleteMyPhoto: async () => {
    const res = await api.delete('/students/me/photo')
    return res.data
  },

  // Admin
  getAll: async (params = {}) => {
    const res = await api.get('/students', { params })
    return res.data
  },
  search: async (query) => {
    const res = await api.get('/students/search', { params: { q: query } })
    return res.data
  },
  getById: async (id) => {
    const res = await api.get(`/students/${id}`)
    return res.data
  },
  update: async (id, payload) => {
    const res = await api.put(`/students/${id}`, payload)
    return res.data
  },
  deactivate: async (id) => {
    const res = await api.delete(`/students/${id}`)
    return res.data
  },
  uploadPhoto: async (id, file) => {
    const form = new FormData()
    form.append('foto', file)
    const res = await api.put(`/students/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  deletePhoto: async (id) => {
    const res = await api.delete(`/students/${id}/photo`)
    return res.data
  },
}

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
export const paymentService = {
  getMyPayments: async () => {
    const res = await api.get('/payments/me')
    return res.data
  },
  getStudentPayments: async (studentId) => {
    const res = await api.get(`/payments/student/${studentId}`)
    return res.data
  },
  getAlerts: async () => {
    const res = await api.get('/payments/alerts')
    return res.data
  },
  getMonthlyReport: async (params = {}) => {
    const res = await api.get('/payments/report', { params })
    return res.data
  },
  create: async (payload) => {
    const res = await api.post('/payments', payload)
    return res.data
  },
  markAsPaid: async (paymentId, payload = {}) => {
    const res = await api.put(`/payments/${paymentId}/paid`, payload)
    return res.data
  },
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const eventService = {
  getAll: async () => {
    const res = await api.get('/events')
    return res.data
  },
  getUpcoming: async () => {
    const res = await api.get('/events/upcoming')
    return res.data
  },
  getToday: async () => {
    const res = await api.get('/events/today')
    return res.data
  },
  getById: async (id) => {
    const res = await api.get(`/events/${id}`)
    return res.data
  },
  create: async (payload) => {
    const res = await api.post('/events', payload)
    return res.data
  },
  update: async (id, payload) => {
    const res = await api.put(`/events/${id}`, payload)
    return res.data
  },
  delete: async (id) => {
    const res = await api.delete(`/events/${id}`)
    return res.data
  },
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardService = {
  // Admin
  getStats: async () => {
    const res = await api.get('/dashboard/admin/stats')
    return res.data
  },
  getDistribution: async () => {
    const res = await api.get('/dashboard/admin/distribution')
    return res.data
  },
  getPaymentsStatus: async () => {
    const res = await api.get('/dashboard/admin/payments-status')
    return res.data
  },
  getAdminUpcomingEvents: async () => {
    const res = await api.get('/dashboard/admin/upcoming-events')
    return res.data
  },
  getActiveAlerts: async () => {
    const res = await api.get('/dashboard/admin/active-alerts')
    return res.data
  },
  getRecentStudents: async () => {
    const res = await api.get('/dashboard/admin/recent-students')
    return res.data
  },
  // Student
  getStudentDashboard: async (id) => {
    const res = await api.get(`/dashboard/student/${id}`)
    return res.data
  },
}

// ─── CHARGES ─────────────────────────────────────────────────────────────────
export const chargeService = {
  getAll: async (params = {}) => {
    const res = await api.get('/charges', { params })
    return res.data
  },
  getMyCharges: async () => {
    const res = await api.get('/charges/me')
    return res.data
  },
  create: async (payload) => {
    const res = await api.post('/charges', payload)
    return res.data
  },
  markAsPaid: async (id, payload = {}) => {
    const res = await api.put(`/charges/${id}/paid`, payload)
    return res.data
  },
  delete: async (id) => {
    const res = await api.delete(`/charges/${id}`)
    return res.data
  },
}