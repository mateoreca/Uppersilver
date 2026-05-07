'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getUsers, getProducts, updateProductStock, updateOrderStatus, formatPrice } from '@/lib/api';

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

  const [tab, setTab] = useState<'pedidos' | 'usuarios' | 'productos'>('pedidos');
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !isAdmin) router.push('/');
  }, [isAdmin, loading, user, router]);

  const fetchData = async () => {
    if (!isAdmin) return;
    setDataLoading(true);
    try {
      const [oData, uData, pData] = await Promise.all([
        getOrders(),
        getUsers(),
        getProducts()
      ]);
      setOrders(oData);
      setUsers(uData);
      setProducts(pData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    try {
      await updateProductStock(productId, newStock);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    } catch (e) {
      alert('Error al actualizar stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      alert('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !isAdmin) return null;

  const totalRevenue = orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)' }}>
      {/* Header (Mismo diseño premium) */}
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
            { label: 'Pendientes', value: orders.filter(o => o.status === 'pending' || o.status === 'paid').length, icon: '⏳' },
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
          {(['pedidos', 'productos', 'usuarios'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', background: tab === t ? '#fff' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t ? '#fff' : 'none', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t === 'pedidos' ? `📦 Pedidos` : t === 'productos' ? `🛍️ Productos` : `👤 Usuarios`}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
          </div>
        ) : tab === 'pedidos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Pedido #{order.id.slice(0,8)}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{order.customerEmail}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: <span style={{color: STATUS_COLORS[order.status] || '#555'}}>{order.status}</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      style={{ padding: '6px', borderRadius: '6px' }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'productos' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map((product) => (
              <div key={product.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 600 }}>{product.name}</div>
                   <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stock actual: {product.stock}</div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <button onClick={() => handleUpdateStock(product.id, product.stock - 1)} disabled={updatingId === product.id || product.stock <= 0}>−</button>
                   <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 700 }}>{product.stock}</span>
                   <button onClick={() => handleUpdateStock(product.id, product.stock + 1)} disabled={updatingId === product.id}>+</button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: u.role === 'admin' ? '#dc2626' : 'var(--text-muted)' }}>
                  {u.role.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
