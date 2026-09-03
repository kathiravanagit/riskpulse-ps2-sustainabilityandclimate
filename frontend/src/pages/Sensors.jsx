import { useState, useEffect, useCallback } from 'react'
import { getSensors } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './Sensors.css'

export default function Sensors({ demoMode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sensors, setSensors] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSensors()
      setSensors(data)
    } catch (err) {
      setError(err.message || 'Failed to load sensor data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const filteredSensors = sensors.filter(s =>
    filterStatus === 'ALL' || s.connectivity?.toUpperCase() === filterStatus
  )

  const onlineCount = sensors.filter(s => s.connectivity === 'online').length
  const offlineCount = sensors.filter(s => s.connectivity === 'offline').length
  const delayedCount = sensors.filter(s => s.connectivity === 'delayed').length

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'badge--connected'
      case 'offline': return 'badge--offline'
      case 'delayed': return 'badge--delayed'
      default: return 'badge--info'
    }
  }

  if (error) {
    return (
      <div className="sensors-page">
        <ErrorState title="Unable to load sensor data" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="sensors-page">
      <div className="sensors-page__header">
        <div>
          <h1 className="sensors-page__title">Sensor Network</h1>
          <p className="sensors-page__subtitle">IoT device status, readings, and maintenance tracking.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={3} />
      ) : sensors.length === 0 ? (
        <EmptyState
          title="No sensors registered"
          message="Register IoT sensors to begin collecting environmental data."
        />
      ) : (
        <>
          <div className="sensors-page__stats" role="list" aria-label="Sensor status summary">
            <div className="sensors-page__stat" role="listitem">
              <span className="sensors-page__stat-value sensors-page__stat-value--total">{sensors.length}</span>
              <span className="sensors-page__stat-label">Total Sensors</span>
            </div>
            <div className="sensors-page__stat" role="listitem">
              <span className="sensors-page__stat-value sensors-page__stat-value--online">{onlineCount}</span>
              <span className="sensors-page__stat-label">Online</span>
            </div>
            <div className="sensors-page__stat" role="listitem">
              <span className="sensors-page__stat-value sensors-page__stat-value--delayed">{delayedCount}</span>
              <span className="sensors-page__stat-label">Delayed</span>
            </div>
            <div className="sensors-page__stat" role="listitem">
              <span className="sensors-page__stat-value sensors-page__stat-value--offline">{offlineCount}</span>
              <span className="sensors-page__stat-label">Offline</span>
            </div>
          </div>

          <div className="sensors-page__filters" role="toolbar" aria-label="Filter controls">
            <div className="sensors-page__filter-group" role="group" aria-label="Connectivity filter">
              <label className="sensors-page__filter-label" htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                className="sensors-page__select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                aria-label="Filter by connectivity status"
              >
                <option value="ALL">All Sensors</option>
                <option value="ONLINE">Online Only</option>
                <option value="OFFLINE">Offline Only</option>
                <option value="DELAYED">Delayed Only</option>
              </select>
            </div>
            <div className="sensors-page__count" role="status" aria-live="polite">
              {filteredSensors.length} sensor{filteredSensors.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="sensors-page__grid" role="list" aria-label="Sensor list">
            {filteredSensors.map(sensor => (
              <div key={sensor.sensor_id} className="sensors-page__card" role="listitem">
                <div className="sensors-page__card-header">
                  <div className="sensors-page__card-id">
                    <span className="sensors-page__card-id-label">ID</span>
                    <span className="sensors-page__card-id-value">{sensor.sensor_id}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(sensor.connectivity)}`}>
                    {sensor.connectivity}
                  </span>
                </div>
                <div className="sensors-page__card-location">
                  <span className="sensors-page__card-location-label">Location</span>
                  <span className="sensors-page__card-location-value">{sensor.location_name}</span>
                </div>
                <div className="sensors-page__card-type">
                  <span className="sensors-page__card-type-label">Type</span>
                  <span className="sensors-page__card-type-value">{sensor.sensor_type}</span>
                </div>
                <div className="sensors-page__card-readings">
                  <span className="sensors-page__card-readings-label">Latest Readings</span>
                  <div className="sensors-page__card-readings-grid">
                    {sensor.latest_reading && Object.entries(sensor.latest_reading).map(([key, value]) => (
                      <div key={key} className="sensors-page__reading">
                        <span className="sensors-page__reading-key">{key.replace(/_/g, ' ')}</span>
                        <span className="sensors-page__reading-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sensors-page__card-meta">
                  <span>Last update: {sensor.last_reading_time || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}