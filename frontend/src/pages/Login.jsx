import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { email, password } = loginForm
    if (!email || !password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    const result = login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { name, email, password, confirm } = registerForm
    if (!name || !email || !password) {
      setError('All fields are required')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = register(name, email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__left">
        <div className="login-page__brand">
          <div className="login-page__logo" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="login-page__brand-name">RISKPULSE</h1>
          <p className="login-page__brand-tagline">Climate Risk Intelligence Platform</p>
        </div>
        <div className="login-page__info">
          <h2 className="login-page__info-title">Chennai Urban Flood Response</h2>
          <p className="login-page__info-desc">
            Real-time flood risk assessment and emergency coordination for Chennai.
            Access the operational dashboard to monitor risk levels, sensor networks,
            and citizen reports across the city.
          </p>
          <div className="login-page__info-features">
            <div className="login-page__info-feature">
              <span className="login-page__info-feature-dot" aria-hidden="true" />
              <span>5 monitored locations with live risk scores</span>
            </div>
            <div className="login-page__info-feature">
              <span className="login-page__info-feature-dot" aria-hidden="true" />
              <span>IoT sensor network health tracking</span>
            </div>
            <div className="login-page__info-feature">
              <span className="login-page__info-feature-dot" aria-hidden="true" />
              <span>Citizen report verification workflow</span>
            </div>
          </div>
        </div>
        <div className="login-page__footer">
          <span>RiskPulse v1.0.0</span>
          <span className="login-page__footer-sep" aria-hidden="true">&middot;</span>
          <span>Chennai Pilot</span>
        </div>
      </div>

      <div className="login-page__right">
        <div className="login-page__form-wrapper">
          <div className="login-page__form-header">
            <h2 className="login-page__form-title">
              {mode === 'login' ? 'Sign in to Dashboard' : 'Create Account'}
            </h2>
            <p className="login-page__form-subtitle">
              {mode === 'login'
                ? 'Enter your credentials to access the operational dashboard.'
                : 'Register for viewer access to the risk monitoring system.'}
            </p>
          </div>

          {error && (
            <div className="login-page__error" role="alert">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form className="login-page__form" onSubmit={handleLogin} noValidate>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="login-page__input"
                  type="email"
                  placeholder="admin@riskpulse.gov.in"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="login-page__input"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                className="btn btn--primary login-page__submit"
                type="submit"
                disabled={loading}
                aria-label={loading ? 'Signing in...' : 'Sign in'}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="login-page__form" onSubmit={handleRegister} noValidate>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  className="login-page__input"
                  type="text"
                  placeholder="Enter your full name"
                  value={registerForm.name}
                  onChange={e => setRegisterForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  className="login-page__input"
                  type="email"
                  placeholder="you@example.com"
                  value={registerForm.email}
                  onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  className="login-page__input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={registerForm.password}
                  onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="login-page__field">
                <label className="login-page__label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  className="login-page__input"
                  type="password"
                  placeholder="Re-enter your password"
                  value={registerForm.confirm}
                  onChange={e => setRegisterForm(f => ({ ...f, confirm: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                className="btn btn--primary login-page__submit"
                type="submit"
                disabled={loading}
                aria-label={loading ? 'Creating account...' : 'Create account'}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="login-page__toggle">
            {mode === 'login' ? (
              <p>
                No account yet?{' '}
                <button className="login-page__link" onClick={() => { setMode('register'); setError('') }}>
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button className="login-page__link" onClick={() => { setMode('login'); setError('') }}>
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="login-page__hint">
            <p><strong>Demo credentials:</strong></p>
            <p>Email: admin@riskpulse.gov.in</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}