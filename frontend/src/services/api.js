import { LOCATIONS, SENSORS, CITIZEN_REPORTS, PRIORITY_QUEUE, RISK_TREND, SENSOR_HISTORY, RAINFALL_HISTORY } from '../data/mockData'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function normalizeLocation(location) {
  const fallback = LOCATIONS.find(item => item.location_id === location.location_id) || {}
  const coordinates = Array.isArray(location.coordinates)
    ? location.coordinates
    : [location.latitude, location.longitude]

  return { ...fallback, ...location, coordinates }
}

export async function getLocations() {
  if (USE_MOCK) { await delay(300); return LOCATIONS.map(normalizeLocation) }
  try {
    const res = await fetch(`${API_BASE}/locations`)
    if (!res.ok) throw new Error('Failed to fetch locations')
    const locations = await res.json()
    return locations.map(normalizeLocation)
  } catch {
    return LOCATIONS.map(normalizeLocation)
  }
}

export async function getRiskData() {
  if (USE_MOCK) { await delay(400); return LOCATIONS.map(l => ({ ...l })) }
  const res = await fetch(`${API_BASE}/risk/all`)
  if (!res.ok) throw new Error('Failed to fetch risk data')
  return res.json()
}

export async function getRiskByLocation(locationId) {
  if (USE_MOCK) { await delay(200); return LOCATIONS.find(l => l.location_id === locationId) || null }
  const res = await fetch(`${API_BASE}/risk/${locationId}`)
  if (!res.ok) throw new Error('Failed to fetch risk data')
  return res.json()
}

export async function getPriorityQueue() {
  if (USE_MOCK) { await delay(350); return [...PRIORITY_QUEUE] }
  const res = await fetch(`${API_BASE}/priority`)
  if (!res.ok) throw new Error('Failed to fetch priority queue')
  return res.json()
}

export async function getSensors() {
  if (USE_MOCK) { await delay(300); return [...SENSORS] }
  const res = await fetch(`${API_BASE}/sensors/all`)
  if (!res.ok) throw new Error('Failed to fetch sensors')
  return res.json()
}

export async function getSensorHistory() {
  if (USE_MOCK) { await delay(250); return [...SENSOR_HISTORY] }
  return []
}

export async function getCitizenReports() {
  if (USE_MOCK) { await delay(300); return [...CITIZEN_REPORTS] }
  const res = await fetch(`${API_BASE}/reports/all`)
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

const OFFLINE_REPORTS_KEY = 'riskpulse_offline_reports'

function getOfflineReports() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]') } catch { return [] }
}

function saveOfflineReports(reports) {
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(reports))
}

export function getPendingOfflineReportCount() {
  return getOfflineReports().length
}

export async function submitCitizenReport(report) {
  if (USE_MOCK) {
    await delay(250)
    return { ...report, report_id: `OFFLINE-${Date.now()}`, status: 'Pending', queued: false }
  }

  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    })
    if (!res.ok) throw new Error('Report submission failed')
    return { ...(await res.json()), queued: false }
  } catch (error) {
    const queuedReport = { ...report, client_id: crypto.randomUUID(), queued_at: new Date().toISOString() }
    saveOfflineReports([...getOfflineReports(), queuedReport])
    return { ...queuedReport, queued: true, offline: true, error: error.message }
  }
}

export async function syncOfflineReports() {
  if (USE_MOCK) return { synced: 0, pending: getOfflineReports().length }
  const pending = getOfflineReports()
  if (!pending.length) return { synced: 0, pending: 0 }

  const remaining = []
  let synced = 0
  for (const report of pending) {
    try {
      const payload = { ...report }
      delete payload.client_id
      delete payload.queued_at
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Sync failed')
      synced += 1
    } catch { remaining.push(report) }
  }
  saveOfflineReports(remaining)
  return { synced, pending: remaining.length }
}

export async function getRiskTrend() {
  if (USE_MOCK) { await delay(200); return [...RISK_TREND] }
  return []
}

export async function getRainfallHistory() {
  if (USE_MOCK) { await delay(200); return [...RAINFALL_HISTORY] }
  return []
}

export async function verifyReport(reportId, verified) {
  if (USE_MOCK) { await delay(500); return { success: true } }
  const res = await fetch(`${API_BASE}/reports/${reportId}/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verified }) })
  if (!res.ok) throw new Error('Failed to verify report')
  return res.json()
}

export async function recalculateRisk(locationId) {
  if (USE_MOCK) { await delay(600); return { success: true } }
  const res = await fetch(`${API_BASE}/risk/recalculate/${locationId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to recalculate risk')
  return res.json()
}

export async function startSimulation() {
  if (USE_MOCK) { await delay(200); return { status: 'started' } }
  const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to start simulation')
  return res.json()
}

export async function stopSimulation() {
  if (USE_MOCK) { await delay(200); return { status: 'stopped' } }
  const res = await fetch(`${API_BASE}/simulation/stop`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to stop simulation')
  return res.json()
}

export async function checkHealth() {
  if (USE_MOCK) { await delay(100); return { status: 'healthy' } }
  const res = await fetch(`${API_BASE}/health`)
  if (!res.ok) throw new Error('Backend unhealthy')
  return res.json()
}

// ML Predictions API functions
export async function getMLModelStatus() {
  if (USE_MOCK) { await delay(150); return { models_loaded: true, risk_level_classifier: true, risk_score_regressor: true, water_level_predictor: true, flood_probability_classifier: true, vulnerability_predictor: true, scaler_loaded: true, features_count: 16 } }
  const res = await fetch(`${API_BASE}/ml/models/status`)
  if (!res.ok) throw new Error('Failed to fetch model status')
  return res.json()
}

export async function getFeatureImportance() {
  if (USE_MOCK) {
    await delay(200)
    return {
      model: 'risk_level_classifier',
      features: [
        { name: 'water_level_cm', importance: 0.2314, importance_percent: 23.14 },
        { name: 'avg_report_severity', importance: 0.1509, importance_percent: 15.09 },
        { name: 'num_citizen_reports', importance: 0.1083, importance_percent: 10.83 },
        { name: 'elevation', importance: 0.0715, importance_percent: 7.15 },
        { name: 'road_vulnerability', importance: 0.0708, importance_percent: 7.08 },
        { name: 'rainfall_mm', importance: 0.0657, importance_percent: 6.57 },
        { name: 'historical_flood_freq', importance: 0.0606, importance_percent: 6.06 },
        { name: 'rainfall_intensity', importance: 0.0506, importance_percent: 5.06 },
        { name: 'population_density', importance: 0.0438, importance_percent: 4.38 },
        { name: 'forecast_rainfall_mm', importance: 0.0287, importance_percent: 2.87 }
      ]
    }
  }
  const res = await fetch(`${API_BASE}/ml/models/feature-importance`)
  if (!res.ok) throw new Error('Failed to fetch feature importance')
  return res.json()
}

export async function predictRisk(locationId) {
  if (USE_MOCK) {
    await delay(400)
    const location = LOCATIONS.find(item => item.location_id === locationId)
    if (!location) throw new Error('Location not found')

    const locationSensors = SENSORS.filter(item => item.location_id === locationId)
    const waterLevel = locationSensors.length
      ? locationSensors.reduce((total, item) => total + item.water_level_cm, 0) / locationSensors.length
      : location.contributing_factors?.water_level || 0
    const riskScore = location.risk_score
    const riskLevel = location.risk_level
    const confidence = location.confidence
    const floodProbability = Math.min(99, Math.max(1, Math.round(riskScore * 0.88)))
    const riskLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    const otherProbability = Math.round(((100 - confidence) / 3) * 100) / 100
    const probabilities = Object.fromEntries(riskLevels.map(level => [
      level,
      level === riskLevel ? confidence : otherProbability
    ]))
    probabilities[riskLevel] = Math.round((100 - riskLevels
      .filter(level => level !== riskLevel)
      .reduce((total, level) => total + probabilities[level], 0)) * 100) / 100

    return {
      location_id: locationId,
      predictions: {
        risk_level: {
          risk_level: riskLevel,
          risk_level_code: riskLevels.indexOf(riskLevel),
          confidence,
          probabilities
        },
        risk_score: riskScore,
        water_level_prediction: Math.round((waterLevel + Math.max(2, waterLevel * 0.08)) * 10) / 10,
        flood_probability: { will_flood: floodProbability >= 50, flood_probability: floodProbability, no_flood_probability: 100 - floodProbability },
        vulnerability_score: location.vulnerability_score
      },
      confidence,
      predicted_at: new Date().toISOString()
    }
  }
  const res = await fetch(`${API_BASE}/ml/predict/${locationId}`)
  if (!res.ok) throw new Error('Failed to predict risk')
  return res.json()
}

export async function getPredictionHistory(locationId, limit = 10) {
  if (USE_MOCK) {
    await delay(300)
    return {
      location_id: locationId,
      predictions: [],
      count: 0
    }
  }
  const res = await fetch(`${API_BASE}/ml/predictions/location/${locationId}?limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch prediction history')
  return res.json()
}

export async function syncLiveWeather(locationId) {
  const res = await fetch(`${API_BASE}/weather/sync/${locationId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to sync live weather')
  return res.json()
}

export async function getOperationalResources(locationId) {
  const res = await fetch(`${API_BASE}/resources/${locationId}`)
  if (!res.ok) throw new Error('Failed to fetch operational resources')
  return res.json()
}

export async function updateResourceStatus(resourceId, status) {
  const res = await fetch(`${API_BASE}/resources/${resourceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('Failed to update resource status')
  return res.json()
}

export async function getHazardAssessment(locationId) {
  if (USE_MOCK) {
    await delay(250)
    return {
      location_id: locationId,
      location_name: 'Selected location',
      overall_score: 68,
      overall_level: 'high',
      signals: [
        { hazard: 'flood', score: 68, level: 'high', confidence: 91, evidence: ['Rainfall observation', 'Water-level reading'] },
        { hazard: 'heatwave', score: 42, level: 'moderate', confidence: 76, evidence: ['Air temperature', 'Population exposure'] },
        { hazard: 'cyclone', score: 18, level: 'low', confidence: 69, evidence: ['Wind observation'] },
        { hazard: 'landslide', score: 12, level: 'low', confidence: 61, evidence: ['Terrain slope', 'Soil saturation'] },
        { hazard: 'glacial_lake_failure', score: 0, level: 'low', confidence: 55, evidence: ['Lake-level change'] },
        { hazard: 'marine_heat', score: 8, level: 'low', confidence: 58, evidence: ['Sea-surface temperature anomaly'] }
      ],
      priorities: [
        { priority: 1, category: 'rescue', name: 'Rescue teams', location: 'Selected location', reason: 'Deploy to the highest current hazard signal', status: 'open' },
        { priority: 2, category: 'route', name: 'Primary travel route', location: 'Selected location', reason: 'Review closure and safe-route status before dispatch', status: 'open' },
        { priority: 3, category: 'shelter', name: 'Nearest shelter', location: 'Selected location', reason: 'Confirm capacity and power before public direction', status: 'open' },
        { priority: 4, category: 'medical', name: 'Medical support', location: 'Selected location', reason: 'Prepare support for exposed or vulnerable residents', status: 'open' }
      ],
      data_quality: { weather: 'observed', terrain: 'configured', community: 'reported', connectivity: 'online' },
      last_updated: new Date().toISOString()
    }
  }
  const res = await fetch(`${API_BASE}/hazards/${locationId}`)
  if (!res.ok) throw new Error('Failed to fetch hazard assessment')
  return res.json()
}