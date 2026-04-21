'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/hombre', label: 'Hombre' },
  { href: '/mujer', label: 'Mujer' },
  { href: '/seguimiento', label: 'Seguimiento' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, userProfile, isAdmin, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-card)' }}>
      <div className="container-us" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '0.08em' }} className="text-gold-gradient">
            UPPER<span style={{ fontWeight: 400, color: 'var(--accent-silver)', WebkitTextFillColor: 'var(--accent-silver)' }}>SILVER</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '8px' }} className="desktop-nav">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em', textDecoration: 'none', color: active ? 'var(--accent-gold)' : 'var(--text-secondary)', background: active ? 'rgba(212,175,122,0.08)' : 'transparent', border: active ? '1px solid rgba(212,175,122,0.2)' : '1px solid transparent', transition: 'all var(--transition-fast)' }}>
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link href="/admin" style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em', textDecoration: 'none', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
              Admin ⚡
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cart */}
          <Link href="/carrito" style={{ textDecoration: 'none', position: 'relative' }}>
            <button id="navbar-cart-button" className="btn-icon" style={{ position: 'relative' }} aria-label="Ver carrito">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--gradient-gold)', color: '#1a1000', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </Link>

          {/* Auth */}
          {!loading && (
            <>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
                  <Link href="/mis-pedidos" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'inline-block', cursor: 'pointer' }}>
                      {userProfile?.displayName?.split(' ')[0] || 'Mi cuenta'}
                    </span>
                  </Link>
                  <button id="navbar-logout" onClick={handleLogout} className="btn-icon" title="Cerrar sesión" style={{ width: '36px', height: '36px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <button id="navbar-login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Entrar</button>
                  </Link>
                  <Link href="/registro" style={{ textDecoration: 'none' }}>
                    <button id="navbar-register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>Registro</button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile toggle */}
          <button className="btn-icon mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú">
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'rgba(255,255,255,0.98)', borderTop: '1px solid var(--border-subtle)', padding: '16px 24px 24px' }} className="animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 16px', borderRadius: '8px', fontSize: '16px', fontWeight: 500, textDecoration: 'none', color: pathname === link.href ? 'var(--accent-gold)' : 'var(--text-secondary)', marginBottom: '4px' }}>
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 16px', borderRadius: '8px', fontSize: '16px', fontWeight: 500, textDecoration: 'none', color: '#dc2626', marginBottom: '4px' }}>Admin ⚡</Link>
          )}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            {user ? (
              <>
                <Link href="/mis-pedidos" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '14px 16px', borderRadius: '8px', fontSize: '15px', textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mis pedidos</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', fontSize: '15px', fontWeight: 500, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', flex: 1 }}><button className="btn-secondary" style={{ width: '100%' }}>Entrar</button></Link>
                <Link href="/registro" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', flex: 1 }}><button className="btn-primary" style={{ width: '100%' }}>Registro</button></Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
