import { useState, useEffect, useCallback } from 'react'
import { getLocations, getSensors, getCitizenReports } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './Events.css'

export default function Events({ demoMode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([])
  const [sensors, setSensors] = useState([])
  const [reports, setReports] = useState([])
  const [activeTab, setActiveTab] = useState('all')

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
    } catch (err) {
      setError(err.message || 'Failed to load event data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const getEventTimeline = () => {
    const events = []

    locations.forEach(loc => {
      if (loc.risk_level === 'CRITICAL' || loc.risk_level === 'HIGH') {
        events.push({
          type: 'risk',
          severity: loc.risk_level === 'CRITICAL' ? 'critical' : 'high',
          title: `${loc.risk_level} risk: ${loc.name}`,
          detail: `Risk score ${loc.risk_score}. ${loc.recommended_action}`,
          time: loc.updated_at || 'Unknown',
          location: loc.name
        })
      }
    })

    sensors.filter(s => s.connectivity === 'offline').forEach(sensor => {
      events.push({
        type: 'sensor',
        severity: 'warning',
        title: `Sensor offline: ${sensor.sensor_id}`,
        detail: `Location: ${sensor.location_name}. Last reading: ${sensor.last_reading_time || 'Unknown'}`,
        time: sensor.last_reading_time || 'Unknown',
        location: sensor.location_name
      })
    })

    reports.filter(r => r.severity >= 4).forEach(report => {
      events.push({
        type: 'report',
        severity: 'high',
        title: `High-severity report: ${report.report_id}`,
        detail: `${report.condition} at ${report.location_name}`,
        time: report.timestamp,
        location: report.location_name
      })
    })

    return events.sort((a, b) => {
      const timeA = new Date(a.time)
      const timeB = new Date(b.time)
      if (isNaN(timeA)) return 1
      if (isNaN(timeB)) return -1
      return timeB - timeA
    })
  }

  const allEvents = getEventTimeline()
  const filteredEvents = activeTab === 'all' ? allEvents : allEvents.filter(e => e.type === activeTab)

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      case 'high': return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      case 'warning': return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      default: return <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    }
  }

  if (error) {
    return (
      <div className="events-page">
        <ErrorState title="Unable to load event timeline" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="events-page">
      <div className="events-page__header">
        <div>
          <h1 className="events-page__title">Event Timeline</h1>
          <p className="events-page__subtitle">Chronological log of system events, risk changes, and sensor alerts.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={5} />
      ) : allEvents.length === 0 ? (
        <EmptyState
          title="No events recorded"
          message="Events will appear here when risk levels change, sensors go offline, or reports are submitted."
        />
      ) : (
        <>
          <div className="events-page__tabs" role="tablist" aria-label="Event type filter">
            <button
              className={`events-page__tab ${activeTab === 'all' ? 'events-page__tab--active' : ''}`}
              onClick={() => setActiveTab('all')}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              All ({allEvents.length})
            </button>
            <button
              className={`events-page__tab ${activeTab === 'risk' ? 'events-page__tab--active' : ''}`}
              onClick={() => setActiveTab('risk')}
              role="tab"
              aria-selected={activeTab === 'risk'}
            >
              Risk Changes ({allEvents.filter(e => e.type === 'risk').length})
            </button>
            <button
              className={`events-page__tab ${activeTab === 'sensor' ? 'events-page__tab--active' : ''}`}
              onClick={() => setActiveTab('sensor')}
              role="tab"
              aria-selected={activeTab === 'sensor'}
            >
              Sensor Alerts ({allEvents.filter(e => e.type === 'sensor').length})
            </button>
            <button
              className={`events-page__tab ${activeTab === 'report' ? 'events-page__tab--active' : ''}`}
              onClick={() => setActiveTab('report')}
              role="tab"
              aria-selected={activeTab === 'report'}
            >
              Reports ({allEvents.filter(e => e.type === 'report').length})
            </button>
          </div>

          <div className="events-page__timeline" role="list" aria-label="Event timeline">
            {filteredEvents.map((event, index) => (
              <div key={index} className={`events-page__event events-page__event--${event.severity}`} role="listitem">
                <div className="events-page__event-marker" aria-hidden="true">
                  {getSeverityIcon(event.severity)}
                </div>
                <div className="events-page__event-content">
                  <div className="events-page__event-header">
                    <h3 className="events-page__event-title">{event.title}</h3>
                    <span className="events-page__event-time">{event.time}</span>
                  </div>
                  <p className="events-page__event-detail">{event.detail}</p>
                  <span className="events-page__event-location">{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}