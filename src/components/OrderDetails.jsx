import { X, Package, User, MapPin, Phone, CreditCard, Tag } from 'lucide-react'
import { format } from 'date-fns'

const ORDER_STATUS = {
  PENDING:    { badge: 'badge-warning', label: 'Ожидает' },
  CONFIRMED:  { badge: 'badge-primary', label: 'Подтверждён' },
  PROCESSING: { badge: 'badge-purple',  label: 'Обрабатывается' },
  READY:      { badge: 'badge-success', label: 'Готов' },
  IN_DELIVERY:{ badge: 'badge-primary', label: 'В доставке' },
  COMPLETED:  { badge: 'badge-success', label: 'Завершён' },
  CANCELLED:  { badge: 'badge-danger',  label: 'Отменён' },
}

const PAY_STATUS = {
  PENDING:    { badge: 'badge-warning', label: 'Ожидает' },
  PROCESSING: { badge: 'badge-primary', label: 'Обработка' },
  PAID:       { badge: 'badge-success', label: 'Оплачено' },
  FAILED:     { badge: 'badge-danger',  label: 'Ошибка' },
  REFUNDED:   { badge: 'badge-gray',    label: 'Возврат' },
}

export default function OrderDetails({ order, onClose }) {
  if (!order) return null
  const st  = ORDER_STATUS[order.status]  || ORDER_STATUS.PENDING
  const pay = PAY_STATUS[order.paymentStatus] || PAY_STATUS.PENDING

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Заказ #{order.orderNumber}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Статусы */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Статус заказа</div>
              <span className={`badge ${st.badge}`}>{st.label}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Статус оплаты</div>
              <span className={`badge ${pay.badge}`}>{pay.label}</span>
            </div>
          </div>

          {/* Клиент */}
          <div className="info-block">
            <div className="info-block-title"><User size={16} /> Информация о клиенте</div>
            <div className="info-row"><span className="info-row-label">Имя</span><span className="info-row-value">{order.customerName || '—'}</span></div>
            <div className="info-row">
              <span className="info-row-label">Телефон</span>
              <span className="info-row-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> {order.customerPhone || '—'}
              </span>
            </div>
            {order.deliveryAddress && (
              <div className="info-row">
                <span className="info-row-label">Адрес</span>
                <span className="info-row-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> {order.deliveryAddress}
                </span>
              </div>
            )}
            <div className="info-row"><span className="info-row-label">Доставка</span><span className="info-row-value">{order.deliveryType || 'Самовывоз'}</span></div>
          </div>

          {/* Товары */}
          <div className="info-block">
            <div className="info-block-title"><Package size={16} /> Товары ({order.items?.length || 0})</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{item.product?.name || item.name}</div>
                  {item.variant && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.variant}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.quantity} шт</div>
                  <div style={{ fontWeight: 600 }}>{item.price} ₸</div>
                </div>
              </div>
            ))}
          </div>

          {/* Промокод */}
          {order.promoCode && (
            <div className="info-block" style={{ background: 'var(--warning-light)' }}>
              <div className="info-block-title"><Tag size={16} /> Промокод</div>
              <div style={{ fontWeight: 600 }}>{order.promoCode.code}</div>
              <div style={{ fontSize: 13, color: 'var(--warning-text)' }}>Скидка: {order.discount} ₸</div>
            </div>
          )}

          {/* Итого */}
          <div className="info-block">
            <div className="info-block-title"><CreditCard size={16} /> Итого</div>
            <div className="info-row"><span className="info-row-label">Сумма товаров</span><span className="info-row-value">{order.subtotal} ₸</span></div>
            {order.discount > 0 && (
              <div className="info-row">
                <span className="info-row-label">Скидка</span>
                <span style={{ fontWeight: 500, color: 'var(--success)' }}>−{order.discount} ₸</span>
              </div>
            )}
            <div className="info-row"><span className="info-row-label">Доставка</span><span className="info-row-value">{order.deliveryFee} ₸</span></div>
            <div className="info-row info-row-total">
              <span>Итого</span>
              <span>{order.total} ₸</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}
