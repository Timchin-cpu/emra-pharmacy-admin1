import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { categoriesAPI, productsAPI } from '../services/api'
import toast from 'react-hot-toast'
import ImageUpload from './ImageUpload'

export default function ProductForm({ product, onClose, onSuccess }) {
  const [loading, setLoading]     = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData]   = useState({
    sku: '', name: '', description: '', price: '', oldPrice: '',
    discountPercent: '', categoryId: '', variants: '', stock: '',
    tag: '', images: [], ingredients: '', usage: '', safety: '',
    isFeatured: false, isActive: true,
  })

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.data || []))
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        oldPrice: product.oldPrice || '',
        discountPercent: product.discountPercent || '',
        categoryId: product.categoryId || '',
        variants: product.variants?.join(', ') || '',
        stock: product.stock || '',
        tag: product.tag || '',
        images: [product.image, ...(product.images || [])].filter(Boolean),
        ingredients: product.ingredients || '',
        usage: product.usage || '',
        safety: product.safety || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive ?? true,
      })
    }
  }, [product])

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        variants: formData.variants ? formData.variants.split(',').map(v => v.trim()).filter(Boolean) : [],
        image: formData.images[0] || '',
        images: formData.images.slice(1),
        tag: formData.tag || null,
        ingredients: formData.ingredients || null,
        usage: formData.usage || null,
        safety: formData.safety || null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
      }
      if (product) {
        await productsAPI.update(product.id, data)
        toast.success('Товар обновлён!')
      } else {
        await productsAPI.create(data)
        toast.success('Товар создан!')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка сохранения')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">{product ? 'Редактировать товар' : 'Создать товар'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input className="form-control" name="sku" value={formData.sku} onChange={set} required placeholder="VIT-C-1000" />
              </div>
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input className="form-control" name="name" value={formData.name} onChange={set} required placeholder="Витамин C 1000мг" />
              </div>
              <div className="form-group">
                <label className="form-label">Категория *</label>
                <select className="form-control" name="categoryId" value={formData.categoryId} onChange={set} required>
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Цена *</label>
                <input className="form-control" type="number" name="price" value={formData.price} onChange={set} required step="0.01" min="0" placeholder="8.99" />
              </div>
              <div className="form-group">
                <label className="form-label">Старая цена</label>
                <input className="form-control" type="number" name="oldPrice" value={formData.oldPrice} onChange={set} step="0.01" min="0" placeholder="12.99" />
              </div>
              <div className="form-group">
                <label className="form-label">Скидка %</label>
                <input className="form-control" type="number" name="discountPercent" value={formData.discountPercent} onChange={set} min="0" max="100" placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Остаток *</label>
                <input className="form-control" type="number" name="stock" value={formData.stock} onChange={set} required min="0" placeholder="100" />
              </div>
              <div className="form-group">
                <label className="form-label">Тег</label>
                <input className="form-control" name="tag" value={formData.tag} onChange={set} placeholder="Новинка, Хит продаж" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Описание *</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={set} required rows={3} placeholder="Подробное описание товара..." />
            </div>

            <div className="form-group">
              <label className="form-label">Варианты (через запятую)</label>
              <input className="form-control" name="variants" value={formData.variants} onChange={set} placeholder="30 таблеток, 60 таблеток, 90 таблеток" />
            </div>

            <div className="form-group">
              <label className="form-label">Изображения (до 5 шт)</label>
              <ImageUpload images={formData.images} onChange={imgs => setFormData(p => ({ ...p, images: imgs }))} maxImages={5} />
            </div>

            <div className="form-group">
              <label className="form-label">Состав</label>
              <textarea className="form-control" name="ingredients" value={formData.ingredients} onChange={set} rows={2} placeholder="Аскорбиновая кислота 1000 мг..." />
            </div>
            <div className="form-group">
              <label className="form-label">Применение</label>
              <textarea className="form-control" name="usage" value={formData.usage} onChange={set} rows={2} placeholder="По 1 таблетке в день во время еды" />
            </div>
            <div className="form-group">
              <label className="form-label">Предостережения</label>
              <textarea className="form-control" name="safety" value={formData.safety} onChange={set} rows={2} placeholder="Не превышать рекомендуемую дозу..." />
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              <label className="checkbox-label">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={set} />
                Рекомендуемый товар
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={set} />
                Активен
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Отмена</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Сохранение...' : product ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
