'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { formatPrice } from '@/lib/api';

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  address: string;
  total: number;
  status: string;
  paymentMethod: string;
  items: { name: string; quantity: number; size: string; color: string }[];
  createdAt?: { seconds: number };
}

interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt?: { seconds: number };
}

const STATUSES = ['Pago confirmado', 'Procesando pedido', 'Preparando envío', 'En camino', 'Entregado', 'Cancelado'];

const STATUS_COLORS: Record<string, string> = {
  'Pago confirmado':   '#16a34a',
  'Procesando pedido': '#a16207',
  'Preparando envío':  '#1d4ed8',
  'En camino':         '#7e22ce',
  'Entregado':         '#065f46',
  'Cancelado':         '#dc2626',
};

export default function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'pedidos' | 'usuarios'>('pedidos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !isAdmin) router.push('/');
  }, [isAdmin, loading, user, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Orders
        const oSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        // Users
        const uSnap = await getDocs(collection(db, 'users'));
        setUsers(uSnap.docs.map(d => ({ ...d.data() } as UserDoc)));
      } catch (e) {
        console.error('Error fetching admin data:', e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !isAdmin) return null;

  const totalRevenue = orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0' }}>
        <div className="container-us" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
              UPPER<span style={{ color: '#B8922A' }}>SILVER</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span style={{ color: '#B8922A', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Panel</span>
          </div>
          <Link href="/" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            ← Volver a la tienda
          </Link>
        </div>
      </div>

      <div className="container-us" style={{ padding: '40px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {[
            { label: 'Total Pedidos', value: orders.length, icon: '📦' },
            { label: 'Ingresos totales', value: formatPrice(totalRevenue), icon: '💰' },
            { label: 'Usuarios registrados', value: users.length, icon: '👤' },
            { label: 'Pendientes', value: orders.filter(o => o.status === 'Pago confirmado' || o.status === 'Procesando pedido').length, icon: '⏳' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '28px' }}>
          {(['pedidos', 'usuarios'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? 'var(--shadow-card)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t === 'pedidos' ? `📦 Pedidos (${orders.length})` : `👤 Usuarios (${users.length})`}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
          </div>
        ) : tab === 'pedidos' ? (
          // ── PEDIDOS TAB ──────────────────────────────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No hay pedidos todavía.</p>}
            {orders.map((order) => {
              const date = order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
              const statusColor = STATUS_COLORS[order.status] || '#555';
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>#{order.id.slice(-8).toUpperCase()}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor, background: `${statusColor}15`, padding: '3px 10px', borderRadius: '100px' }}>
                          {order.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        👤 <strong>{order.userName}</strong> · {order.userEmail}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        📍 {order.address} · 💳 {order.paymentMethod?.toUpperCase()}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {order.items?.slice(0, 3).map((item, i) => (
                          <span key={i} style={{ fontSize: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '3px 10px', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                            {item.name} ×{item.quantity}
                          </span>
                        ))}
                        {order.items?.length > 3 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+{order.items.length - 3} más</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <span className="text-gold-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                        {formatPrice(order.total)}
                      </span>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: '#fff', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{updatingId === order.id ? '...' : s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // ── USUARIOS TAB ─────────────────────────────────────────────────────
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No hay usuarios registrados.</p>}
            {users.map((u) => {
              const date = u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString('es-CO') : '—';
              const userOrders = orders.filter(o => o.userEmail === u.email);
              return (
                <div key={u.uid} style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: 'var(--shadow-card)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                    {u.displayName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{u.displayName}</span>
                      {u.role === 'admin' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: 'rgba(220,38,38,0.1)', padding: '2px 8px', borderRadius: '4px' }}>ADMIN</span>}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Registrado: {date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{userOrders.length}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>pedido{userOrders.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
