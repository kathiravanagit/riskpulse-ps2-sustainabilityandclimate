import { useState, useEffect, useCallback } from 'react'
import { getCitizenReports } from '../services/api'
import { SkeletonCards, ErrorState, EmptyState } from '../components'
import './Reports.css'

export default function Reports({ demoMode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reports, setReports] = useState([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterSeverity, setFilterSeverity] = useState('ALL')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCitizenReports()
      setReports(data)
    } catch (err) {
      setError(err.message || 'Failed to load citizen reports')
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, demoMode])

  const filteredReports = reports.filter(r => {
    if (filterStatus !== 'ALL' && r.status?.toUpperCase() !== filterStatus) return false
    if (filterSeverity !== 'ALL') {
      const sev = parseInt(r.severity)
      if (filterSeverity === 'HIGH' && sev < 4) return false
      if (filterSeverity === 'MODERATE' && (sev < 2 || sev > 3)) return false
      if (filterSeverity === 'LOW' && sev > 1) return false
    }
    return true
  })

  const getSeverityBadgeClass = (severity) => {
    const sev = parseInt(severity)
    if (sev >= 4) return 'badge--critical'
    if (sev >= 3) return 'badge--high'
    if (sev >= 2) return 'badge--warning'
    return 'badge--success'
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'badge--verified'
      case 'pending': return 'badge--pending'
      case 'rejected': return 'badge--offline'
      default: return 'badge--info'
    }
  }

  if (error) {
    return (
      <div className="reports-page">
        <ErrorState title="Unable to load citizen reports" message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="reports-page">
      <div className="reports-page__header">
        <div>
          <h1 className="reports-page__title">Citizen Reports</h1>
          <p className="reports-page__subtitle">Crowd-sourced observations from verified reporters in the field.</p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards count={3} />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports submitted"
          message="Citizen reports will appear here once submitted through the mobile interface."
        />
      ) : (
        <>
          <div className="reports-page__filters" role="toolbar" aria-label="Filter controls">
            <div className="reports-page__filter-group" role="group" aria-label="Status filter">
              <label className="reports-page__filter-label" htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                className="reports-page__select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="ALL">All Reports</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="reports-page__filter-group" role="group" aria-label="Severity filter">
              <label className="reports-page__filter-label" htmlFor="severity-filter">Severity:</label>
              <select
                id="severity-filter"
                className="reports-page__select"
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                aria-label="Filter by severity"
              >
                <option value="ALL">All Severity</option>
                <option value="HIGH">High (4-5)</option>
                <option value="MODERATE">Moderate (2-3)</option>
                <option value="LOW">Low (1)</option>
              </select>
            </div>
            <div className="reports-page__count" role="status" aria-live="polite">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="reports-page__list" role="list" aria-label="Citizen reports">
            {filteredReports.map(report => (
              <div key={report.report_id} className="reports-page__card" role="listitem">
                <div className="reports-page__card-header">
                  <div className="reports-page__card-id">
                    <span className="reports-page__card-id-label">Report ID</span>
                    <span className="reports-page__card-id-value">{report.report_id}</span>
                  </div>
                  <div className="reports-page__card-badges">
                    <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`badge ${getSeverityBadgeClass(report.severity)}`}>
                      Severity {report.severity}
                    </span>
                  </div>
                </div>
                <div className="reports-page__card-condition">
                  <span className="reports-page__card-condition-label">Condition</span>
                  <span className="reports-page__card-condition-value">{report.condition}</span>
                </div>
                <div className="reports-page__card-location">
                  <span className="reports-page__card-location-label">Location</span>
                  <span className="reports-page__card-location-value">{report.location_name}</span>
                </div>
                <div className="reports-page__card-meta">
                  <span>Submitted by: {report.reporter_name || 'Anonymous'}</span>
                  <span>Time: {report.timestamp}</span>
                </div>
                {report.notes && (
                  <div className="reports-page__card-notes">
                    <span className="reports-page__card-notes-label">Notes</span>
                    <p className="reports-page__card-notes-text">{report.notes}</p>
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