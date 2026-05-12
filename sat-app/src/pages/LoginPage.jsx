import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { isLoggedIn, login } = useAuthStore()
  const navigate = useNavigate()

  if (isLoggedIn) return <Navigate to="/" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username === 'demo' && password === 'demo123') {
      login(username)
      navigate('/')
    } else {
      setError('Username atau password salah. Gunakan demo / demo123')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">⚙️</div>
        <h1>System Architect Thinking</h1>
        <p className="subtitle">Platform Pengambilan Keputusan Terstruktur</p>
        {error && <div className="login-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 8 }}>Masuk</button>
        </form>
        <p style={{ marginTop: 20, fontSize: 12, color: '#94A3B8' }}>Demo: demo / demo123</p>
      </div>
    </div>
  )
}
