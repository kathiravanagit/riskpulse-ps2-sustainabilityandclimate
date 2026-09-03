import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_ADMIN = {
  email: 'admin@riskpulse.gov.in',
  password: 'admin123',
  name: 'System Administrator',
  role: 'admin'
}

function getUsers() {
  try {
    const stored = localStorage.getItem('riskpulse_users')
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveUsers(users) {
  localStorage.setItem('riskpulse_users', JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('riskpulse_session')
      if (stored) setUser(JSON.parse(stored))
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      const u = { ...DEMO_ADMIN }
      delete u.password
      setUser(u)
      localStorage.setItem('riskpulse_session', JSON.stringify(u))
      return { success: true }
    }

    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      const u = { email: found.email, name: found.name, role: found.role }
      setUser(u)
      localStorage.setItem('riskpulse_session', JSON.stringify(u))
      return { success: true }
    }

    return { success: false, error: 'Invalid email or password' }
  }

  const register = (name, email, password) => {
    if (email === DEMO_ADMIN.email) {
      return { success: false, error: 'This email is reserved' }
    }

    const users = getUsers()
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists' }
    }

    const newUser = { name, email, password, role: 'viewer' }
    users.push(newUser)
    saveUsers(users)

    const u = { email, name, role: 'viewer' }
    setUser(u)
    localStorage.setItem('riskpulse_session', JSON.stringify(u))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('riskpulse_session')
  }

  const can = (permission) => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (permission === 'read') return true
    return false
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}