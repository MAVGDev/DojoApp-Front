import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute, RoleRoute } from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Auth pages
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents  from './pages/admin/AdminStudents'
import AdminPayments  from './pages/admin/AdminPayments'
import AdminEvents    from './pages/admin/AdminEvents'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile   from './pages/student/StudentProfile'
import StudentPayments  from './pages/student/StudentPayments'
import StudentEvents    from './pages/student/StudentEvents'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<RootRedirect />} />

      {/* Admin routes */}
      <Route element={<RoleRoute role="admin" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin"           element={<AdminDashboard />} />
          <Route path="/admin/students"  element={<AdminStudents />} />
          <Route path="/admin/payments"  element={<AdminPayments />} />
          <Route path="/admin/events"    element={<AdminEvents />} />
        </Route>
      </Route>

      {/* Student routes */}
      <Route element={<RoleRoute role="student" />}>
        <Route element={<AppLayout />}>
          <Route path="/student"          element={<StudentDashboard />} />
          <Route path="/student/profile"  element={<StudentProfile />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/student/events"   element={<StudentEvents />} />
        </Route>
      </Route>

      {/* 404 → root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#E8E8E8',
              border: '1px solid #2A2A2A',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#27AE60', secondary: '#1A1A1A' } },
            error:   { iconTheme: { primary: '#C0392B', secondary: '#1A1A1A' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}