import { useState } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(credentials)
      toast.success('Вход выполнен!')
      onLogin(data.data.token)
    } catch {
      toast.error('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">E</div>
          <h1 className="login-title">EMRA Admin</h1>
          <p className="login-subtitle">Войдите в панель управления</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              type="text"
              value={credentials.username}
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-control"
              type="password"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, height: 42 }}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
