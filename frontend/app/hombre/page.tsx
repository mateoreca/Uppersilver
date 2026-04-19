'use client';

import { useState, useEffect } from 'react';
import { Product, MEN_CATEGORIES } from '@/types';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';

/** Catálogo exclusivo de Hombre */
export default function HombrePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [error, setError] = useState(false);

  // Leer categoría inicial desde searchParams
  useEffect(() => {
    searchParams.then((p) => {
      if (p.categoria) setSelectedCategory(p.categoria);
    });
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((all) => {
        // Filtrar: excluir categorías exclusivas de mujer
        const womenOnly = ['vestido', 'blusa', 'falda'];
        const men = all.filter((p) => {
          const cat = (p.category ?? '').toLowerCase();
          return !womenOnly.some((w) => cat.includes(w));
        });
        setProducts(men);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedCategory === 'Todos'
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
        );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ─── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          background: 'linear-gradient(180deg, #F8F7F5 0%, var(--bg-base) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '4px',
            height: '100%',
            background: 'var(--gradient-silver)',
          }}
        />
        <div className="container-us">
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--accent-silver)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            — Colección
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            Hombre
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '480px', lineHeight: 1.6 }}>
            Prendas diseñadas para el hombre que valora la elegancia y la distinción en cada detalle.
          </p>

          {/* Contador de resultados */}
          <div style={{ marginTop: '24px' }}>
            <span className="badge">
              {loading ? '...' : `${filtered.length} productos`}
            </span>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="container-us" style={{ padding: '48px 24px' }}>
        {/* Filtros */}
        <div style={{ marginBottom: '40px' }}>
          <CategoryFilter
            categories={[...MEN_CATEGORIES]}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Estado de carga */}
        {loading && <SkeletonGrid />}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 32px',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ marginBottom: '16px' }}>No se pudo conectar al servidor.</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 32px',
              background: 'var(--bg-glass)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '16px',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '16px' }}>
              No hay productos en esta categoría todavía.
            </p>
            <button className="btn-secondary" onClick={() => setSelectedCategory('Todos')}>
              Ver todos
            </button>
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !error && filtered.length > 0 && (
          <div
            id="products-grid-hombre"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '20px',
            }}
          >
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer simple */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', marginTop: '80px' }}>
        <div className="container-us" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 UpperSilver</p>
        </div>
      </footer>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            <div className="skeleton" style={{ height: '18px', width: '80%' }} />
            <div className="skeleton" style={{ height: '14px', width: '65%' }} />
            <div className="skeleton" style={{ height: '22px', width: '45%', marginTop: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
