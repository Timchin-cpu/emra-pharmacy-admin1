import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical, Search } from 'lucide-react'
import { bannersAPI, productsAPI } from '../services/api'
import toast from 'react-hot-toast'
import BannerImageUpload from './BannerImageUpload'

export default function BannerForm({ banner, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'products'
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    isActive: true,
    displayOrder: 0,
  })

  // Товары баннера
  const [bannerProducts, setBannerProducts] = useState([])
  // Все товары для поиска
  const [allProducts, setAllProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [productsLoading, setProductsLoading] = useState(false)

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
      // Товары уже приходят вместе с баннером
      setBannerProducts(banner.products || [])
    }
  }, [banner])

  // Загрузка всех товаров при открытии вкладки products
  useEffect(() => {
    if (activeTab === 'products' && allProducts.length === 0) {
      setProductsLoading(true)
      productsAPI.getAll()
        .then(({ data }) => {
          const list = Array.isArray(data?.data) ? data.data
            : Array.isArray(data) ? data : []
          setAllProducts(list)
        })
        .catch(() => toast.error('Ошибка загрузки товаров'))
        .finally(() => setProductsLoading(false))
    }
  }, [activeTab])

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
      const fd = new FormData()
      fd.append('title',        formData.title.trim())
      fd.append('subtitle',     formData.subtitle.trim())
      fd.append('link',         formData.link.trim())
      fd.append('isActive',     formData.isActive)
      fd.append('displayOrder', parseInt(formData.displayOrder) || 0)
      if (formData.image instanceof File) {
        fd.append('image', formData.image)
      } else if (formData.image) {
        fd.append('image', formData.image.trim())
      }

      if (banner) {
        await bannersAPI.update(banner.id, fd)
        toast.success('Баннер обновлён!')
      } else {
        await bannersAPI.create(fd)
        toast.success('Баннер создан!')
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error?.message || 'Ошибка сохранения баннера')
    } finally {
      setLoading(false)
    }
  }

  // Добавить товар в баннер
  const handleAddProduct = async (product) => {
    if (!banner?.id) {
      toast.error('Сначала сохраните баннер')
      return
    }
    if (bannerProducts.find(p => p.id === product.id)) {
      toast.error('Товар уже добавлен')
      return
    }
    try {
      await bannersAPI.addProducts(banner.id, [product.id])
      setBannerProducts(prev => [...prev, product])
      toast.success('Товар добавлен')
    } catch {
      toast.error('Ошибка добавления товара')
    }
  }

  // Удалить товар из баннера
  const handleRemoveProduct = async (productId) => {
    if (!banner?.id) return
    try {
      await bannersAPI.removeProduct(banner.id, productId)
      setBannerProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Товар удалён')
    } catch {
      toast.error('Ошибка удаления товара')
    }
  }

  // Отфильтрованные товары для поиска
  const filteredProducts = allProducts.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) &&
    !bannerProducts.find(bp => bp.id === p.id)
  )

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '12px',
        maxWidth: '680px', width: '100%',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'white', zIndex: 1,
        }}>
          <h2 style={{ margin: 0 }}>{banner ? 'Редактировать баннер' : 'Создать баннер'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Табы (только для существующего баннера) */}
        {banner && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
            {[
              { key: 'info', label: 'Основное' },
              { key: 'products', label: `Товары (${bannerProducts.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab.key ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '-1px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Вкладка: Основное */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div className="form-group">
              <label>Заголовок *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                required placeholder="Зимняя распродажа" autoFocus />
            </div>

            <div className="form-group">
              <label>Подзаголовок</label>
              <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange}
                placeholder="Скидки до 30% на все товары" />
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
              <input type="text" name="link" value={formData.link} onChange={handleChange}
                placeholder="https://... или /products?sale=true" />
            </div>

            <div className="form-group">
              <label>Порядок отображения</label>
              <input type="number" name="displayOrder" value={formData.displayOrder}
                onChange={handleChange} min="0" placeholder="0" />
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
        )}

        {/* Вкладка: Товары */}
        {activeTab === 'products' && (
          <div style={{ padding: '24px' }}>

            {/* Текущие товары баннера */}
            <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>
              Товары в баннере ({bannerProducts.length})
            </h3>
            {bannerProducts.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
                Нет добавленных товаров
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {bannerProducts.map(product => (
                  <div key={product.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', border: '1px solid #e5e7eb',
                    borderRadius: '8px', background: '#f9fafb',
                  }}>
                    {product.image && (
                      <img src={product.image} alt={product.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {product.price} ₸
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', borderRadius: '4px', flexShrink: 0 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Поиск товаров для добавления */}
            <h3 style={{ marginBottom: '12px', fontSize: '15px', fontWeight: 600 }}>
              Добавить товары
            </h3>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {productsLoading ? (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Загрузка товаров...</p>
            ) : (
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredProducts.slice(0, 30).map(product => (
                  <div key={product.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '8px 12px', border: '1px solid #e5e7eb',
                    borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    {product.image && (
                      <img src={product.image} alt={product.name}
                        style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.price} ₸</div>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '12px', flexShrink: 0 }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                    {productSearch ? 'Товары не найдены' : 'Все товары уже добавлены'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}