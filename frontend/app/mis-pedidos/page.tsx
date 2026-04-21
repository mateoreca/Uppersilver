'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { seedDemoOrders } from '@/lib/seedOrders';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatPrice } from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

interface Order {
  id: string;
  createdAt: { seconds: number };
  status: string;
  total: number;
  items: OrderItem[];
  address: string;
  paymentMethod: string;
  isDemo?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; step: number; icon: string }> = {
  'Pago confirmado':   { bg: 'rgba(34,197,94,0.1)',   text: '#16a34a', dot: '#22c55e', step: 1, icon: '✓' },
  'Procesando pedido': { bg: 'rgba(234,179,8,0.1)',    text: '#a16207', dot: '#eab308', step: 2, icon: '⚙' },
  'Preparando envío':  { bg: 'rgba(59,130,246,0.1)',   text: '#1d4ed8', dot: '#3b82f6', step: 3, icon: '📦' },
  'En camino':         { bg: 'rgba(168,85,247,0.1)',   text: '#7e22ce', dot: '#a855f7', step: 4, icon: '🚚' },
  'Entregado':         { bg: 'rgba(16,185,129,0.15)',  text: '#065f46', dot: '#10b981', step: 5, icon: '🏠' },
  'Cancelado':         { bg: 'rgba(239,68,68,0.1)',    text: '#dc2626', dot: '#ef4444', step: 0, icon: '✕' },
};

const STEPS = ['Pago confirmado', 'Procesando pedido', 'Preparando envío', 'En camino', 'Entregado'];

const PAYMENT_LABELS: Record<string, string> = {
  wompi: 'Tarjeta (Wompi)',
  mercadopago: 'Mercado Pago',
  pse: 'PSE',
  nequi: 'Nequi',
};

export default function MisPedidosPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !userProfile) return;

    const fetchOrders = async () => {
      try {
        // Sembrar pedidos demo si es la primera vez
        await seedDemoOrders(user.uid, userProfile.displayName, user.email || '');

        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        // Ordenar en cliente por fecha desc (evita índice compuesto en Firestore)
        fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(fetched);
      } catch (e) {
        console.error('Error:', e);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user, userProfile]);

  if (loading || !user) return null;

  const totalGastado = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalPrendas = orders.reduce((s, o) => s + (o.items?.reduce((si, i) => si + i.quantity, 0) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Hero header */}
      <div style={{ padding: '64px 0 48px', background: 'linear-gradient(160deg,#f8f6f2 0%,var(--bg-base) 100%)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container-us">
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Mi cuenta</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.1 }}>
            Mis Pedidos
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
            Hola, <strong>{userProfile?.displayName}</strong> — aquí está tu historial de compras.
          </p>

          {/* Stats */}
          {!ordersLoading && orders.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Pedidos', value: orders.length },
                { label: 'Prendas', value: totalPrendas },
                { label: 'Total invertido', value: formatPrice(totalGastado) },
              ].map(s => (
                <div key={s.label} style={{ padding: '16px 24px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)', minWidth: '120px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{s.label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-us" style={{ padding: '48px 24px' }}>
        {ordersLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--text-muted)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)', marginBottom: '12px' }}>Aún no tienes pedidos</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Explora nuestra colección y haz tu primera compra.</p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '14px 32px' }}>Explorar colección</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, idx) => {
              const statusCfg = STATUS_CONFIG[order.status] || { bg: 'var(--bg-elevated)', text: 'var(--text-secondary)', dot: 'var(--text-muted)', step: 0, icon: '?' };
              const date = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
              const isExpanded = expanded === order.id;
              const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

              return (
                <div key={order.id} className="glass-card animate-fade-up" style={{ padding: '0', animationDelay: `${idx * 70}ms`, animationFillMode: 'both', overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                          Pedido #{order.id.slice(-8).toUpperCase()}
                          {order.isDemo && <span style={{ marginLeft: '8px', background: 'rgba(168,85,247,0.1)', color: '#7e22ce', padding: '2px 8px', borderRadius: '100px', fontSize: '10px' }}>DEMO</span>}
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{date} · {itemCount} {itemCount === 1 ? 'prenda' : 'prendas'}</p>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusCfg.bg, color: statusCfg.text, padding: '7px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 700 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusCfg.dot, display: 'inline-block', boxShadow: `0 0 6px ${statusCfg.dot}` }} />
                        {order.status}
                      </span>
                    </div>

                    {/* Progress bar (solo si no está cancelado) */}
                    {order.status !== 'Cancelado' && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          {STEPS.map((s, i) => {
                            const isActive = i < statusCfg.step;
                            const isCurrent = i + 1 === statusCfg.step;
                            return (
                              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isActive || isCurrent ? statusCfg.dot : 'var(--bg-surface)', border: `2px solid ${isActive || isCurrent ? statusCfg.dot : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: isActive || isCurrent ? '#fff' : 'var(--text-muted)', fontWeight: 700, marginBottom: '6px', transition: 'all 0.3s', boxShadow: isCurrent ? `0 0 12px ${statusCfg.dot}60` : 'none' }}>
                                  {isActive || isCurrent ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '9px', color: isActive || isCurrent ? statusCfg.text : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3, fontWeight: isCurrent ? 700 : 400, display: 'none' }}>{s}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-surface)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(statusCfg.step / STEPS.length) * 100}%`, background: statusCfg.dot, borderRadius: '100px', transition: 'width 0.8s ease', boxShadow: `0 0 8px ${statusCfg.dot}80` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Confirmado</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Entregado</span>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>📍 {order.address}</span>
                        <span>💳 {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod?.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
                          {formatPrice(order.total)}
                        </span>
                        <button
                          onClick={() => setExpanded(isExpanded ? null : order.id)}
                          style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: 500 }}
                        >
                          {isExpanded ? 'Ocultar' : 'Ver prendas'} {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prendas expandidas */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 24px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-base)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👕</div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{item.name}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Talla {item.size} · {item.color} · ×{item.quantity}</p>
                            </div>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
