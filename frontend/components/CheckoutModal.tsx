'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice, createOrder } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, totalAmount, onSuccess }: CheckoutModalProps) {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'mercadopago' | 'pse' | 'nequi' | ''>('');
  const [loading, setLoading] = useState(false);
  const [subStep, setSubStep] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
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
    }
  };

  const processOrder = async () => {
    setLoading(true);
    try {
      const qty = items.reduce((s, i) => s + i.quantity, 0);
      setTotalItems(qty);

      // Enviar pedido al Backend de Railway
      const order = await createOrder({
        customerEmail: formData.email,
        productId: items[0]?.productId, // Asumiendo 1 producto por ahora según el backend actual
        quantity: items[0]?.quantity,
        address: formData.address,
        paymentMethod,
        status: 'Pago confirmado',
      });

      setOrderId(order.id);
      setLoading(false);
      setStep(3);
      onSuccess();
      clearCart();
    } catch (err) {
      console.error('Error procesando pedido:', err);
      alert('Error al procesar el pedido. Intenta de nuevo.');
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '24px', overflowY: 'auto' }}>
       {/* El diseño visual se mantiene igual, solo cambia la lógica de processOrder */}
       <div className="animate-fade-up" style={{ width: '100%', maxWidth: step === 3 ? '480px' : '500px', background: 'var(--bg-base)', borderRadius: '20px', padding: '32px', border: '1px solid var(--border-card)' }}>
          {step === 1 && (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <h2 style={{ marginBottom: '24px' }}>Datos de Envío</h2>
               <input placeholder="Nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} required />
               <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} required />
               <input placeholder="Cédula" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} required />
               <input placeholder="Dirección" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} required />
               <button type="submit" className="btn-primary" style={{ padding: '16px' }}>Continuar al pago</button>
            </form>
          )}

          {step === 2 && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <h2>Método de Pago</h2>
               <p>Total: {formatPrice(totalAmount)}</p>
               <button onClick={() => {setPaymentMethod('pse'); processOrder();}} disabled={loading} style={{ padding: '16px', borderRadius: '10px' }}>
                 {loading ? 'Procesando...' : 'Pagar con PSE / Transferencia'}
               </button>
               <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>Volver</button>
             </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
               <h2>¡Pedido Confirmado!</h2>
               <p>ID: #{orderId.slice(0,8)}</p>
               <button onClick={handleClose} className="btn-primary" style={{ marginTop: '24px', width: '100%', padding: '16px' }}>Cerrar</button>
            </div>
          )}
       </div>
    </div>
  );
}
