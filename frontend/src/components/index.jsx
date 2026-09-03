export function RiskBadge({ score, level, size = 'md' }) {
  const levelClass = level ? level.toLowerCase() : score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'moderate' : 'low'
  return (
    <span className={`badge badge--${levelClass} ${size === 'lg' ? 'badge--lg' : ''}`}>
      {level || (score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MODERATE' : 'LOW')}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = { online: 'connected', connected: 'connected', delayed: 'delayed', offline: 'offline', Verified: 'verified', verified: 'verified', Pending: 'pending', Rejected: 'offline' }
  return <span className={`badge badge--${map[status] || 'info'}`}>{status}</span>
}

export function MetricCard({ label, value, trend, trendDir, icon, iconClass, meta }) {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <span className="metric-card__label">{label}</span>
        {icon && <div className={`metric-card__icon metric-card__icon--${iconClass || 'info'}`}>{icon}</div>}
      </div>
      <div className="metric-card__value">{value}</div>
      {trend && <div className={`metric-card__trend metric-card__trend--${trendDir || 'neutral'}`}>{trend}</div>}
      {meta && <div className="metric-card__meta">{meta}</div>}
    </div>
  )
}

export function ConfidenceIndicator({ value }) {
  const cls = value >= 80 ? 'high' : value >= 60 ? 'medium' : 'low'
  return (
    <div className="confidence-indicator">
      <div className="confidence-indicator__bar">
        <div className={`confidence-indicator__fill confidence-indicator__fill--${cls}`} style={{ width: `${value}%` }} />
      </div>
      <span className="confidence-indicator__label">{value}%</span>
    </div>
  )
}

export function RiskIndicator({ score, level }) {
  const lvl = level || (score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MODERATE' : 'LOW')
  const colorMap = { CRITICAL: 'var(--risk-critical)', HIGH: 'var(--risk-high)', MODERATE: 'var(--risk-moderate)', LOW: 'var(--risk-low)' }
  return (
    <div className="risk-indicator">
      <span className={`risk-indicator__dot risk-indicator__dot--${lvl.toLowerCase()}`} />
      <span className="risk-indicator__value" style={{ color: colorMap[lvl] }}>{score}</span>
    </div>
  )
}

export function Skeleton({ type = 'card' }) {
  return <div className={`skeleton skeleton--${type}`} />
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state__icon">!</div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__message">{message || 'Unable to load data. Please try again.'}</p>
      {onRetry && <button className="btn btn--secondary" onClick={onRetry}>Retry</button>}
    </div>
  )
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} type="metric" />)}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} type="row" />)}
    </div>
  )
}