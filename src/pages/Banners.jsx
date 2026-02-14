import { useState, useEffect } from 'react'
import { bannersAPI } from '../services/api'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import BannerForm from '../components/BannerForm'

export default function Banners() {
  const [banners, setBanners]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)

  useEffect(() => { window.scrollTo(0, 0); load() }, [])

  const load = async () => {
    try {
      const { data } = await bannersAPI.getAll()
      setBanners(data.data || [])
    } catch { toast.error('Ошибка загрузки баннеров') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Удалить баннер «${title}»?`)) return
    try { await bannersAPI.delete(id); toast.success('Удалено'); load() }
    catch { toast.error('Ошибка удаления') }
  }

  const handleToggle = async (b) => {
    try {
      await bannersAPI.update(b.id, { isActive: !b.isActive })
      toast.success(b.isActive ? 'Деактивирован' : 'Активирован')
      load()
    } catch { toast.error('Ошибка') }
  }

  const moveUp = async (b, i) => {
    if (i === 0) return
    const prev = banners[i - 1]
    try {
      await bannersAPI.update(b.id, { position: prev.position })
      await bannersAPI.update(prev.id, { position: b.position })
      load()
    } catch { toast.error('Ошибка') }
  }

  const moveDown = async (b, i) => {
    if (i === banners.length - 1) return
    const next = banners[i + 1]
    try {
      await bannersAPI.update(b.id, { position: next.position })
      await bannersAPI.update(next.id, { position: b.position })
      load()
    } catch { toast.error('Ошибка') }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Баннеры</h1>
          <p className="page-subtitle">
            Всего: {banners.length} • Активных: {banners.filter(b => b.isActive).length}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={16} /> Добавить баннер
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="card"><div className="empty-state"><Image /><p>Нет баннеров. Создайте первый!</p></div></div>
      ) : (
        <div className="banner-grid">
          {banners.map((b, i) => (
            <div className="banner-card" key={b.id} style={{ opacity: b.isActive ? 1 : 0.6 }}>
              <div className="banner-card-img">
                <img
                  src={b.image}
                  alt={b.title}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x180?text=No+Image' }}
                />
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  background: 'rgba(0,0,0,0.65)', color: 'white',
                  padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                }}>
                  #{b.position}
                </div>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {b.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>

              <div className="banner-card-body">
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{b.title}</div>

                {b.linkType !== 'NONE' && b.linkValue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <ExternalLink size={13} />
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>{b.linkType}</span>
                    <code>{b.linkValue}</code>
                  </div>
                )}

                <div className="banner-card-actions">
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="pos-btn" onClick={() => moveUp(b, i)} disabled={i === 0} title="Вверх">
                      <ArrowUp size={14} />
                    </button>
                    <button className="pos-btn" onClick={() => moveDown(b, i)} disabled={i === banners.length - 1} title="Вниз">
                      <ArrowDown size={14} />
                    </button>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-outline" style={{ height: 30, padding: '0 10px', fontSize: 12 }}
                    onClick={() => handleToggle(b)}>
                    {b.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <button className="btn btn-outline btn-icon" style={{ height: 30, width: 30 }}
                    onClick={() => { setEditing(b); setShowForm(true) }}>
                    <Edit size={14} />
                  </button>
                  <button className="btn btn-danger btn-icon" style={{ height: 30, width: 30 }}
                    onClick={() => handleDelete(b.id, b.title)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerForm
          banner={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSuccess={load}
        />
      )}
    </>
  )
}
