import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { categoriesAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CategoryForm({ category, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', position: 0, isActive: true,
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        position: category.position || 0,
        isActive: category.isActive ?? true,
      })
    }
  }, [category])

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'name' && !category) {
      const slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      setFormData(p => ({ ...p, slug }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...formData, position: parseInt(formData.position) || 0 }
      if (category) {
        await categoriesAPI.update(category.id, data)
        toast.success('Категория обновлена!')
      } else {
        await categoriesAPI.create(data)
        toast.success('Категория создана!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">{category ? 'Редактировать категорию' : 'Создать категорию'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Название *</label>
              <input className="form-control" name="name" value={formData.name} onChange={set} required placeholder="Витамины и БАДы" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Slug (URL) *</label>
              <input className="form-control" name="slug" value={formData.slug} onChange={set} required placeholder="vitaminy-i-bady" pattern="[a-z0-9-]+" />
              <p className="form-hint">Только строчные латинские буквы, цифры и дефисы</p>
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={set} rows={3} placeholder="Краткое описание категории..." />
            </div>
            <div className="form-group">
              <label className="form-label">Позиция</label>
              <input className="form-control" type="number" name="position" value={formData.position} onChange={set} min="0" placeholder="0" />
              <p className="form-hint">Меньшее число = выше в списке</p>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={set} />
              Активна
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : category ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
