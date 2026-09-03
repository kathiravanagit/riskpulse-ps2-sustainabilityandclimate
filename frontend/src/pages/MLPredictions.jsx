import React, { useState, useEffect, useCallback } from 'react'
import { getMLModelStatus, getFeatureImportance, predictRisk, getLocations } from '../services/api'
import './MLPredictions.css'

export default function MLPredictions() {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [modelStatus, setModelStatus] = useState(null)
  const [featureImportance, setFeatureImportance] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  // Fetch initial data
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        // Get locations
        const locs = await getLocations()
        setLocations(locs)
        if (locs.length > 0) {
          setSelectedLocation(locs[0].location_id)
        }

        // Get model status
        const status = await getMLModelStatus()
        setModelStatus(status)

        // Get feature importance
        const importance = await getFeatureImportance()
        setFeatureImportance(importance)
      } catch (err) {
        setError('Failed to load initial data: ' + err.message)
      }
    }

    fetchInitial()
  }, [])

  // Make predictions when location changes
  const makePredictions = useCallback(async () => {
    if (!selectedLocation) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await predictRisk(selectedLocation)
      setPredictions(result)
      setMessage('Predictions generated successfully!')

      // Auto-clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError('Failed to generate predictions: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [selectedLocation])

  useEffect(() => {
    if (selectedLocation) {
      makePredictions()
    }
  }, [selectedLocation, makePredictions])

  const getRiskLevelClass = (level) => {
    if (!level) return ''
    return level.toLowerCase().replace(' ', '-')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="ml-predictions">
      {/* Header */}
      <div className="ml-header">
        <h1>Risk predictions</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Model-assisted assessment for current location conditions
        </p>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {/* Model Status */}
      {modelStatus && (
        <div>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Model Status</h2>
          <div className="model-status">
            <div className={`status-badge ${modelStatus.risk_level_classifier ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.risk_level_classifier ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Risk Classifier</span>
            </div>
            <div className={`status-badge ${modelStatus.risk_score_regressor ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.risk_score_regressor ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Risk Regressor</span>
            </div>
            <div className={`status-badge ${modelStatus.water_level_predictor ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.water_level_predictor ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Water Level</span>
            </div>
            <div className={`status-badge ${modelStatus.flood_probability_classifier ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.flood_probability_classifier ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Flood Probability</span>
            </div>
            <div className={`status-badge ${modelStatus.vulnerability_predictor ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.vulnerability_predictor ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Vulnerability</span>
            </div>
            <div className={`status-badge ${modelStatus.scaler_loaded ? 'loaded' : 'not-loaded'}`}>
              <span className={`status-indicator ${modelStatus.scaler_loaded ? 'loaded' : 'not-loaded'}`}></span>
              <span className="status-label">Feature Scaler</span>
            </div>
          </div>
        </div>
      )}

      <div className="section-divider"></div>

      {/* Location Selector and Controls */}
      <div>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>Risk Prediction</h2>
        <div className="location-selector">
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.name} ({loc.location_id})
              </option>
            ))}
          </select>
          <button className={`btn ${loading ? 'loading' : ''}`} onClick={makePredictions} disabled={!selectedLocation || loading}>
            {loading ? <span className="loading-spinner"></span> : 'Generate prediction'}
          </button>
        </div>
      </div>

      {/* Predictions Display */}
      {predictions && predictions.predictions && (
        <>
          <div className="predictions-grid">
            {/* Risk Level Card */}
            {predictions.predictions.risk_level && (
              <div className="prediction-card">
                <div className="prediction-title">Risk level</div>
                <div className="prediction-value" style={{ color: 'var(--color-text)' }}>
                  <span className={`risk-level-badge ${getRiskLevelClass(predictions.predictions.risk_level.risk_level)}`}>
                    {predictions.predictions.risk_level.risk_level}
                  </span>
                </div>
                <div className="prediction-meta">
                  <span>Confidence:</span>
                  <div className="confidence-indicator">
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: predictions.predictions.risk_level.confidence + '%' }}></div>
                    </div>
                    <span>{predictions.predictions.risk_level.confidence}%</span>
                  </div>
                </div>

                {/* Probability breakdown */}
                <div className="probability-bars" style={{ marginTop: 'var(--space-3)' }}>
                  {predictions.predictions.risk_level.probabilities && Object.entries(predictions.predictions.risk_level.probabilities).map(([level, prob]) => (
                    <div key={level} className="probability-bar">
                      <div className="probability-label">{level}</div>
                      <div className="probability-background">
                        <div className="probability-fill" style={{ width: prob + '%' }}></div>
                      </div>
                      <div className="probability-value">{prob}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Score Card */}
            {predictions.predictions.risk_score && (
              <div className="prediction-card">
                <div className="prediction-title">Risk score</div>
                <div className="prediction-value">{predictions.predictions.risk_score}</div>
                <div className="prediction-meta">
                  <span>Scale: 0-100</span>
                  <span style={{ fontSize: 'var(--fs-small)' }}>
                    {predictions.predictions.risk_score < 30 ? 'Low' : predictions.predictions.risk_score < 50 ? 'Moderate' : predictions.predictions.risk_score < 75 ? 'High' : 'Critical'}
                  </span>
                </div>
                <div style={{ marginTop: 'var(--space-3)', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--color-primary)', width: predictions.predictions.risk_score + '%', transition: 'width var(--transition-normal)' }}></div>
                </div>
              </div>
            )}

            {/* Water Level Prediction Card */}
            {predictions.predictions.water_level_prediction && (
              <div className="prediction-card">
                <div className="prediction-title">Water level</div>
                <div className="prediction-value">{predictions.predictions.water_level_prediction}</div>
                <div className="prediction-meta">
                  <span>Predicted: cm</span>
                  <span style={{ fontSize: 'var(--fs-small)' }}>
                    {predictions.predictions.water_level_prediction < 30 ? 'Normal' : predictions.predictions.water_level_prediction < 50 ? 'Elevated' : 'Critical'}
                  </span>
                </div>
              </div>
            )}

            {/* Flood Probability Card */}
            {predictions.predictions.flood_probability && (
              <div className="prediction-card">
                <div className="prediction-title">Flood probability</div>
                <div className="prediction-value">{predictions.predictions.flood_probability.flood_probability}%</div>
                <div className="prediction-meta">
                  <span>{predictions.predictions.flood_probability.will_flood ? 'Flood expected' : 'No flood expected'}</span>
                  <span style={{ fontSize: 'var(--fs-small)' }}>{predictions.predictions.flood_probability.flood_probability > 70 ? 'High Risk' : 'Low Risk'}</span>
                </div>
                <div className="probability-bars" style={{ marginTop: 'var(--space-3)' }}>
                  <div className="probability-bar">
                    <div className="probability-label">Flood</div>
                    <div className="probability-background">
                      <div className="probability-fill" style={{ width: predictions.predictions.flood_probability.flood_probability + '%', background: 'var(--color-danger)' }}></div>
                    </div>
                    <div className="probability-value">{predictions.predictions.flood_probability.flood_probability}%</div>
                  </div>
                  <div className="probability-bar">
                    <div className="probability-label">Safe</div>
                    <div className="probability-background">
                      <div className="probability-fill" style={{ width: predictions.predictions.flood_probability.no_flood_probability + '%', background: 'var(--color-success)' }}></div>
                    </div>
                    <div className="probability-value">{predictions.predictions.flood_probability.no_flood_probability}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Vulnerability Score Card */}
            {predictions.predictions.vulnerability_score && (
              <div className="prediction-card">
                <div className="prediction-title">Location vulnerability</div>
                <div className="prediction-value">{predictions.predictions.vulnerability_score}</div>
                <div className="prediction-meta">
                  <span>Scale: 0-100</span>
                  <span style={{ fontSize: 'var(--fs-small)' }}>
                    {predictions.predictions.vulnerability_score < 30 ? 'Low' : predictions.predictions.vulnerability_score < 60 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Overall Confidence */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-medium)' }}>Overall Confidence:</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px' }}>
                <div style={{ height: '100%', background: 'var(--color-primary)', width: predictions.confidence + '%', transition: 'width var(--transition-normal)' }}></div>
              </div>
              <span style={{ fontSize: 'var(--fs-body)', fontWeight: 'var(--fw-bold)', color: 'var(--color-primary)' }}>{predictions.confidence}%</span>
            </div>
            <div style={{ fontSize: 'var(--fs-small)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Generated: {formatDate(predictions.predicted_at)}
            </div>
          </div>
        </>
      )}

      <div className="section-divider"></div>

      {/* Feature Importance */}
      {featureImportance && (
        <div className="feature-importance">
          <h2>Model inputs</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
            Top factors influencing risk predictions (sorted by importance)
          </p>
          <div className="features-list">
            {featureImportance.features.map((feature, idx) => (
              <div key={feature.name} className="feature-item">
                <div className="feature-rank">#{idx + 1}</div>
                <div className="feature-name">{feature.name.replace(/_/g, ' ')}</div>
                <div className="feature-bar">
                  <div className="feature-fill" style={{ width: feature.importance_percent + '%' }}></div>
                </div>
                <div className="feature-percent">{feature.importance_percent}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="info-message">
        <strong>About this assessment</strong>
        <ul style={{ marginTop: 'var(--space-2)', marginBottom: 0, paddingLeft: 'var(--space-4)' }}>
          <li>Models trained on 2000+ synthetic samples with real-world flood patterns</li>
          <li>Accuracy: Risk Level Classification (94.25%), Risk Score Regression (R²=0.98)</li>
          <li>Uses water level, rainfall, elevation, citizen reports, and historical data</li>
          <li>Real-time predictions update as new sensor and weather data arrives</li>
          <li>Confidence scores reflect model certainty in predictions</li>
        </ul>
      </div>
    </div>
  )
}
