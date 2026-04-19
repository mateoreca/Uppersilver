'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/api';
import { useState } from 'react';
import CheckoutModal from '@/components/CheckoutModal';

export default function CartPage() {
  const { items, totalItems, totalPrice, removeItem, increment, decrement, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          background: 'var(--bg-base)',
          padding: '40px 24px',
        }}
      >
        {/* Icono vacío */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Tu carrito está vacío
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Explora nuestras colecciones y agrega prendas que te encanten.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/hombre" style={{ textDecoration: 'none' }}>
            <button id="cart-empty-hombre" className="btn-secondary">Hombre</button>
          </Link>
          <Link href="/mujer" style={{ textDecoration: 'none' }}>
            <button id="cart-empty-mujer" className="btn-primary">Mujer</button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          background: 'var(--bg-base)',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--bg-glass)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            ¡Pedido Confirmado!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Gracias por tu compra. Te hemos enviado un correo con los detalles de tu pedido.
          </p>
        </div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" onClick={() => clearCart()}>Volver al inicio</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ─── HEADER ───────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '60px 0 40px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, #141414 0%, var(--bg-base) 100%)',
        }}
      >
        <div className="container-us">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 5vw, 52px)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                Carrito
              </h1>
              <span className="badge">{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            <button
              id="cart-clear-btn"
              onClick={clearCart}
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 150ms',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#dc2626';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
              }}
            >
              Vaciar carrito
            </button>
          </div>
        </div>
      </div>

      <div className="container-us" style={{ padding: '48px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 360px',
            gap: '32px',
            alignItems: 'start',
          }}
          className="cart-layout"
        >
          {/* ─── LISTA DE ITEMS ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item, idx) => {
              const itemKey = `${item.productId}-${item.size}-${item.color}`;
              return (
                <div
                  key={itemKey}
                  id={`cart-item-${idx}`}
                  className="glass-card animate-fade-up"
                  style={{
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '20px',
                    alignItems: 'center',
                    animationDelay: `${idx * 60}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Miniatura */}
                  <div
                    style={{
                      aspectRatio: '3/4',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-card)',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '17px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Variantes seleccionadas */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-card)',
                          borderRadius: '100px',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Talla: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong>
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-card)',
                          borderRadius: '100px',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, border: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }} />
                        {item.color}
                      </span>
                    </div>

                    {/* Precio unitario */}
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {formatPrice(item.price)} / unidad
                    </span>

                    {/* Controles cantidad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: 'var(--bg-elevated)',
                        }}
                      >
                        <button
                          id={`cart-decrement-${idx}`}
                          onClick={() => decrement(item.productId, item.size, item.color)}
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Disminuir"
                        >
                          −
                        </button>
                        <span
                          style={{
                            width: '40px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            borderLeft: '1px solid var(--border-subtle)',
                            borderRight: '1px solid var(--border-subtle)',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          id={`cart-increment-${idx}`}
                          onClick={() => increment(item.productId, item.size, item.color)}
                          style={{
                            width: '36px',
                            height: '36px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      {/* Eliminar */}
                      <button
                        id={`cart-remove-${idx}`}
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textDecoration: 'underline',
                          textUnderlineOffset: '2px',
                          transition: 'color 150ms',
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#ef4444')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')}
                        aria-label={`Eliminar ${item.name} del carrito`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      className="text-gold-gradient"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── RESUMEN DE PEDIDO ─────────────────────────────────────────── */}
          <aside>
            <div
              className="glass-card"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Resumen
              </h2>

              {/* Líneas del resumen */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({totalItems} artículos)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatPrice(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Envío</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>Por calcular</span>
                </div>
              </div>

              <div className="divider" />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700 }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Botón checkout */}
              <button
                id="cart-checkout-btn"
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '15px' }}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Proceder al pago
              </button>

              {/* Link seguir comprando */}
              <Link href="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ← Seguir comprando
                </span>
              </Link>

              {/* Métodos de pago */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.06em', marginBottom: '10px', textTransform: 'uppercase' }}>
                  Métodos de pago
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['Wompi', 'Mercado Pago', 'PSE', 'Nequi'].map((method) => (
                    <span
                      key={method}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', marginTop: '80px' }}>
        <div className="container-us" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 UpperSilver</p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          #cart-item-0, #cart-item-1, #cart-item-2, #cart-item-3, #cart-item-4,
          #cart-item-5, #cart-item-6, #cart-item-7, #cart-item-8, #cart-item-9 {
            grid-template-columns: 80px 1fr !important;
          }
        }
      `}</style>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        totalAmount={totalPrice}
        onSuccess={() => {
          setOrderSuccess(true);
          clearCart();
        }}
      />
    </div>
  );
}
