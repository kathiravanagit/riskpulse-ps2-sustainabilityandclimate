import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { getLocations, getSensors, getCitizenReports, getRiskTrend } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './Analytics.css'

const COLORS = ['#059669', '#d97706', '#ea580c', '#dc2626']

export default function Analytics({ demoMode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState([])
  const [sensors, setSensors] = useState([])
  const [reports, setReports] = useState([])
  const [trends, setTrends] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [locData, sensorData, reportData, trendData] = await Promise.all([
        getLocations(),
        getSensors(),
        getCitizenReports(),
        getRiskTrend()
      ])
      setLocations(locData)
      setSensors(sensorData)
      setReports(reportData)
      setTrends(trendData)
    } catch (err) {
      setError(err.message || 'Failed to load analytics data')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const getRiskDistribution = () => {
    const dist = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 }
    locations.forEach(loc => { dist[loc.risk_level] = (dist[loc.risk_level] || 0) + 1 })
    return Object.entries(dist).map(([name, value]) => ({ name, value }))
  }

  const getLocationRiskData = () => {
    return locations.map(loc => ({
      name: loc.name?.length > 12 ? loc.name.substring(0, 12) + '...' : loc.name,
      fullName: loc.name,
      risk_score: loc.risk_score || 0,
      priority: loc.priority_rank || 0
    }))
  }

  const getSensorStatusData = () => {
    const dist = { online: 0, offline: 0, delayed: 0 }
    sensors.forEach(s => { dist[s.connectivity] = (dist[s.connectivity] || 0) + 1 })
    return Object.entries(dist).map(([name, value]) => ({ name, value }))
  }

  const getReportSeverityData = () => {
    const dist = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    reports.forEach(r => { dist[String(r.severity)] = (dist[String(r.severity)] || 0) + 1 })
    return Object.entries(dist).map(([name, value]) => ({ name: `Sev ${name}`, value }))
  }

  if (error) {
    return (
      <div className="analytics-page">
        <ErrorState title="Unable to load analytics" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="analytics-page__header">
        <div>
          <h1 className="analytics-page__title">Risk Analytics</h1>
          <p className="analytics-page__subtitle">Trend analysis and performance metrics for Chennai monitoring.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={4} />
      ) : locations.length === 0 ? (
        <EmptyState
          title="No data available for analysis"
          message="Add monitoring locations and collect sensor data to generate analytics."
        />
      ) : (
        <>
          <div className="analytics-page__tabs" role="tablist" aria-label="Analytics sections">
            <button
              className={`analytics-page__tab ${activeTab === 'overview' ? 'analytics-page__tab--active' : ''}`}
              onClick={() => setActiveTab('overview')}
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="panel-overview"
              id="tab-overview"
            >
              Overview
            </button>
            <button
              className={`analytics-page__tab ${activeTab === 'trends' ? 'analytics-page__tab--active' : ''}`}
              onClick={() => setActiveTab('trends')}
              role="tab"
              aria-selected={activeTab === 'trends'}
              aria-controls="panel-trends"
              id="tab-trends"
            >
              Risk Trends
            </button>
            <button
              className={`analytics-page__tab ${activeTab === 'sensors' ? 'analytics-page__tab--active' : ''}`}
              onClick={() => setActiveTab('sensors')}
              role="tab"
              aria-selected={activeTab === 'sensors'}
              aria-controls="panel-sensors"
              id="tab-sensors"
            >
              Sensor Performance
            </button>
            <button
              className={`analytics-page__tab ${activeTab === 'reports' ? 'analytics-page__tab--active' : ''}`}
              onClick={() => setActiveTab('reports')}
              role="tab"
              aria-selected={activeTab === 'reports'}
              aria-controls="panel-reports"
              id="tab-reports"
            >
              Report Analysis
            </button>
          </div>

          <div className="analytics-page__content">
            {activeTab === 'overview' && (
              <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
                <div className="analytics-page__stats" role="list" aria-label="System statistics">
                  <div className="analytics-page__stat" role="listitem">
                    <span className="analytics-page__stat-value">{locations.length}</span>
                    <span className="analytics-page__stat-label">Active Locations</span>
                  </div>
                  <div className="analytics-page__stat" role="listitem">
                    <span className="analytics-page__stat-value">{sensors.length}</span>
                    <span className="analytics-page__stat-label">Total Sensors</span>
                  </div>
                  <div className="analytics-page__stat" role="listitem">
                    <span className="analytics-page__stat-value">{reports.length}</span>
                    <span className="analytics-page__stat-label">Citizen Reports</span>
                  </div>
                  <div className="analytics-page__stat" role="listitem">
                    <span className="analytics-page__stat-value">
                      {locations.filter(l => l.risk_level === 'CRITICAL').length}
                    </span>
                    <span className="analytics-page__stat-label">Critical Locations</span>
                  </div>
                </div>
                <div className="analytics-page__chart-row">
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Risk Distribution</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={getRiskDistribution()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" aria-label="Risk distribution pie chart">
                            {getRiskDistribution().map((entry, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Location Risk Scores</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={getLocationRiskData()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v, n, p) => [v, p.payload.fullName]} />
                          <Bar dataKey="risk_score" fill="#0f172a" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div id="panel-trends" role="tabpanel" aria-labelledby="tab-trends">
                <div className="analytics-page__chart-card analytics-page__chart-card--full">
                  <h3 className="analytics-page__chart-title">Risk Score Trends (6-hour window)</h3>
                  <div className="analytics-page__chart-container analytics-page__chart-container--tall">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg_risk_score" stroke="#0f172a" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sensors' && (
              <div id="panel-sensors" role="tabpanel" aria-labelledby="tab-sensors">
                <div className="analytics-page__chart-row">
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Sensor Connectivity</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie data={getSensorStatusData()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" aria-label="Sensor connectivity pie chart">
                            {getSensorStatusData().map((entry, i) => (
                              <Cell key={i} fill={['#059669', '#dc2626', '#d97706'][i]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Sensor Readings by Location</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={getLocationRiskData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v, n, p) => [v, p.payload.fullName]} />
                          <Bar dataKey="risk_score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div id="panel-reports" role="tabpanel" aria-labelledby="tab-reports">
                <div className="analytics-page__chart-row">
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Report Severity Distribution</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={getReportSeverityData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="analytics-page__chart-card">
                    <h3 className="analytics-page__chart-title">Report Status Summary</h3>
                    <div className="analytics-page__chart-container">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Pending', value: reports.filter(r => r.status === 'Pending').length },
                              { name: 'Verified', value: reports.filter(r => r.status === 'Verified').length },
                              { name: 'Rejected', value: reports.filter(r => r.status === 'Rejected').length }
                            ]}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name"
                            aria-label="Report status pie chart"
                          >
                            {[
                              { fill: '#d97706' },
                              { fill: '#059669' },
                              { fill: '#dc2626' }
                            ].map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}