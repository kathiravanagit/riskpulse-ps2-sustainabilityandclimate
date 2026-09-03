import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing({ demoMode }) {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/dashboard')
  }

  return (
    <div className="landing">
      <div className="landing__hero">
        <div className="landing__hero-content">
          <div className="landing__hero-badge">Chennai Urban Flood Intelligence</div>
          <h1 className="landing__hero-title">
            RiskPulse
          </h1>
          <p className="landing__hero-subtitle">
            Real-time flood risk assessment for Chennai. Monitor water levels, track sensor networks, and coordinate emergency response from a single operational dashboard.
          </p>
          <div className="landing__hero-actions">
            <button className="btn btn--primary btn--lg" onClick={handleGetStarted} aria-label="Enter the RiskPulse dashboard">
              Open Dashboard
            </button>
            <button className="btn btn--secondary btn--lg" onClick={() => navigate('/analytics')} aria-label="View risk analytics">
              View Analytics
            </button>
          </div>
          {demoMode && (
            <p className="landing__hero-note" role="status">
              Running in demo mode with synthetic data.
            </p>
          )}
        </div>
      </div>

      <div className="landing__features">
        <div className="landing__features-header">
          <h2 className="landing__features-title">Platform Capabilities</h2>
          <p className="landing__features-subtitle">Built for emergency operations teams managing urban flood response.</p>
        </div>
        <div className="landing__features-grid">
          <div className="landing__feature-card">
            <div className="landing__feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
            <h3 className="landing__feature-title">Geospatial Risk Map</h3>
            <p className="landing__feature-desc">Real-time visualization of flood risk across Chennai. Click any location for detailed analysis and action recommendations.</p>
          </div>
          <div className="landing__feature-card">
            <div className="landing__feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>
            </div>
            <h3 className="landing__feature-title">Priority Queue</h3>
            <p className="landing__feature-desc">Ranked response queue combining risk scores with vulnerability data. Know which locations need attention first.</p>
          </div>
          <div className="landing__feature-card">
            <div className="landing__feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
            </div>
            <h3 className="landing__feature-title">Sensor Network</h3>
            <p className="landing__feature-desc">Monitor IoT sensor health, track connectivity status, and view the latest environmental readings from across the city.</p>
          </div>
          <div className="landing__feature-card">
            <div className="landing__feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </div>
            <h3 className="landing__feature-title">Citizen Reports</h3>
            <p className="landing__feature-desc">Crowd-sourced observations from verified reporters. Filter by severity and status to identify emerging issues.</p>
          </div>
        </div>
      </div>

      <div className="landing__data-notice">
        <p>
          <strong>Data Notice:</strong> This application uses synthetic data for demonstration purposes. 
          All sensor readings, risk scores, and citizen reports are generated, not collected from live sources.
        </p>
      </div>
    </div>
  )
}