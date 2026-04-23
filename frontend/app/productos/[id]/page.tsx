'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Product, SIZES, COLORS, CartItem } from '@/types';
import { getProductById, formatPrice } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useRealtime } from '@/context/RealtimeContext';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  // Selecciones del usuario
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { socket } = useRealtime();

  useEffect(() => {
    getProductById(id)
      .then(setProduct)
      .catch(() => setNotFoundError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!socket || !id) return;

    const handleStockUpdate = (data: { productId: string; newStock: number }) => {
      if (data.productId === id) {
        console.log(`Stock updated in real-time for product ${id}: ${data.newStock}`);
        setProduct((prev) => prev ? { ...prev, stock: data.newStock } : null);
      }
    };

    socket.on('stock_updated', handleStockUpdate);
    socket.emit('subscribe_to_product', id);

    return () => {
      socket.off('stock_updated', handleStockUpdate);
    };
  }, [socket, id]);

  if (notFoundError) notFound();

  const canAddToCart = selectedSize !== '' && selectedColor !== '' && !loading && product && product.stock > 0;

  const handleAddToCart = () => {
    if (!product || !canAddToCart) return;

    const item: CartItem = {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      size: selectedSize,
      color: selectedColor,
      imageUrl: product.imageUrl,
    };
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (loading) return <ProductSkeleton />;
  if (!product) return null;

  const colorObj = COLORS.find((c) => c.name === selectedColor);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div className="container-us" style={{ padding: '60px 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '48px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>Inicio</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/</span>
          <Link
            href={product.category ? `/hombre` : '/'}
            style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}
          >
            {product.category ?? 'Productos'}
          </Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{product.name}</span>
        </nav>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px',
            alignItems: 'start',
          }}
        >
          {/* ─── IMAGEN ─────────────────────────────────────────────────── */}
          <div>
            <div
              style={{
                aspectRatio: '3/4',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-card)',
                position: 'relative',
              }}
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      background: 'linear-gradient(135deg, #F9F7F4 0%, #EDE9E3 100%)',
                    }}
                  >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" strokeWidth="0.8">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Imagen próximamente
                    </span>
                  </div>
              )}

              {/* Stock badge */}
              {product.stock > 0 && product.stock <= 5 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '6px 14px',
                    background: 'rgba(212,175,122,0.15)',
                    border: '1px solid rgba(212,175,122,0.4)',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-gold)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  ÚLTIMAS {product.stock} UNIDADES
                </div>
              )}
            </div>
          </div>

          {/* ─── DETALLE DEL PRODUCTO ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Categoría */}
            {product.category && (
              <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--accent-silver)', textTransform: 'uppercase' }}>
                {product.category}
              </span>
            )}

            {/* Nombre */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.15,
                marginTop: '-16px',
              }}
            >
              {product.name}
            </h1>

            {/* Precio */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span
                className="text-gold-gradient"
                style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700 }}
              >
                {formatPrice(Number(product.price))}
              </span>
              {product.stock === 0 && (
                <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>Agotado</span>
              )}
            </div>

            {/* Descripción */}
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {product.description}
            </p>

            <div className="divider" />

            {/* ─── SELECCIÓN DE COLOR ─────────────────────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Color
                </span>
                {selectedColor && (
                  <span style={{ fontSize: '13px', color: 'var(--accent-silver)' }}>{selectedColor}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(product.colors || COLORS.map(c => c.name)).map((colorName) => {
                  const colorObj = COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase()) || { name: colorName, hex: '#ccc' };
                  const isSelected = selectedColor === colorObj.name;
                  return (
                    <button
                      key={colorObj.name}
                      id={`color-${colorObj.name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedColor(colorObj.name)}
                      aria-pressed={isSelected}
                      title={colorObj.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: colorObj.hex,
                        border: isSelected
                          ? '3px solid var(--accent-gold)'
                          : '2px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        boxShadow: isSelected ? '0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-gold)' : 'none',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* ─── SELECCIÓN DE TALLA ─────────────────────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Talla
                </span>
                {selectedSize && (
                  <span style={{ fontSize: '13px', color: 'var(--accent-silver)' }}>Seleccionada: {selectedSize}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(product.sizes || SIZES).map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      id={`size-${size.toLowerCase()}`}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={isSelected}
                      style={{
                        minWidth: '52px',
                        height: '48px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                        border: isSelected
                          ? '1px solid var(--accent-gold)'
                          : '1px solid var(--border-subtle)',
                        background: isSelected
                          ? 'rgba(212,175,122,0.12)'
                          : 'var(--bg-glass)',
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        boxShadow: isSelected ? '0 0 12px rgba(212,175,122,0.15)' : 'none',
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── CANTIDAD ───────────────────────────────────────────── */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
                Cantidad
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'var(--bg-elevated)',
                }}
              >
                <button
                  id="quantity-decrement"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'transparent',
                    border: 'none',
                    color: quantity <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '20px',
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 150ms',
                  }}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span
                  style={{
                    width: '56px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderLeft: '1px solid var(--border-subtle)',
                    borderRight: '1px solid var(--border-subtle)',
                  }}
                >
                  {quantity}
                </span>
                <button
                  id="quantity-increment"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={quantity >= (product.stock || 99)}
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'transparent',
                    border: 'none',
                    color: quantity >= (product.stock || 99) ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '20px',
                    cursor: quantity >= (product.stock || 99) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 150ms',
                  }}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <span style={{ display: 'inline-block', marginLeft: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {product.stock} disponibles
              </span>
            </div>

            {/* Validación */}
            {(!selectedSize || !selectedColor) && (
              <p style={{ fontSize: '13px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠</span>
                {!selectedColor && !selectedSize
                  ? 'Selecciona un color y una talla para continuar'
                  : !selectedColor
                  ? 'Selecciona un color para continuar'
                  : 'Selecciona una talla para continuar'}
              </p>
            )}

            {/* ─── BOTÓN AGREGAR ──────────────────────────────────────── */}
            <button
              id="add-to-cart-btn"
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                opacity: canAddToCart ? 1 : 0.4,
                cursor: canAddToCart ? 'pointer' : 'not-allowed',
                background: added ? 'linear-gradient(135deg, #2d7d46, #4caf70)' : undefined,
              }}
            >
              {added ? (
                <>✓ Agregado al carrito</>
              ) : product.stock === 0 ? (
                'Producto agotado'
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  Agregar al carrito — {formatPrice(Number(product.price) * quantity)}
                </>
              )}
            </button>

            {/* Stock info */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: product.stock > 5 ? '#22c55e' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {product.stock > 5
                  ? 'En stock'
                  : product.stock > 0
                  ? `Solo quedan ${product.stock} unidades`
                  : 'Agotado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', marginTop: '80px' }}>
        <div className="container-us" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 UpperSilver</p>
        </div>
      </footer>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '80px 0' }}>
      <div className="container-us" style={{ padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
          <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '16px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="skeleton" style={{ height: '14px', width: '30%' }} />
            <div className="skeleton" style={{ height: '48px', width: '80%' }} />
            <div className="skeleton" style={{ height: '40px', width: '45%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <div className="skeleton" style={{ height: '56px', width: '60%' }} />
            <div className="skeleton" style={{ height: '56px', width: '100%', borderRadius: '8px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
