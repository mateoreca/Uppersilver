'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, totalAmount, onSuccess }: CheckoutModalProps) {
  const { user, userProfile } = useAuth();
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'mercadopago' | 'pse' | 'nequi' | ''>('');
  const [loading, setLoading] = useState(false);
  const [subStep, setSubStep] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    email: user?.email || '',
    document: '',
    address: '',
  });

  const [cardData, setCardData] = useState({ number: '', exp: '', cvc: '', name: '' });
  const [pseBank, setPseBank] = useState('');
  const [nequiPhone, setNequiPhone] = useState('');

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.document && formData.address) {
      setStep(2);
      setSubStep(0);
      setPaymentMethod('');
    }
  };

  const saveOrderToFirestore = async () => {
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    setTotalItems(qty);

    const orderData = {
      userId: user?.uid || 'guest',
      userName: formData.name,
      userEmail: formData.email,
      document: formData.document,
      address: formData.address,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        imageUrl: i.imageUrl,
      })),
      total: totalAmount,
      paymentMethod,
      status: 'Pago confirmado',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  };

  const processMockPayment = async () => {
    setLoading(true);
    try {
      const id = await saveOrderToFirestore();
      setOrderId(id);
      setLoading(false);
      setStep(3);
      onSuccess();
      clearCart();
    } catch (err) {
      console.error('Error guardando pedido:', err);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSubStep(0);
      setPaymentMethod('');
      setOrderId('');
    }, 400);
  };

  const goToOrders = () => {
    handleClose();
    router.push('/seguimiento?id=' + orderId);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '24px', overflowY: 'auto' }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: step === 3 ? '480px' : paymentMethod ? '600px' : '500px', maxHeight: '90vh', minHeight: '500px', overflowY: 'auto', background: 'var(--bg-base)', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', transition: 'max-width 0.3s ease', border: '1px solid var(--border-card)' }}>

        {/* ── PASO 3: ÉXITO ── */}
        {step === 3 ? (
          <div style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0' }}>
            {/* Checkmark animado */}
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ¡Pago Confirmado!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6 }}>
              Tu pedido fue procesado exitosamente.<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Pedido #{orderId.slice(-8).toUpperCase()}</span>
            </p>

            {/* Info cards */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(34,197,94,0.07)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estado</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 700, fontSize: '14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  Pago confirmado
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Prendas</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{totalItems} artículos</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total pagado</span>
                <span className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>{formatPrice(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Envío a</span>
                <span style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)', maxWidth: '55%', textAlign: 'right' }}>{formData.address}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button onClick={goToOrders} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px' }}>
                Hacer seguimiento del pedido
              </button>
              <button onClick={handleClose} style={{ width: '100%', padding: '14px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                Seguir comprando
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {step === 1 ? 'Datos de Envío' : subStep > 0 ? 'Pago Seguro' : 'Método de Pago'}
              </h2>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Total */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Total a pagar</p>
                <div className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700 }}>
                  {formatPrice(totalAmount)}
                </div>
              </div>

              {step === 1 ? (
                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { id: 'co-name', label: 'Nombre completo', key: 'name', type: 'text', placeholder: 'Daniel Gómez' },
                    { id: 'co-email', label: 'Correo electrónico', key: 'email', type: 'email', placeholder: 'tu@correo.com' },
                    { id: 'co-doc', label: 'Cédula de ciudadanía', key: 'document', type: 'text', placeholder: '1234567890' },
                    { id: 'co-address', label: 'Dirección de envío', key: 'address', type: 'text', placeholder: 'Calle 123 # 45-67, Bogotá' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>{f.label}</label>
                      <input
                        id={f.id} type={f.type} required
                        value={formData[f.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none', fontSize: '14px' }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--accent-gold)')}
                        onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    </div>
                  ))}
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px', marginTop: '8px' }}>
                    Continuar al pago
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {subStep === 0 && (
                    <>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '20px' }}>Selecciona tu método de pago:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
                        {[
                          { key: 'wompi', label: 'Tarjeta de Crédito', sub: 'Procesado por Wompi', bg: '#002B49', icon: 'WP', accentColor: 'var(--accent-gold)' },
                          { key: 'mercadopago', label: 'Mercado Pago', sub: 'Cuenta o Wallet', bg: '#009EE3', icon: 'MP', accentColor: '#009EE3' },
                          { key: 'pse', label: 'Transferencia PSE', sub: 'Débito bancario', bg: '#0055ff', icon: 'PSE', accentColor: '#0055ff' },
                          { key: 'nequi', label: 'Nequi', sub: 'Paga desde tu celular', bg: 'linear-gradient(135deg,#FF0092,#B80080)', icon: 'N', accentColor: '#DA0081' },
                        ].map((m) => (
                          <button
                            key={m.key}
                            onClick={() => { setPaymentMethod(m.key as typeof paymentMethod); setSubStep(1); }}
                            style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = m.accentColor)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                          >
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>{m.icon}</div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{m.label}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>{m.sub}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '28px' }}>
                        <button onClick={() => setStep(1)} style={{ padding: '14px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, width: '100%' }}>
                          ← Volver a los datos
                        </button>
                      </div>
                    </>
                  )}

                  {/* WOMPI */}
                  {subStep === 1 && paymentMethod === 'wompi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#F8F9FA', margin: '-32px -24px', padding: '32px 24px', flex: 1, color: '#222', borderRadius: '0 0 20px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#002B49', fontWeight: 700, fontSize: '20px' }}><span style={{ color: '#004DE3' }}>Wom</span>pi</h3>
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>{formatPrice(totalAmount)}</span>
                      </div>
                      <div style={{ background: '#FFF', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: '#444' }}>Información de tarjeta</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input type="text" placeholder="Número de tarjeta (Ej: 4111 1111 1111 1111)" value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#000' }} />
                          <input type="text" placeholder="Nombre en la tarjeta" value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#000' }} />
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <input type="text" placeholder="MM/AA" value={cardData.exp} onChange={e => setCardData({ ...cardData, exp: e.target.value })} style={{ width: '50%', padding: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#000' }} />
                            <input type="text" placeholder="CVC" value={cardData.cvc} onChange={e => setCardData({ ...cardData, cvc: e.target.value })} style={{ width: '50%', padding: '13px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', color: '#000' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setSubStep(0)} style={{ padding: '14px 20px', background: '#FFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#555', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                        <button onClick={processMockPayment} disabled={loading} style={{ flex: 1, padding: '14px', background: '#002B49', border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loading ? <div className="spinner-mini" /> : 'Pagar ahora'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MERCADO PAGO */}
                  {subStep === 1 && paymentMethod === 'mercadopago' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFF', margin: '-32px -24px', padding: '32px 24px', flex: 1, color: '#333', borderRadius: '0 0 20px 20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#009EE3', fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>mercado pago</div>
                        <p style={{ color: '#888', fontSize: '13px' }}>Confirma el pago con tu cuenta</p>
                      </div>
                      <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Estás pagando en <strong>UpperSilver Store</strong></p>
                        <div style={{ fontSize: '30px', fontWeight: 700, color: '#333' }}>{formatPrice(totalAmount)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setSubStep(0)} style={{ padding: '14px 20px', background: '#FFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#009EE3', cursor: 'pointer', fontWeight: 600 }}>Volver</button>
                        <button onClick={processMockPayment} disabled={loading} style={{ flex: 1, padding: '14px', background: '#009EE3', border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loading ? <div className="spinner-mini" /> : 'Confirmar pago'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PSE */}
                  {subStep === 1 && paymentMethod === 'pse' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFF', margin: '-32px -24px', padding: '32px 24px', flex: 1, color: '#333', borderRadius: '0 0 20px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #EEE', paddingBottom: '16px' }}>
                        <div style={{ background: '#0055ff', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>PSE</div>
                        <h3 style={{ margin: 0, fontWeight: 600, fontSize: '17px' }}>Pago PSE</h3>
                      </div>
                      <select value={pseBank} onChange={e => setPseBank(e.target.value)} style={{ width: '100%', padding: '13px', borderRadius: '8px', border: '1px solid #CCC', background: '#FFF', color: '#333', fontSize: '14px' }}>
                        <option value="">Selecciona tu banco</option>
                        {['Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco de Occidente', 'Nequi', 'DaviPlata'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                        <button onClick={() => setSubStep(0)} style={{ padding: '14px 20px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                        <button onClick={processMockPayment} disabled={loading || !pseBank} style={{ flex: 1, padding: '14px', background: '#0055ff', border: 'none', borderRadius: '8px', color: '#FFF', cursor: (!pseBank || loading) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (!pseBank || loading) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loading ? <div className="spinner-mini" style={{ borderTopColor: '#fff' }} /> : 'Ir al banco →'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NEQUI */}
                  {subStep === 1 && paymentMethod === 'nequi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFF', margin: '-32px -24px', padding: '32px 24px', flex: 1, color: '#333', borderRadius: '0 0 20px 20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#DA0081', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#fff', fontSize: '26px', fontStyle: 'italic', fontWeight: 'bold' }}>N</div>
                        <h3 style={{ margin: 0, color: '#DA0081', fontWeight: 700, fontSize: '20px' }}>Paga con Nequi</h3>
                      </div>
                      <input type="tel" placeholder="300 000 0000" value={nequiPhone} onChange={e => setNequiPhone(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #E5E5E5', fontSize: '18px', textAlign: 'center', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                        <button onClick={() => setSubStep(0)} style={{ padding: '14px 20px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 500 }}>Regresar</button>
                        <button onClick={processMockPayment} disabled={loading || nequiPhone.length < 10} style={{ flex: 1, padding: '14px', background: '#DA0081', border: 'none', borderRadius: '8px', color: '#FFF', cursor: (nequiPhone.length < 10 || loading) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (nequiPhone.length < 10 || loading) ? 0.5 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {loading ? <div className="spinner-mini" /> : 'Enviar notificación'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .spinner-mini { width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-radius:50%;border-top-color:#fff;animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes popIn { from { transform:scale(0.5);opacity:0; } to { transform:scale(1);opacity:1; } }
      `}</style>
    </div>
  );
}
