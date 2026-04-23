'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice } from '@/lib/api';
import { useRealtime } from '@/context/RealtimeContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product: initialProduct }: ProductCardProps) {
  const [product, setProduct] = useState(initialProduct);
  const { socket } = useRealtime();

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    if (!socket || !product.id) return;

    const handleStockUpdate = (data: { productId: string; newStock: number }) => {
      if (data.productId === product.id) {
        setProduct((prev) => ({ ...prev, stock: data.newStock }));
      }
    };

    socket.on('stock_updated', handleStockUpdate);

    return () => {
      socket.off('stock_updated', handleStockUpdate);
    };
  }, [socket, product.id]);

  return (
    <Link
      href={`/productos/${product.id}`}
      id={`product-card-${product.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        className="glass-card"
        style={{
          overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Imagen del producto */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '3/4',
            background: 'var(--bg-elevated)',
            overflow: 'hidden',
          }}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
              }}
            />
          ) : (
            /* Placeholder elegante cuando no hay imagen en light mode */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #F9F7F4 0%, #EDE9E3 100%)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Imagen próximamente
              </span>
            </div>
          )}

          {/* Badge de stock bajo */}
          {product.stock === 1 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                background: 'rgba(212,175,122,0.15)',
                border: '1px solid rgba(212,175,122,0.4)',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                letterSpacing: '0.06em',
                backdropFilter: 'blur(8px)',
              }}
            >
              ÚLTIMO EN STOCK
            </div>
          )}

          {product.stock > 1 && product.stock <= 5 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                background: 'rgba(212,175,122,0.15)',
                border: '1px solid rgba(212,175,122,0.4)',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                letterSpacing: '0.06em',
                backdropFilter: 'blur(8px)',
              }}
            >
              ÚLTIMAS UNIDADES
            </div>
          )}

          {/* Badge agotado */}
          {product.stock <= 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              <span
                style={{
                  padding: '8px 20px',
                  background: 'rgba(30,30,30,0.9)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {product.category && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent-silver)',
              }}
            >
              {product.category}
            </span>
          )}

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>

          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <span
              className="text-gold-gradient"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
