import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDemoOrders(userId: string, userName: string, userEmail: string) {
  // Verificar si ya existen pedidos demo para este usuario
  const q = query(collection(db, 'orders'), where('userId', '==', userId), where('isDemo', '==', true));
  const snap = await getDocs(q);
  if (!snap.empty) return; // ya sembrados

  const now = Timestamp.now();
  const threeDaysAgo = Timestamp.fromMillis(now.toMillis() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = Timestamp.fromMillis(now.toMillis() - 7 * 24 * 60 * 60 * 1000);

  // Pedido 1 — 3 prendas — Pago confirmado
  await addDoc(collection(db, 'orders'), {
    userId,
    userName,
    userEmail,
    document: '1000000001',
    address: 'Calle 72 # 10-34, Bogotá',
    isDemo: true,
    items: [
      { productId: 'demo-1', name: 'Hoodie Oversize Urbano', price: 189900, quantity: 1, size: 'M', color: 'Negro', imageUrl: '' },
      { productId: 'demo-2', name: 'Pantalón Cargo Premium', price: 229900, quantity: 1, size: '32', color: 'Caqui', imageUrl: '' },
      { productId: 'demo-3', name: 'Camiseta Básica Essential', price: 89900, quantity: 1, size: 'S', color: 'Blanco', imageUrl: '' },
    ],
    total: 509700,
    paymentMethod: 'wompi',
    status: 'Pago confirmado',
    createdAt: threeDaysAgo,
  });

  // Pedido 2 — 10 prendas — En camino
  await addDoc(collection(db, 'orders'), {
    userId,
    userName,
    userEmail,
    document: '1000000001',
    address: 'Carrera 15 # 88-56, Bogotá',
    isDemo: true,
    items: [
      { productId: 'demo-4', name: 'Chaqueta Bomber Silver', price: 379900, quantity: 2, size: 'L', color: 'Plata', imageUrl: '' },
      { productId: 'demo-5', name: 'Sudadera Crew Upper', price: 199900, quantity: 3, size: 'M', color: 'Gris Oscuro', imageUrl: '' },
      { productId: 'demo-6', name: 'Camiseta Graphic Drop', price: 109900, quantity: 2, size: 'M', color: 'Negro', imageUrl: '' },
      { productId: 'demo-7', name: 'Jogger Slim Fit', price: 159900, quantity: 2, size: 'S', color: 'Negro', imageUrl: '' },
      { productId: 'demo-8', name: 'Gorra Snapback US', price: 79900, quantity: 1, size: 'Único', color: 'Blanco/Negro', imageUrl: '' },
    ],
    total: 2108800,
    paymentMethod: 'nequi',
    status: 'En camino',
    createdAt: sevenDaysAgo,
  });
}
