import { lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Sidebar from './layouts/Sidebar'
import Topbar from './layouts/Topbar'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const RiskMap = lazy(() => import('./pages/RiskMap'))
const PriorityQueue = lazy(() => import('./pages/PriorityQueue'))
const Sensors = lazy(() => import('./pages/Sensors'))
const Reports = lazy(() => import('./pages/Reports'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Events = lazy(() => import('./pages/Events'))
const Settings = lazy(() => import('./pages/Settings'))
const MLPredictions = lazy(() => import('./pages/MLPredictions'))
const Hazards = lazy(() => import('./pages/Hazards'))

import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function DashboardLayout({ children, demoMode, onToggleDemo }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      setRefreshKey(k => k + 1)
    }, 800)
  }, [])

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar
          onMenuToggle={() => setSidebarOpen(o => !o)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          demoMode={demoMode}
          onToggleDemo={onToggleDemo}
        />
        <main className="app-content">
          <div key={refreshKey}>{children}</div>
        </main>
      </div>
    </div>
  )
}

function AppRoutes() {
  const [demoMode, setDemoMode] = useState(false)
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="*" element={
        <ProtectedRoute>
          <DashboardLayout demoMode={demoMode} onToggleDemo={() => setDemoMode(d => !d)}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard demoMode={demoMode} />} />
              <Route path="/risk-map" element={<RiskMap demoMode={demoMode} />} />
              <Route path="/priority" element={<PriorityQueue demoMode={demoMode} />} />
              <Route path="/sensors" element={<Sensors demoMode={demoMode} />} />
              <Route path="/reports" element={<Reports demoMode={demoMode} />} />
              <Route path="/analytics" element={<Analytics demoMode={demoMode} />} />
              <Route path="/ml-predictions" element={<MLPredictions demoMode={demoMode} />} />
              <Route path="/hazards" element={<Hazards />} />
              <Route path="/events" element={<Events demoMode={demoMode} onToggleDemo={() => setDemoMode(d => !d)} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}