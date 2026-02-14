import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(v => !v)}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={onLogout}
      />
      <div className="main-area">
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(v => !v)}
          onLogout={onLogout}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
