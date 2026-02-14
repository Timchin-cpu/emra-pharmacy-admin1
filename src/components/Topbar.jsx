import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, LogOut } from 'lucide-react'

export default function Topbar({ onMobileMenuToggle, onLogout }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="topbar">
      <button
        className="topbar-mobile-btn"
        onClick={onMobileMenuToggle}
        aria-label="Меню"
      >
        <Menu size={22} strokeWidth={1.5} />
      </button>

      <div className="topbar-search">
        <Search size={16} />
        <input type="search" placeholder="Поиск..." />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Уведомления">
          <Bell size={20} strokeWidth={1.5} />
          <span className="badge-dot" />
        </button>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="topbar-avatar"
            onClick={() => setUserMenuOpen(v => !v)}
            aria-label="Аккаунт"
          >
            AD
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '180px',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Admin</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>admin@emra.ru</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 16px',
                  background: 'transparent', border: 'none',
                  fontSize: '14px', color: 'var(--danger)',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} />
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
