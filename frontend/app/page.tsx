import Link from 'next/link';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { MEN_CATEGORIES, WOMEN_CATEGORIES } from '@/types';

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    // Si el backend no está disponible, se muestran productos vacíos
  }

  // Separar por género de forma simple basada en categorías
  const womenCats = WOMEN_CATEGORIES.map((c) => c.toLowerCase());
  const menProducts = products.filter((p) => {
    const cat = (p.category ?? '').toLowerCase();
    return !womenCats.some((wc) => cat.includes(wc.toLowerCase()));
  });
  const womenProducts = products.filter((p) => {
    const cat = (p.category ?? '').toLowerCase();
    return womenCats.some((wc) => cat.includes(wc.toLowerCase()));
  });

  // Si no hay productos del backend, usar ambos como showcase
  const featuredMen =    (menProducts.length > 0 ? menProducts : products).slice(0, 4);
  const featuredWomen = (womenProducts.length > 0 ? womenProducts : products).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--gradient-hero)',
        }}
      >
        {/* Orbs decorativos */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,122,0.08) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192,192,192,0.06) 0%, transparent 70%)',
            bottom: '-80px',
            left: '-80px',
            pointerEvents: 'none',
          }}
        />
        {/* Grid background sutil */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(192,192,192,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(192,192,192,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container-us animate-fade-up"
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '80px 24px' }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 20px',
              background: 'rgba(212,175,122,0.08)',
              border: '1px solid rgba(212,175,122,0.2)',
              borderRadius: '100px',
              marginBottom: '32px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
              Nueva Colección 2026
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            Estilo que{' '}
            <span className="text-gold-gradient">define</span>
            <br />
            tu esencia
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-secondary)',
              maxWidth: '520px',
              margin: '0 auto 48px',
              lineHeight: 1.7,
            }}
          >
            Descubre prendas de alta costura diseñadas para quienes viven con elegancia. Colecciones exclusivas para hombre y mujer.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/hombre" style={{ textDecoration: 'none' }}>
              <button id="hero-btn-hombre" className="btn-primary" style={{ fontSize: '15px', padding: '14px 36px' }}>
                Colección Hombre
              </button>
            </Link>
            <Link href="/mujer" style={{ textDecoration: 'none' }}>
              <button id="hero-btn-mujer" className="btn-secondary" style={{ fontSize: '15px', padding: '14px 36px' }}>
                Colección Mujer
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              justifyContent: 'center',
              marginTop: '80px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '+200', label: 'Prendas exclusivas' },
              { value: '2', label: 'Géneros' },
              { value: '100%', label: 'Calidad Premium' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div className="text-silver-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>Descubrir</span>
          <div
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, var(--accent-gold), transparent)',
              animation: 'fadeUp 1.5s ease infinite alternate',
            }}
          />
        </div>
      </section>

      {/* ─── CATEGORÍAS (HOMBRE) ──────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'var(--bg-base)' }}>
        <div className="container-us">
          {/* Header sección */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--accent-silver)', textTransform: 'uppercase', marginBottom: '8px' }}>
                — Colección Hombre
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Para el hombre de hoy
              </h2>
            </div>
            <Link href="/hombre" style={{ textDecoration: 'none' }}>
              <button id="home-ver-todos-hombre" className="btn-secondary">
                Ver todo →
              </button>
            </Link>
          </div>

          {/* Categorías hombre */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '48px',
            }}
          >
            {MEN_CATEGORIES.map((cat) => (
              <Link key={cat} href={`/hombre?categoria=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
                <div
                  className="glass-card"
                  style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                    {cat}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured men products */}
          {featuredMen.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredMen.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <NoProductsPlaceholder label="hombre" href="/hombre" />
          )}
        </div>
      </section>

      {/* ─── DIVIDER ──────────────────────────────────────────────────────── */}
      <div className="container-us">
        <div className="divider" />
      </div>

      {/* ─── CATEGORÍAS (MUJER) ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'var(--bg-base)' }}>
        <div className="container-us">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '8px' }}>
                — Colección Mujer
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Elegancia sin límites
              </h2>
            </div>
            <Link href="/mujer" style={{ textDecoration: 'none' }}>
              <button id="home-ver-todos-mujer" className="btn-secondary">
                Ver todo →
              </button>
            </Link>
          </div>

          {/* Categorías mujer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '48px',
            }}
          >
            {WOMEN_CATEGORIES.map((cat) => (
              <Link key={cat} href={`/mujer?categoria=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
                <div
                  className="glass-card"
                  style={{
                    padding: '20px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                    {cat}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured women products */}
          {featuredWomen.length > 0 && !(menProducts.length === 0 && womenProducts.length === 0) ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              {featuredWomen.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <NoProductsPlaceholder label="mujer" href="/mujer" />
          )}
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '48px 0',
          background: 'var(--bg-surface)',
        }}
      >
        <div className="container-us" style={{ textAlign: 'center' }}>
          <span className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '0.08em' }}>
            UPPERSILVER
          </span>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '16px' }}>
            © 2026 UpperSilver. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function NoProductsPlaceholder({ label, href }: { label: string; href: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '80px 32px',
        background: 'var(--bg-glass)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: '16px',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-subtle)" strokeWidth="1" style={{ margin: '0 auto 16px', display: 'block' }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
        Próximamente productos para {label}
      </p>
      <Link href={href} style={{ textDecoration: 'none' }}>
        <button className="btn-secondary">Explorar colección</button>
      </Link>
    </div>
  );
}
