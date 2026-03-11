import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('dojo_token'))
  const [loading, setLoading] = useState(true)

  // On mount, if token exists try to restore session
  useEffect(() => {
    const storedToken = localStorage.getItem('dojo_token')
    const storedUser  = localStorage.getItem('dojo_user')
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setToken(storedToken)
      } catch {
        localStorage.removeItem('dojo_token')
        localStorage.removeItem('dojo_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    // authController devuelve { _id, email, role, token } en la raíz
    const newToken = data.token
    const newUser  = { _id: data._id, email: data.email, role: data.role }
    localStorage.setItem('dojo_token', newToken)
    localStorage.setItem('dojo_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dojo_token')
    localStorage.removeItem('dojo_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin   = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}