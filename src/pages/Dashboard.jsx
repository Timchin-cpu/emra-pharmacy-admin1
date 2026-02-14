import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { ShoppingCart, DollarSign, Package, Users } from 'lucide-react'

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="metric-card">
      <div>
        <p className="metric-label">{title}</p>
        <p className="metric-value">{value}</p>
      </div>
      <div className={`metric-icon ${color}`}>
        <Icon strokeWidth={1.5} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    dashboardAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Добро пожаловать! Вот что происходит сегодня.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <MetricCard title="Заказы"        value={stats?.totalOrders ?? 0}          icon={ShoppingCart} color="mint" />
        <MetricCard title="Выручка"       value={`${stats?.totalRevenue ?? 0} ₸`}  icon={DollarSign}   color="amber" />
        <MetricCard title="Товары"        value={stats?.totalProducts ?? 0}         icon={Package}      color="purple" />
        <MetricCard title="Пользователи"  value={stats?.totalUsers ?? 0}            icon={Users}        color="rose" />
      </div>
    </>
  )
}
