'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/api';

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setOrderId(idParam);
      fetchOrder(idParam);
    }
  }, [searchParams]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/orders/${id}`);
      if (!res.ok) throw new Error('No encontrado');
      const data = await res.json();
      
      setTrackingInfo({
        id: data.id,
        status: data.status,
        date: new Date(data.createdAt).toLocaleDateString(),
        courier: 'Coordinadora',
        items: [{ name: 'Producto', quantity: data.quantity, price: 0 }], // Simplificado para el ejemplo
        total: 0,
        history: [{ desc: 'Pedido recibido', time: '10:00 AM', date: 'Hoy' }]
      });
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-us" style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '24px' }}>Rastrear mi pedido</h2>
      <input 
        value={orderId} 
        onChange={e => setOrderId(e.target.value)} 
        placeholder="ID de pedido" 
        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginRight: '10px' }} 
      />
      <button onClick={() => fetchOrder(orderId)} className="btn-primary" style={{ padding: '12px 24px' }}>Buscar</button>

      {trackingInfo && (
        <div style={{ marginTop: '40px', background: 'var(--bg-elevated)', padding: '24px', borderRadius: '16px' }}>
          <h3>Estado: {trackingInfo.status}</h3>
          <p>ID: #{trackingInfo.id.slice(0,8)}</p>
        </div>
      )}
      {error && <p style={{ color: 'red', marginTop: '20px' }}>No encontramos ese pedido.</p>}
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SeguimientoContent />
    </Suspense>
  );
}
