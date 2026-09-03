import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getLocations } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './RiskMap.css'

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [map, center, zoom])
  return null
}

function getMarkerColor(level) {
  switch (level) {
    case 'CRITICAL': return '#dc2626'
    case 'HIGH': return '#ea580c'
    case 'MODERATE': return '#d97706'
    default: return '#059669'
  }
}

function getMarkerRadius(level) {
  switch (level) {
    case 'CRITICAL': return 16
    case 'HIGH': return 13
    case 'MODERATE': return 11
    default: return 9
  }
}

export default function RiskMap({ demoMode }) {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([12.98, 80.22])
  const [mapZoom, setMapZoom] = useState(12)
  const [tileError, setTileError] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const locData = await getLocations()
      setLocations(locData)
      const selectedId = searchParams.get('location')
      if (selectedId) {
        const found = locData.find(l => l.location_id === selectedId)
        if (found) {
          setSelectedLocation(found)
          setMapCenter(found.coordinates)
          setMapZoom(14)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load risk map data')
    }
    setLoading(false)
  }, [searchParams])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const handleLocationClick = (loc) => {
    setSelectedLocation(loc)
    setMapCenter(loc.coordinates)
    setMapZoom(14)
  }

  if (error) {
    return (
      <div className="risk-map-page">
        <ErrorState title="Unable to load map data" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="risk-map-page">
      <div className="risk-map-page__header">
        <div>
          <h1 className="risk-map-page__title">Geospatial Risk Assessment</h1>
          <p className="risk-map-page__subtitle">Real-time flood risk visualization across Chennai locations.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={2} />
      ) : locations.length === 0 ? (
        <EmptyState
          title="No locations configured"
          message="Add monitoring locations to view risk data on the map."
        />
      ) : (
        <div className="risk-map-page__layout">
          <div className="risk-map-page__map-wrapper">
            <MapContainer center={mapCenter} zoom={mapZoom} className="risk-map-page__map" zoomControl={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
                eventHandlers={{ tileerror: () => setTileError(true), load: () => setTileError(false) }}
              />
              {tileError && <div className="risk-map-page__tile-error" role="status">Map tiles unavailable. Location data is still available.</div>}
              <MapController center={mapCenter} zoom={mapZoom} />
              {locations.map(loc => (
                <CircleMarker
                  key={loc.location_id}
                  center={loc.coordinates}
                  radius={getMarkerRadius(loc.risk_level)}
                  fillColor={getMarkerColor(loc.risk_level)}
                  color="#fff"
                  weight={3}
                  fillOpacity={0.9}
                  eventHandlers={{ click: () => handleLocationClick(loc) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '180px' }}>
                      <strong>{loc.name}</strong><br/>
                      Risk Score: <span style={{ color: getMarkerColor(loc.risk_level), fontWeight: 700, fontFamily: 'monospace' }}>{loc.risk_score}</span><br/>
                      Level: {loc.risk_level}<br/>
                      Priority: #{loc.priority_rank}<br/>
                      Action: {loc.recommended_action}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <aside className="risk-map-page__sidebar" aria-label="Location details">
            <div className="risk-map-page__sidebar-header">
              <h2 className="risk-map-page__sidebar-title">Monitored Locations</h2>
            </div>
            <div className="risk-map-page__location-list" role="list">
              {locations.map(loc => (
                <button
                  key={loc.location_id}
                  className={`risk-map-page__location-card ${selectedLocation?.location_id === loc.location_id ? 'risk-map-page__location-card--selected' : ''}`}
                  onClick={() => handleLocationClick(loc)}
                  aria-label={`Select ${loc.name}, risk level ${loc.risk_level}, score ${loc.risk_score}`}
                  aria-pressed={selectedLocation?.location_id === loc.location_id}
                  role="listitem"
                >
                  <div className="risk-map-page__location-header">
                    <span className="risk-map-page__location-name">{loc.name}</span>
                    <span className="risk-map-page__location-rank">#{loc.priority_rank}</span>
                  </div>
                  <div className="risk-map-page__location-risk">
                    <span className="risk-dot" style={{ backgroundColor: getMarkerColor(loc.risk_level) }} aria-hidden="true" />
                    <span className="risk-map-page__location-score">{loc.risk_score}</span>
                    <span className="risk-map-page__location-level">{loc.risk_level}</span>
                  </div>
                  <div className="risk-map-page__location-action">
                    <span className="risk-map-page__location-action-label">Action:</span> {loc.recommended_action}
                  </div>
                  <div className="risk-map-page__location-meta">
                    <span>Flood: {loc.vulnerability_scores?.flood_risk || 'N/A'}</span>
                    <span>Drain: {loc.vulnerability_scores?.drainage_capacity || 'N/A'}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}