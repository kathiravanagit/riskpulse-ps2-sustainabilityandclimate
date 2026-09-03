import { useState, useEffect, useRef } from 'react'
import './Topbar.css'

export default function Topbar({ onMenuToggle, onRefresh, refreshing, demoMode, onToggleDemo }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="topbar" role="banner">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuToggle} aria-label="Toggle navigation menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="topbar__brand">
          <span className="topbar__brand-name">RISKPULSE</span>
        </div>
      </div>

      <div className="topbar__center">
        <div className="topbar__status">
          <span className="topbar__status-dot topbar__status-dot--active" aria-hidden="true" />
          <span className="topbar__status-label">Monitoring Active</span>
        </div>
        <div className="topbar__separator" aria-hidden="true" />
        <span className="topbar__meta">System Connected</span>
      </div>

      <div className="topbar__right">
        {demoMode && <span className="topbar__demo-badge" aria-label="Demo mode active, using synthetic data">DEMO DATA</span>}
        <button
          className={`btn btn--ghost btn--sm ${demoMode ? 'btn--active-demo' : ''}`}
          onClick={onToggleDemo}
          aria-label={demoMode ? 'Disable demo mode' : 'Enable demo mode with synthetic data'}
          aria-pressed={demoMode}
        >
          {demoMode ? 'Demo On' : 'Demo Off'}
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? 'Refreshing data' : 'Refresh all data'}
          aria-busy={refreshing}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? 'spin' : ''} aria-hidden="true">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <div className="topbar__notif-wrap" ref={notifRef}>
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications, 3 unread"
            aria-expanded={notifOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="topbar__notif-count" aria-hidden="true">3</span>
          </button>
          {notifOpen && (
            <div className="topbar__notif-dropdown" role="menu" aria-label="Notifications">
              <div className="topbar__notif-header">Notifications</div>
              <div className="topbar__notif-item" role="menuitem">
                <span className="topbar__notif-dot topbar__notif-dot--critical" aria-hidden="true" />
                <div>
                  <div className="topbar__notif-title">CRITICAL: Pallikaranai water level rising</div>
                  <div className="topbar__notif-time">2 minutes ago</div>
                </div>
              </div>
              <div className="topbar__notif-item" role="menuitem">
                <span className="topbar__notif-dot topbar__notif-dot--high" aria-hidden="true" />
                <div>
                  <div className="topbar__notif-title">Sensor ESP32-VYASAR offline</div>
                  <div className="topbar__notif-time">8 minutes ago</div>
                </div>
              </div>
              <div className="topbar__notif-item" role="menuitem">
                <span className="topbar__notif-dot topbar__notif-dot--info" aria-hidden="true" />
                <div>
                  <div className="topbar__notif-title">New citizen report: CR-1024</div>
                  <div className="topbar__notif-time">12 minutes ago</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}