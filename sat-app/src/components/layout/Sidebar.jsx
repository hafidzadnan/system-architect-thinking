import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function Sidebar() {
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>⚙️ System Architect Thinking</h2>
        <p>Platform Pengambilan Keputusan</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end>
          <span className="nav-icon">🏠</span> Dashboard
        </NavLink>
        <NavLink to="/settings">
          <span className="nav-icon">⚙️</span> Pengaturan
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout}>
          <span className="nav-icon">🚪</span> Keluar
        </button>
      </div>
    </aside>
  )
}
