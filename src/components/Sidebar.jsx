import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, FolderTree,
  Image, Tag, Settings, LogOut, ChevronLeft, X
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/' },
  { icon: Package,         label: 'Товары',     to: '/products' },
  { icon: ShoppingCart,    label: 'Заказы',     to: '/orders' },
  { icon: FolderTree,      label: 'Категории',  to: '/categories' },
  { icon: Image,           label: 'Баннеры',    to: '/banners' },
  { icon: Tag,             label: 'Промокоды',  to: '/promo' },
  { icon: Settings,        label: 'Настройки',  to: '/settings' },
]

export default function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose, onLogout }) {
  const sidebarClass = [
    'sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay active" onClick={onMobileClose} />
      )}

      <aside className={sidebarClass}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">E</div>
            <span className="sidebar-logo-text">EMRA Admin</span>
          </div>
          <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Закрыть">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active' : '')
                    }
                  >
                    <Icon size={20} strokeWidth={1.5} />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <LogOut size={20} strokeWidth={1.5} />
            <span className="nav-label">Выход</span>
          </button>
          <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Свернуть">
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        </div>
      </aside>
    </>
  )
}
