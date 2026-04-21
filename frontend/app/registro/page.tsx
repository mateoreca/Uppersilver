'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegistroPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. ¿Quieres iniciar sesión?');
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.');
      }
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
            Crea tu cuenta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Únete a UpperSilver y vive la experiencia premium
          </p>
        </div>

        <div className="glass-card" style={{ padding: '36px', borderRadius: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              { id: 'reg-name', label: 'Nombre completo', type: 'text', key: 'name', placeholder: 'Daniel Gómez' },
              { id: 'reg-email', label: 'Correo electrónico', type: 'email', key: 'email', placeholder: 'tu@correo.com' },
              { id: 'reg-password', label: 'Contraseña', type: 'password', key: 'password', placeholder: 'Mínimo 6 caracteres' },
              { id: 'reg-confirm', label: 'Confirmar contraseña', type: 'password', key: 'confirm', placeholder: 'Repite tu contraseña' },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  required
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '15px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
              </div>
            ))}

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button
              id="registro-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '15px', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }}>
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
