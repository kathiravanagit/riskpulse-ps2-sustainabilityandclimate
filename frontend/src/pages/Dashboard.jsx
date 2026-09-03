import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { MetricCard, RiskBadge, SkeletonCards, ErrorState } from '../components'
import { getLocations, getSensors, getCitizenReports } from '../services/api'
import './Dashboard.css'

export default function Dashboard({ demoMode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([])
  const [sensors, setSensors] = useState([])
  const [reports, setReports] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [locData, sensorData, reportData] = await Promise.all([
        getLocations(),
        getSensors(),
        getCitizenReports()
      ])
      setLocations(locData)
      setSensors(sensorData)
      setReports(reportData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const criticalCount = locations.filter(l => l.risk_level === 'CRITICAL').length
  const highCount = locations.filter(l => l.risk_level === 'HIGH').length
  const activeSensors = sensors.filter(s => s.connectivity === 'online').length
  const pendingReports = reports.filter(r => r.status === 'Pending').length

  const getMarkerColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#dc2626'
      case 'HIGH': return '#ea580c'
      case 'MODERATE': return '#d97706'
      default: return '#059669'
    }
  }

  const formatTime = (date) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (error) {
    return (
      <div className="dashboard">
        <ErrorState title="Unable to load risk data" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Chennai Flood Risk Overview</h1>
          <p className="dashboard__subtitle">Current risk intelligence across monitored locations.</p>
        </div>
        <div className="dashboard__header-meta">
          <span className="dashboard__timestamp">
            Last updated: {lastUpdated ? formatTime(lastUpdated) : 'Loading...'}
          </span>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={4} />
      ) : (
        <>
          <div className="dashboard__metrics" role="list" aria-label="Risk summary metrics">
            <MetricCard
              label="Critical Locations"
              value={criticalCount}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>}
              iconClass="critical"
              trend={criticalCount > 0 ? 'Requires immediate response' : 'No critical locations'}
              trendDir={criticalCount > 0 ? 'up' : 'neutral'}
              role="listitem"
            />
            <MetricCard
              label="High-Risk Locations"
              value={highCount}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>}
              iconClass="high"
              trend={highCount > 0 ? 'Active monitoring needed' : 'No high-risk locations'}
              trendDir={highCount > 0 ? 'up' : 'neutral'}
              role="listitem"
            />
            <MetricCard
              label="Active Sensor Nodes"
              value={activeSensors}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>}
              iconClass="low"
              trend={`${sensors.length} total sensors`}
              trendDir="neutral"
              role="listitem"
            />
            <MetricCard
              label="Pending Reports"
              value={pendingReports}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>}
              iconClass="moderate"
              trend={pendingReports > 0 ? 'Awaiting verification' : 'All reports processed'}
              trendDir={pendingReports > 0 ? 'up' : 'neutral'}
              role="listitem"
            />
          </div>

          <div className="dashboard__map-section">
            <div className="card">
              <div className="card__header">
                <h2 className="card__title">Risk Map</h2>
                <button className="btn btn--secondary btn--sm" onClick={() => navigate('/risk-map')} aria-label="Expand risk map to full view">
                  Expand
                </button>
              </div>
              <div className="dashboard__map-container">
                <MapContainer center={[12.98, 80.22]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                  {locations.map(loc => (
                    <CircleMarker
                      key={loc.location_id}
                      center={loc.coordinates}
                      radius={loc.risk_level === 'CRITICAL' ? 14 : loc.risk_level === 'HIGH' ? 11 : 9}
                      fillColor={getMarkerColor(loc.risk_level)}
                      color="#fff"
                      weight={3}
                      fillOpacity={0.9}
                      eventHandlers={{ click: () => navigate(`/risk-map?location=${loc.location_id}`) }}
                    >
                      <Popup>
                        <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '160px' }}>
                          <strong>{loc.name}</strong><br/>
                          Risk: <span style={{ color: getMarkerColor(loc.risk_level), fontWeight: 600 }}>{loc.risk_score}</span> ({loc.risk_level})<br/>
                          Priority: #{loc.priority_rank}
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="dashboard__sidebar-cards">
              <div className="card">
                <div className="card__header">
                  <h3 className="card__title">Top Priority</h3>
                </div>
                <div className="card__content">
                  {locations.slice(0, 3).map((loc, i) => (
                    <div
                      key={loc.location_id}
                      className="dashboard__priority-item"
                      onClick={() => navigate(`/risk-map?location=${loc.location_id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/risk-map?location=${loc.location_id}`)}
                      aria-label={`${loc.name}, priority ${i + 1}, risk ${loc.risk_level}`}
                    >
                      <span className="dashboard__priority-rank">#{i + 1}</span>
                      <div className="dashboard__priority-info">
                        <span className="dashboard__priority-name">{loc.name}</span>
                        <span className="dashboard__priority-action">{loc.recommended_action}</span>
                      </div>
                      <RiskBadge score={loc.risk_score} level={loc.risk_level} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card__header">
                  <h3 className="card__title">Recent Reports</h3>
                </div>
                <div className="card__content">
                  {reports.slice(0, 3).map(report => (
                    <div key={report.report_id} className="dashboard__report-item">
                      <span className="dashboard__report-id">{report.report_id}</span>
                      <div className="dashboard__report-info">
                        <span className="dashboard__report-condition">{report.condition}</span>
                        <span className="dashboard__report-meta">{report.location_name} &middot; {report.timestamp}</span>
                      </div>
                      <span className={`badge badge--${report.severity >= 4 ? 'critical' : report.severity >= 3 ? 'high' : 'moderate'}`}>
                        Severity {report.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}