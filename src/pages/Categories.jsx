import { useState, useEffect } from 'react'
import { categoriesAPI } from '../services/api'
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, FolderTree } from 'lucide-react'
import toast from 'react-hot-toast'
import CategoryForm from '../components/CategoryForm'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)

  useEffect(() => { window.scrollTo(0, 0); load() }, [])

  const load = async () => {
    try {
      const { data } = await categoriesAPI.getAll()
      setCategories(data.data || [])
    } catch { toast.error('Ошибка загрузки категорий') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id, name, count) => {
    if (count > 0) return toast.error(`Нельзя удалить — в категории «${name}» есть ${count} товаров`)
    if (!window.confirm(`Удалить категорию «${name}»?`)) return
    try { await categoriesAPI.delete(id); toast.success('Удалено'); load() }
    catch { toast.error('Ошибка удаления') }
  }

  const handleToggle = async (cat) => {
    try {
      await categoriesAPI.update(cat.id, { isActive: !cat.isActive })
      toast.success(cat.isActive ? 'Деактивирована' : 'Активирована')
      load()
    } catch { toast.error('Ошибка') }
  }

  const moveUp = async (cat, i) => {
    if (i === 0) return
    const prev = categories[i - 1]
    try {
      await categoriesAPI.update(cat.id, { position: prev.position })
      await categoriesAPI.update(prev.id, { position: cat.position })
      load()
    } catch { toast.error('Ошибка') }
  }

  const moveDown = async (cat, i) => {
    if (i === categories.length - 1) return
    const next = categories[i + 1]
    try {
      await categoriesAPI.update(cat.id, { position: next.position })
      await categoriesAPI.update(next.id, { position: cat.position })
      load()
    } catch { toast.error('Ошибка') }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Категории</h1>
          <p className="page-subtitle">Всего: {categories.length}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={16} /> Добавить категорию
        </button>
      </div>

      <div className="card">
        {categories.length === 0 ? (
          <div className="empty-state"><FolderTree /><p>Нет категорий. Создайте первую!</p></div>
        ) : (
          categories.map((cat, i) => (
            <div className="category-row" key={cat.id} style={{ opacity: cat.isActive ? 1 : 0.55 }}>
              {/* Position controls */}
              <div className="pos-controls">
                <button className="pos-btn" onClick={() => moveUp(cat, i)} disabled={i === 0} title="Вверх">
                  <ArrowUp size={14} />
                </button>
                <button className="pos-btn" onClick={() => moveDown(cat, i)} disabled={i === categories.length - 1} title="Вниз">
                  <ArrowDown size={14} />
                </button>
              </div>

              {/* Position number */}
              <div style={{
                width: 36, height: 36, background: 'var(--bg-muted)',
                borderRadius: 'var(--radius-sm)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, color: 'var(--text-muted)', fontSize: 13,
                flexShrink: 0,
              }}>
                {cat.position}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{cat.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <code>/{cat.slug}</code>
                  {cat.description && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat.description}</span>
                  )}
                </div>
              </div>

              {/* Products count */}
              <span className="badge badge-gray" style={{ flexShrink: 0 }}>
                {cat._count?.products || 0} товаров
              </span>

              {/* Status toggle */}
              <button
                className={`badge ${cat.isActive ? 'badge-success' : 'badge-danger'}`}
                onClick={() => handleToggle(cat)}
                style={{ border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                {cat.isActive ? 'Активна' : 'Неактивна'}
              </button>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-outline btn-icon" onClick={() => { setEditing(cat); setShowForm(true) }} title="Редактировать">
                  <Edit size={15} />
                </button>
                <button className="btn btn-danger btn-icon" onClick={() => handleDelete(cat.id, cat.name, cat._count?.products || 0)} title="Удалить">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSuccess={load}
        />
      )}
    </>
  )
}
