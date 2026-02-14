import { useState, useEffect } from 'react'
import { ordersAPI } from '../services/api'
import { Search, Eye, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import OrderDetails from '../components/OrderDetails'

const STATUS = {
  PENDING:    { badge: 'badge-warning', label: 'Ожидает' },
  CONFIRMED:  { badge: 'badge-primary', label: 'Подтверждён' },
  PROCESSING: { badge: 'badge-purple',  label: 'Обрабатывается' },
  READY:      { badge: 'badge-success', label: 'Готов' },
  IN_DELIVERY:{ badge: 'badge-primary', label: 'В доставке' },
  COMPLETED:  { badge: 'badge-success', label: 'Завершён' },
  CANCELLED:  { badge: 'badge-danger',  label: 'Отменён' },
}

const NEXT = {
  PENDING: 'CONFIRMED', CONFIRMED: 'PROCESSING',
  PROCESSING: 'READY', READY: 'IN_DELIVERY', IN_DELIVERY: 'COMPLETED',
}

export default function Orders() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { window.scrollTo(0, 0); load() }, [])

  const load = async () => {
    try {
      const { data } = await ordersAPI.getAll()
      setOrders(Array.isArray(data.data) ? data.data : [])
    } catch { toast.error('Ошибка загрузки заказов'); setOrders([]) }
    finally { setLoading(false) }
  }

  const openDetails = async (id) => {
    try {
      const { data } = await ordersAPI.getById(id)
      setSelected(data.data)
    } catch { toast.error('Ошибка загрузки деталей') }
  }

  const changeStatus = async (id, cur) => {
    const next = NEXT[cur]
    if (!next) return toast.error('Невозможно изменить статус')
    if (!window.confirm(`Изменить статус на «${STATUS[next]?.label}»?`)) return
    try {
      await ordersAPI.updateStatus(id, { status: next })
      toast.success('Статус обновлён')
      load()
    } catch { toast.error('Ошибка') }
  }

  const cancelOrder = async (id) => {
    if (!window.confirm('Отменить заказ?')) return
    try {
      await ordersAPI.updateStatus(id, { status: 'CANCELLED' })
      toast.success('Заказ отменён')
      load()
    } catch { toast.error('Ошибка') }
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const matchText = o.orderNumber?.toString().includes(q) ||
                      o.customerName?.toLowerCase().includes(q) ||
                      o.customerPhone?.includes(search)
    return matchText && (!statusFilter || o.status === statusFilter)
  })

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Заказы</h1>
          <div className="stats-row" style={{ marginTop: 4 }}>
            <span className="stat-item">Всего: <strong>{orders.length}</strong></span>
            <span className="stat-item">Ожидают: <strong>{orders.filter(o => o.status === 'PENDING').length}</strong></span>
            <span className="stat-item">Завершены: <strong>{orders.filter(o => o.status === 'COMPLETED').length}</strong></span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по номеру, имени, телефону..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filters-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart />
              <p>{search || statusFilter ? 'Заказы не найдены' : 'Нет заказов'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>№ Заказа</th>
                  <th>Клиент</th>
                  <th className="hide-mobile">Дата</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const st = STATUS[order.status] || STATUS.PENDING
                  return (
                    <tr key={order.id}>
                      <td><code>#{order.orderNumber}</code></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{order.customerName || 'Не указано'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customerPhone || '—'}</div>
                      </td>
                      <td className="hide-mobile" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>{order.total} ₸</td>
                      <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button className="btn btn-outline btn-icon" onClick={() => openDetails(order.id)} title="Детали">
                            <Eye size={15} />
                          </button>
                          {NEXT[order.status] && (
                            <button className="btn btn-primary" style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                              onClick={() => changeStatus(order.id, order.status)}>
                              {STATUS[NEXT[order.status]]?.label}
                            </button>
                          )}
                          {!['CANCELLED','COMPLETED'].includes(order.status) && (
                            <button className="btn btn-danger" style={{ height: 32, padding: '0 10px', fontSize: 12 }}
                              onClick={() => cancelOrder(order.id)}>
                              Отменить
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <OrderDetails order={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
