import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { bannersAPI } from '../services/api'
import toast from 'react-hot-toast'
import BannerImageUpload from './BannerImageUpload'

export default function BannerForm({ banner, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', image: '', linkType: 'NONE', linkValue: '', position: 0, isActive: true,
  })

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        image: banner.image || '',
        linkType: banner.linkType || 'NONE',
        linkValue: banner.linkValue || '',
        position: banner.position || 0,
        isActive: banner.isActive ?? true,
      })
    }
  }, [banner])

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        title: formData.title,
        image: formData.image || 'https://via.placeholder.com/1200x400?text=Banner',
        linkType: formData.linkType,
        linkValue: formData.linkType === 'NONE' ? null : (formData.linkValue || null),
        position: parseInt(formData.position) || 0,
        isActive: formData.isActive,
      }
      if (banner) {
        await bannersAPI.update(banner.id, data)
        toast.success('Баннер обновлён!')
      } else {
        await bannersAPI.create(data)
        toast.success('Баннер создан!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h2 className="modal-title">{banner ? 'Редактировать баннер' : 'Создать баннер'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Заголовок *</label>
              <input className="form-control" name="title" value={formData.title} onChange={set} required placeholder="Скидка 50% на все витамины!" autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Изображение баннера</label>
              <BannerImageUpload
                image={formData.image}
                onChange={img => setFormData(p => ({ ...p, image: img }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Тип ссылки</label>
              <select className="form-control" name="linkType" value={formData.linkType} onChange={set}>
                <option value="NONE">Без ссылки</option>
                <option value="CATEGORY">Категория</option>
                <option value="PRODUCT">Товар</option>
                <option value="URL">Произвольная ссылка</option>
              </select>
            </div>

            {formData.linkType !== 'NONE' && (
              <div className="form-group">
                <label className="form-label">
                  {formData.linkType === 'CATEGORY' && 'ID категории'}
                  {formData.linkType === 'PRODUCT'  && 'ID товара'}
                  {formData.linkType === 'URL'       && 'URL ссылки'}
                </label>
                <input
                  className="form-control"
                  name="linkValue"
                  value={formData.linkValue}
                  onChange={set}
                  placeholder={formData.linkType === 'URL' ? '/products?sale=true' : 'uuid...'}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Позиция</label>
              <input className="form-control" type="number" name="position" value={formData.position} onChange={set} min="0" />
              <p className="form-hint">Меньшее число = выше в списке</p>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={set} />
              Активен
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : banner ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
