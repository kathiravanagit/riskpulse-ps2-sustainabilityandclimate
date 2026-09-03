import { createContext, useContext, useState, useEffect } from 'react'
import { clearAuthToken, getCurrentUser, loginUser, registerUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => clearAuthToken()).finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      setUser(await loginUser(email, password))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      setUser(await registerUser(name, email, password))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    clearAuthToken()
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