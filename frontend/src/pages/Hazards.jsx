import { useEffect, useState } from 'react'
import { getHazardAssessment, getLocations } from '../services/api'
import './Hazards.css'

const labels = {
  flood: 'Flood',
  heatwave: 'Heatwave',
  cyclone: 'Cyclone',
  landslide: 'Landslide',
  glacial_lake_failure: 'Glacial lake failure',
  marine_heat: 'Marine heat'
}

export default function Hazards() {
  const [locations, setLocations] = useState([])
  const [locationId, setLocationId] = useState('')
  const [assessment, setAssessment] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLocations().then((items) => {
      setLocations(items)
      if (items[0]) setLocationId(items[0].location_id)
    }).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!locationId) return
    setLoading(true)
    getHazardAssessment(locationId).then(setAssessment).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [locationId])

  return (
    <section className="hazards-page">
      <header className="hazards-page__header">
        <div>
          <p className="eyebrow">Decision support</p>
          <h1>Multi-hazard assessment</h1>
          <p>Compare current hazard signals and direct response work for a specific location.</p>
        </div>
        <label className="hazards-page__selector">
          <span>Location</span>
          <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
            {locations.map((location) => <option key={location.location_id} value={location.location_id}>{location.name}</option>)}
          </select>
        </label>
      </header>

      {error && <div className="hazards-page__alert">{error}</div>}
      {loading && <div className="hazards-page__loading">Loading assessment...</div>}
      {!loading && assessment && <>
        <div className="hazards-summary">
          <div><span className="eyebrow">Overall exposure</span><strong>{assessment.overall_score}</strong><span className={`hazard-level hazard-level--${assessment.overall_level}`}>{assessment.overall_level}</span></div>
          <div><span className="eyebrow">Data status</span><strong>{assessment.data_quality.connectivity}</strong><span>Last updated {new Date(assessment.last_updated).toLocaleTimeString()}</span></div>
        </div>
        <div className="hazards-layout">
          <div className="hazard-signals">
            <div className="section-heading"><h2>Hazard signals</h2><span>Score and evidence by hazard</span></div>
            {assessment.signals.map((signal) => <article className="hazard-signal" key={signal.hazard}>
              <div className="hazard-signal__top"><h3>{labels[signal.hazard] || signal.hazard}</h3><span className={`hazard-level hazard-level--${signal.level}`}>{signal.level}</span></div>
              <div className="hazard-signal__score"><strong>{signal.score}</strong><span>/ 100</span><div className="hazard-signal__bar"><i style={{ width: `${signal.score}%` }} /></div></div>
              <p>{signal.evidence.join(', ')}</p><small>{signal.confidence}% confidence</small>
            </article>)}
          </div>
          <aside className="response-queue"><div className="section-heading"><h2>Response queue</h2><span>Ordered by operational need</span></div>
            {assessment.priorities.map((item) => <div className="response-item" key={item.priority}><b>{item.priority}</b><div><strong>{item.name}</strong><p>{item.reason}</p><span>{item.status}</span></div></div>)}
          </aside>
        </div>
      </>}
    </section>
  )
}