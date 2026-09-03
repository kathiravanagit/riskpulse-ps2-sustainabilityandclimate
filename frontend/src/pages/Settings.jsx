import { useState } from 'react'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      criticalAlerts: true,
      highRiskAlerts: true,
      sensorOffline: true,
      dailyDigest: false
    },
    thresholds: {
      critical: 80,
      high: 60,
      moderate: 40
    },
    display: {
      refreshInterval: 30,
      showSyntheticBadge: true
    }
  })

  const [saved, setSaved] = useState(false)

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] }
    }))
    setSaved(false)
  }

  const handleThresholdChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: parseInt(value) }
    }))
    setSaved(false)
  }

  const handleDisplayChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      display: { ...prev.display, [key]: typeof value === 'boolean' ? value : parseInt(value) }
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <div>
          <h1 className="settings-page__title">System Settings</h1>
          <p className="settings-page__subtitle">Configure thresholds, notifications, and display preferences.</p>
        </div>
      </div>

      <div className="settings-page__grid">
        <section className="settings-page__section" aria-labelledby="notif-heading">
          <h2 className="settings-page__section-title" id="notif-heading">Notifications</h2>
          <p className="settings-page__section-desc">Control which alerts trigger system notifications.</p>
          <div className="settings-page__items">
            <label className="settings-page__toggle-item">
              <div className="settings-page__toggle-info">
                <span className="settings-page__toggle-label">Critical risk alerts</span>
                <span className="settings-page__toggle-desc">Immediate notification when any location reaches CRITICAL risk level.</span>
              </div>
              <div className="settings-page__toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.criticalAlerts}
                  onChange={() => handleNotificationChange('criticalAlerts')}
                  aria-label="Enable critical risk alerts"
                />
                <span className="settings-page__toggle-slider" aria-hidden="true" />
              </div>
            </label>
            <label className="settings-page__toggle-item">
              <div className="settings-page__toggle-info">
                <span className="settings-page__toggle-label">High risk alerts</span>
                <span className="settings-page__toggle-desc">Notification when any location reaches HIGH risk level.</span>
              </div>
              <div className="settings-page__toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.highRiskAlerts}
                  onChange={() => handleNotificationChange('highRiskAlerts')}
                  aria-label="Enable high risk alerts"
                />
                <span className="settings-page__toggle-slider" aria-hidden="true" />
              </div>
            </label>
            <label className="settings-page__toggle-item">
              <div className="settings-page__toggle-info">
                <span className="settings-page__toggle-label">Sensor offline alerts</span>
                <span className="settings-page__toggle-desc">Notification when any IoT sensor loses connectivity.</span>
              </div>
              <div className="settings-page__toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.sensorOffline}
                  onChange={() => handleNotificationChange('sensorOffline')}
                  aria-label="Enable sensor offline alerts"
                />
                <span className="settings-page__toggle-slider" aria-hidden="true" />
              </div>
            </label>
            <label className="settings-page__toggle-item">
              <div className="settings-page__toggle-info">
                <span className="settings-page__toggle-label">Daily digest</span>
                <span className="settings-page__toggle-desc">Receive a summary of all risk changes at the end of each day.</span>
              </div>
              <div className="settings-page__toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.dailyDigest}
                  onChange={() => handleNotificationChange('dailyDigest')}
                  aria-label="Enable daily digest"
                />
                <span className="settings-page__toggle-slider" aria-hidden="true" />
              </div>
            </label>
          </div>
        </section>

        <section className="settings-page__section" aria-labelledby="threshold-heading">
          <h2 className="settings-page__section-title" id="threshold-heading">Risk Thresholds</h2>
          <p className="settings-page__section-desc">Adjust score thresholds that determine risk level classification.</p>
          <div className="settings-page__items">
            <div className="settings-page__slider-item">
              <div className="settings-page__slider-header">
                <span className="settings-page__slider-label">Critical threshold</span>
                <span className="settings-page__slider-value">{settings.thresholds.critical}</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.thresholds.critical}
                onChange={(e) => handleThresholdChange('critical', e.target.value)}
                className="settings-page__slider"
                aria-label="Critical risk threshold"
                aria-valuemin="50"
                aria-valuemax="100"
                aria-valuenow={settings.thresholds.critical}
              />
              <div className="settings-page__slider-range">
                <span>50</span>
                <span>100</span>
              </div>
            </div>
            <div className="settings-page__slider-item">
              <div className="settings-page__slider-header">
                <span className="settings-page__slider-label">High threshold</span>
                <span className="settings-page__slider-value">{settings.thresholds.high}</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                value={settings.thresholds.high}
                onChange={(e) => handleThresholdChange('high', e.target.value)}
                className="settings-page__slider"
                aria-label="High risk threshold"
                aria-valuemin="30"
                aria-valuemax="80"
                aria-valuenow={settings.thresholds.high}
              />
              <div className="settings-page__slider-range">
                <span>30</span>
                <span>80</span>
              </div>
            </div>
            <div className="settings-page__slider-item">
              <div className="settings-page__slider-header">
                <span className="settings-page__slider-label">Moderate threshold</span>
                <span className="settings-page__slider-value">{settings.thresholds.moderate}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={settings.thresholds.moderate}
                onChange={(e) => handleThresholdChange('moderate', e.target.value)}
                className="settings-page__slider"
                aria-label="Moderate risk threshold"
                aria-valuemin="10"
                aria-valuemax="60"
                aria-valuenow={settings.thresholds.moderate}
              />
              <div className="settings-page__slider-range">
                <span>10</span>
                <span>60</span>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-page__section" aria-labelledby="display-heading">
          <h2 className="settings-page__section-title" id="display-heading">Display</h2>
          <p className="settings-page__section-desc">Adjust refresh intervals and visual preferences.</p>
          <div className="settings-page__items">
            <div className="settings-page__input-item">
              <label className="settings-page__input-label" htmlFor="refresh-interval">
                Auto-refresh interval (seconds)
              </label>
              <select
                id="refresh-interval"
                className="settings-page__select"
                value={settings.display.refreshInterval}
                onChange={(e) => handleDisplayChange('refreshInterval', e.target.value)}
                aria-describedby="refresh-help"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
              </select>
              <span className="settings-page__input-help" id="refresh-help">
                How often the dashboard checks for new data from the backend.
              </span>
            </div>
            <label className="settings-page__toggle-item">
              <div className="settings-page__toggle-info">
                <span className="settings-page__toggle-label">Show synthetic data badge</span>
                <span className="settings-page__toggle-desc">Display a visual indicator when viewing synthetic (non-live) data.</span>
              </div>
              <div className="settings-page__toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.display.showSyntheticBadge}
                  onChange={() => handleDisplayChange('showSyntheticBadge', !settings.display.showSyntheticBadge)}
                  aria-label="Show synthetic data badge"
                />
                <span className="settings-page__toggle-slider" aria-hidden="true" />
              </div>
            </label>
          </div>
        </section>

        <section className="settings-page__section" aria-labelledby="api-heading">
          <h2 className="settings-page__section-title" id="api-heading">API Connection</h2>
          <p className="settings-page__section-desc">Backend connection details and status.</p>
          <div className="settings-page__items">
            <div className="settings-page__info-item">
              <span className="settings-page__info-label">Backend URL</span>
              <span className="settings-page__info-value settings-page__info-value--mono">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
              </span>
            </div>
            <div className="settings-page__info-item">
              <span className="settings-page__info-label">Data Mode</span>
              <span className="settings-page__info-value">
                {import.meta.env.VITE_USE_MOCK === 'true' ? 'Mock (client-side)' : 'Live (backend)'}
              </span>
            </div>
            <div className="settings-page__info-item">
              <span className="settings-page__info-label">Last Sync</span>
              <span className="settings-page__info-value">Real-time</span>
            </div>
          </div>
        </section>
      </div>

      <div className="settings-page__actions">
        {saved && <span className="settings-page__saved" role="status">Settings saved</span>}
        <button className="btn btn--primary" onClick={handleSave} aria-label="Save all settings">
          Save Settings
        </button>
      </div>
    </div>
  )
}