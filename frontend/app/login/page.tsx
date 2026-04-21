'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch {
      setError('Correo o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, letterSpacing: '0.08em' }} className="text-gold-gradient">
              UPPER<span style={{ fontWeight: 400, color: 'var(--accent-silver)', WebkitTextFillColor: 'var(--accent-silver)' }}>SILVER</span>
            </span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '8px' }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Inicia sesión para ver tus pedidos y continuar comprando
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px', borderRadius: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Contraseña
                </label>
                <Link href="/recuperar-password" style={{ fontSize: '12px', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s' }}
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
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '15px', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              ¿No tienes cuenta?{' '}
              <Link href="/registro" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
