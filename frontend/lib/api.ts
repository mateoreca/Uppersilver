import { Product } from '@/types';
import { ALL_MOCK_PRODUCTS } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/** Obtiene todos los productos del backend */
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      next: { revalidate: 0 }, // Disable cache for admin/realtime accuracy
    });

    if (!res.ok) throw new Error(`Error al obtener productos: ${res.status}`);
    return res.json();
  } catch (error) {
    console.warn('Backend unavailable, falling back to mock data');
    return ALL_MOCK_PRODUCTS;
  }
}

/** Obtiene un producto por ID */
export async function getProductById(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Producto #${id} no encontrado`);
  return res.json();
}

/** Reduce el stock de un producto (compra) */
export async function reduceStock(productId: string, quantity: number): Promise<void> {
  await fetch(`${API_BASE_URL}/products/${productId}/reduce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

/** Actualiza el stock de un producto (Admin) */
export async function updateProductStock(productId: string, stock: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock }),
  });
  if (!res.ok) throw new Error('Error al actualizar stock');
}

/** Obtiene todos los pedidos (Admin) */
export async function getOrders(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/orders`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

/** Actualiza el estado de un pedido (Admin) */
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Error al actualizar estado del pedido');
}

/** Obtiene todos los usuarios (Admin) */
export async function getUsers(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

/** Crea un nuevo pedido */
export async function createOrder(orderData: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Error al crear el pedido');
  return res.json();
}

/** Formato de precio en COP */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}

// ... helper filters (no cambios necesarios)
export function filterByCategory(products: Product[], category: string): Product[] {
  if (!category || category === 'Todos') return products;
  return products.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
}

/** Filtra productos por género basado en la categoría */
export function filterByGender(products: Product[], gender: 'hombre' | 'mujer'): Product[] {
  const menKeywords = ['camisa', 'pantalon', 'chaqueta', 'ropa interior', 'corbata', 'traje'];
  const womenKeywords = ['vestido', 'blusa', 'falda', 'top', 'ropa interior mujer'];

  return products.filter((p) => {
    if (p.gender) return p.gender === gender;
    if (p.id.startsWith('mock-h')) return gender === 'hombre';
    if (p.id.startsWith('mock-m')) return gender === 'mujer';
    if (!p.category) return true;
    const cat = p.category.toLowerCase();
    if (gender === 'hombre') {
      return !womenKeywords.some((kw) => cat.includes(kw));
    } else {
      return !menKeywords.some((kw) => cat.includes(kw));
    }
  });
}
