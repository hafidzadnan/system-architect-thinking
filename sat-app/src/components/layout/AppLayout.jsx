import { useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuthStore } from '../../stores/authStore'

export default function AppLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (!isLoggedIn) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
        <Outlet />
      </div>
    </div>
  )
}
