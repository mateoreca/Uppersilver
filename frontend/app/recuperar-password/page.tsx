'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RecuperarPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch {
      setError('No encontramos una cuenta con ese correo. Verifica e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, letterSpacing: '0.08em' }} className="text-gold-gradient">
              UPPER<span style={{ fontWeight: 400, color: 'var(--accent-silver)', WebkitTextFillColor: 'var(--accent-silver)' }}>SILVER</span>
            </span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>
            Recuperar contraseña
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <div className="glass-card" style={{ padding: '36px', borderRadius: '16px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(184,146,42,0.1)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--accent-gold)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                ¡Correo enviado!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones.
              </p>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                  Volver al inicio de sesión
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Correo electrónico
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <button
                id="reset-submit"
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link href="/login" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
