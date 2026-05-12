import { useAuthStore } from '../../stores/authStore'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/settings': 'Pengaturan',
}

export default function Header() {
  const username = useAuthStore(s => s.username)
  const location = useLocation()
  const title = location.pathname.startsWith('/session/')
    ? 'Sesi Keputusan'
    : pageTitles[location.pathname] || 'System Architect Thinking'

  return (
    <header className="header">
      <span className="header-title">{title}</span>
      <div className="header-user">
        <span>{username}</span>
        <div className="header-avatar">{username?.charAt(0)?.toUpperCase() || 'U'}</div>
      </div>
    </header>
  )
}
