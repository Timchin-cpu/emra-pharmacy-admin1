import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { bannersAPI } from '../services/api'
import toast from 'react-hot-toast'
import BannerImageUpload from './BannerImageUpload'

export default function BannerForm({ banner, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    isActive: true,
    displayOrder: 0,
  })

  useEffect(() => {
    if (banner) {
      setFormData({
        title:        banner.title        ?? '',
        subtitle:     banner.subtitle     ?? '',
        image:        banner.image        ?? '',
        link:         banner.link         ?? '',
        isActive:     banner.isActive     ?? true,
        displayOrder: banner.displayOrder ?? 0,
      })
    }
  }, [banner])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Формируем payload явно — subtitle всегда включён
      const payload = {
        title:        formData.title.trim(),
        subtitle:     formData.subtitle.trim() || null,
        image:        formData.image.trim() || 'https://via.placeholder.com/1200x400?text=Banner',
        link:         formData.link.trim() || null,
        isActive:     formData.isActive,
        displayOrder: parseInt(formData.displayOrder) || 0,
      }

      console.log('Banner payload:', payload) // для отладки

      if (banner) {
        await bannersAPI.update(banner.id, payload)
        toast.success('Баннер обновлён!')
      } else {
        await bannersAPI.create(payload)
        toast.success('Баннер создан!')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Banner save error:', error)
      toast.error(error?.message || 'Ошибка сохранения баннера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        maxWidth: '600px', width: '100%',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{
          padding: '24px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
        }}>
          <h2>{banner ? 'Редактировать баннер' : 'Создать баннер'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

          <div className="form-group">
            <label>Заголовок *</label>
            <input
              type="text" name="title"
              value={formData.title} onChange={handleChange}
              required placeholder="Зимняя распродажа"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Подзаголовок</label>
            <input
              type="text" name="subtitle"
              value={formData.subtitle} onChange={handleChange}
              placeholder="Скидки до 30% на все товары"
            />
          </div>

          <div className="form-group">
            <label>Изображение баннера</label>
            <BannerImageUpload
              image={formData.image}
              onChange={(val) => setFormData(prev => ({ ...prev, image: val }))}
            />
          </div>

          <div className="form-group">
            <label>Ссылка</label>
            <input
              type="text" name="link"
              value={formData.link} onChange={handleChange}
              placeholder="https://... или /products?sale=true"
            />
          </div>

          <div className="form-group">
            <label>Порядок отображения</label>
            <input
              type="number" name="displayOrder"
              value={formData.displayOrder} onChange={handleChange}
              min="0" placeholder="0"
            />
            <small style={{ color: '#6b7280', fontSize: '12px' }}>Меньшее число = выше в списке</small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              <span>Активен</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : (banner ? 'Обновить' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}