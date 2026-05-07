'use client';

import { useAuth } from '@/context/AuthContext';

export default function MisPedidosPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '100px 24px', textAlign: 'center' }}>
      <h1>Mis Pedidos</h1>
      <p>Hola {user?.firstName}, pronto podrás ver aquí tu historial de pedidos desde nuestra nueva base de datos.</p>
    </div>
  );
}
