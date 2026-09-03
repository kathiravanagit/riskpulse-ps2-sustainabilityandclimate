import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocations } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './PriorityQueue.css'

export default function PriorityQueue({ demoMode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([])
  const [sortBy, setSortBy] = useState('priority_rank')
  const [filterLevel, setFilterLevel] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getLocations()
      setLocations(data)
    } catch (err) {
      setError(err.message || 'Failed to load priority queue')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const filteredLocations = locations
    .filter(loc => filterLevel === 'ALL' || loc.risk_level === filterLevel)
    .sort((a, b) => a[sortBy] - b[sortBy])

  const getRiskStyle = (level) => {
    switch (level) {
      case 'CRITICAL': return 'risk-tag--critical'
      case 'HIGH': return 'risk-tag--high'
      case 'MODERATE': return 'risk-tag--moderate'
      default: return 'risk-tag--low'
    }
  }

  if (error) {
    return (
      <div className="priority-queue">
        <ErrorState title="Unable to load priority queue" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="priority-queue">
      <div className="priority-queue__header">
        <div>
          <h1 className="priority-queue__title">Response Priority Queue</h1>
          <p className="priority-queue__subtitle">Ranked locations requiring attention, ordered by risk and vulnerability.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={5} />
      ) : filteredLocations.length === 0 ? (
        <EmptyState
          title="No locations match your filter"
          message="Try adjusting the risk level filter to view locations."
        />
      ) : (
        <>
          <div className="priority-queue__filters" role="toolbar" aria-label="Filter and sort controls">
            <div className="priority-queue__filter-group" role="group" aria-label="Risk level filter">
              <label className="priority-queue__filter-label" htmlFor="risk-filter">Filter:</label>
              <select
                id="risk-filter"
                className="priority-queue__select"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                aria-label="Filter by risk level"
              >
                <option value="ALL">All Levels</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="MODERATE">Moderate Only</option>
                <option value="LOW">Low Only</option>
              </select>
            </div>
            <div className="priority-queue__filter-group" role="group" aria-label="Sort order">
              <label className="priority-queue__filter-label" htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                className="priority-queue__select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort locations by"
              >
                <option value="priority_rank">Priority Rank</option>
                <option value="risk_score">Risk Score</option>
                <option value="updated_at">Last Updated</option>
              </select>
            </div>
            <div className="priority-queue__count" role="status" aria-live="polite">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="priority-queue__list" role="list" aria-label="Priority queue locations">
            {filteredLocations.map(loc => (
              <div
                key={loc.location_id}
                className={`priority-queue__card ${expandedId === loc.location_id ? 'priority-queue__card--expanded' : ''}`}
                role="listitem"
              >
                <div className="priority-queue__card-main" onClick={() => setExpandedId(expandedId === loc.location_id ? null : loc.location_id)}>
                  <div className="priority-queue__card-left">
                    <div className="priority-queue__card-rank">
                      <span className="priority-queue__rank-label">Priority</span>
                      <span className="priority-queue__rank-value">#{loc.priority_rank}</span>
                    </div>
                    <div className="priority-queue__card-info">
                      <h3 className="priority-queue__card-name">{loc.name}</h3>
                      <span className="priority-queue__card-zone">{loc.zone}</span>
                    </div>
                  </div>
                  <div className="priority-queue__card-center">
                    <div className="priority-queue__card-action">
                      <span className="priority-queue__action-label">Action:</span>
                      <span className="priority-queue__action-text">{loc.recommended_action}</span>
                    </div>
                  </div>
                  <div className="priority-queue__card-right">
                    <span className={`risk-tag ${getRiskStyle(loc.risk_level)}`}>
                      <span className="risk-dot" aria-hidden="true" />
                      {loc.risk_score} {loc.risk_level}
                    </span>
                    <button
                      className="btn btn--secondary btn--sm priority-queue__view-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/risk-map?location=${loc.location_id}`) }}
                      aria-label={`View ${loc.name} on risk map`}
                    >
                      View Map
                    </button>
                  </div>
                </div>

                {expandedId === loc.location_id && (
                  <div className="priority-queue__card-details" aria-label="Location details">
                    <div className="priority-queue__detail-grid">
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Flood Risk</span>
                        <span className="priority-queue__detail-value">{loc.vulnerability_scores?.flood_risk || 'N/A'}</span>
                      </div>
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Drainage Capacity</span>
                        <span className="priority-queue__detail-value">{loc.vulnerability_scores?.drainage_capacity || 'N/A'}</span>
                      </div>
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Infrastructure Age</span>
                        <span className="priority-queue__detail-value">{loc.vulnerability_scores?.infrastructure_age || 'N/A'}</span>
                      </div>
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Population Density</span>
                        <span className="priority-queue__detail-value">{loc.vulnerability_scores?.population_density || 'N/A'}</span>
                      </div>
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Socioeconomic</span>
                        <span className="priority-queue__detail-value">{loc.vulnerability_scores?.socioeconomic || 'N/A'}</span>
                      </div>
                      <div className="priority-queue__detail-item">
                        <span className="priority-queue__detail-label">Last Updated</span>
                        <span className="priority-queue__detail-value">{loc.updated_at || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="priority-queue__detail-actions">
                      <button className="btn btn--primary btn--sm" onClick={() => navigate(`/risk-map?location=${loc.location_id}`)}>
                        View on Map
                      </button>
                      <button className="btn btn--secondary btn--sm" onClick={() => navigate('/events')}>
                        View Events
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}