'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, totalAmount, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Datos, 2: Pago
  const [paymentMethod, setPaymentMethod] = useState<'pse' | 'paypal' | ''>('');
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
  });

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.document) {
      setStep(2);
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) return;
    setLoading(true);
    // Simulate API call and redirect
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(8px)',
        padding: '24px',
      }}
    >
      <div
        className="glass-card animate-fade-up"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--bg-base)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Completar Pago
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Total header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Total a pagar
            </p>
            <div className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 700 }}>
              {formatPrice(totalAmount)}
            </div>
          </div>

          {step === 1 ? (
            <form id="checkout-form" onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Ej: Laura Gómez"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Cédula de ciudadanía
                </label>
                <input
                  type="text"
                  required
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Documento requerido para PSE"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', marginTop: '16px' }}>
                Continuar al pago
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>Selecciona un método de pago:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Botón PSE */}
                <button
                  onClick={() => setPaymentMethod('pse')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: paymentMethod === 'pse' ? '2px solid var(--accent-gold)' : '2px solid var(--border-subtle)',
                    background: paymentMethod === 'pse' ? 'rgba(212,175,122,0.05)' : 'var(--bg-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#0055ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                      PSE
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textAlign: 'left' }}>PSE / Tarjeta</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, textAlign: 'left' }}>A través de Mercado Pago</p>
                    </div>
                  </div>
                  {paymentMethod === 'pse' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>

                {/* Botón PayPal */}
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: paymentMethod === 'paypal' ? '2px solid var(--accent-gold)' : '2px solid var(--border-subtle)',
                    background: paymentMethod === 'paypal' ? 'rgba(212,175,122,0.05)' : 'var(--bg-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0079C1', fontWeight: 700, fontSize: '14px', fontStyle: 'italic' }}>
                      <span style={{ color: '#fff' }}>Pay</span><span style={{ color: '#0079C1' }}>Pal</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, textAlign: 'left' }}>PayPal</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, textAlign: 'left' }}>Pago internacional</p>
                    </div>
                  </div>
                  {paymentMethod === 'paypal' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ padding: '16px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}
                >
                  ← Atrás
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!paymentMethod || loading}
                  className="btn-primary"
                  style={{ flex: 1, padding: '16px', opacity: (!paymentMethod || loading) ? 0.5 : 1, cursor: (!paymentMethod || loading) ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Procesando...' : `Confirmar pago con ${paymentMethod === 'pse' ? 'PSE' : paymentMethod === 'paypal' ? 'PayPal' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
