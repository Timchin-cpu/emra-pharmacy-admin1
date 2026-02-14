import { useState, useEffect } from 'react'
import { productsAPI, categoriesAPI } from '../services/api'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductForm from '../components/ProductForm'

// Универсальный парсер — API может вернуть массив, объект с items/data/products
function parseList(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  if (Array.isArray(raw.items))    return raw.items
  if (Array.isArray(raw.data))     return raw.data
  if (Array.isArray(raw.products)) return raw.products
  if (Array.isArray(raw.results))  return raw.results
  return []
}

export default function Products() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    load()
    categoriesAPI.getAll()
      .then(({ data }) => setCategories(parseList(data?.data ?? data)))
      .catch(() => {})
  }, [])

  const load = async () => {
    try {
      const { data } = await productsAPI.getAll()
      // data может быть: { data: [...] } или { data: { items: [...] } } или просто [...]
      const list = parseList(data?.data ?? data)
      setProducts(list)
    } catch (err) {
      console.error('Products load error:', err)
      toast.error('Ошибка загрузки товаров')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Удалить товар «${name}»?`)) return
    try {
      await productsAPI.delete(id)
      toast.success('Товар удалён')
      load()
    } catch { toast.error('Ошибка удаления') }
  }

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchText = p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
    const matchCat  = !catFilter || p.categoryId === catFilter
    return matchText && matchCat
  })

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Товары</h1>
          <div className="stats-row" style={{ marginTop: 4 }}>
            <span className="stat-item">Всего: <strong>{products.length}</strong></span>
            <span className="stat-item">Активных: <strong>{products.filter(p => p.isActive).length}</strong></span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus size={16} /> Добавить товар
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Поиск по названию или SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filters-select"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Package />
              <p>{search || catFilter ? 'Товары не найдены' : 'Нет товаров. Добавьте первый!'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th className="hide-mobile">SKU</th>
                  <th>Цена</th>
                  <th className="hide-mobile">Остаток</th>
                  <th>Статус</th>
                  <th style={{ textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="product-img"
                            onError={e => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                          {p.tag && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>{p.tag}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile"><code>{p.sku}</code></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.price} ₸</div>
                      {p.oldPrice && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {p.oldPrice} ₸
                        </div>
                      )}
                    </td>
                    <td className="hide-mobile">
                      <span className={`badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stock} шт
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>
                        {p.isActive ? 'Активен' : 'Скрыт'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline btn-icon"
                          onClick={() => { setEditing(p); setShowForm(true) }}
                          title="Редактировать"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Удалить"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSuccess={load}
        />
      )}
    </>
  )
}
