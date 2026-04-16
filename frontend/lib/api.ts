import { Product } from '@/types';
import { ALL_MOCK_PRODUCTS } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** Obtiene todos los productos del backend */
export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      // Revalidar cada 60 segundos (ISR)
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Error al obtener productos: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.warn('Backend unavailable, falling back to mock data');
    return ALL_MOCK_PRODUCTS;
  }
}

/** Obtiene un producto por ID */
export async function getProductById(id: string): Promise<Product> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Producto #${id} no encontrado`);
    }

    return res.json();
  } catch (error) {
    const mock = ALL_MOCK_PRODUCTS.find((p) => p.id === id);
    if (!mock) throw new Error(`Producto #${id} no encontrado en mock data`);
    return mock;
  }
}

/** Filtra productos por categoría (client-side) */
export function filterByCategory(products: Product[], category: string): Product[] {
  if (!category || category === 'Todos') return products;
  return products.filter(
    (p) => p.category?.toLowerCase() === category.toLowerCase(),
  );
}

/** Filtra productos por género basado en la categoría */
export function filterByGender(products: Product[], gender: 'hombre' | 'mujer'): Product[] {
  const menKeywords = ['camisa', 'pantalon', 'chaqueta', 'ropa interior', 'corbata', 'traje'];
  const womenKeywords = ['vestido', 'blusa', 'falda', 'top', 'ropa interior mujer'];

  return products.filter((p) => {
    if (!p.category) return true;
    const cat = p.category.toLowerCase();
    if (gender === 'hombre') {
      return !womenKeywords.some((kw) => cat.includes(kw));
    } else {
      return !menKeywords.some((kw) => cat.includes(kw));
    }
  });
}

/** Login de usuario */
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? 'Credenciales inválidas');
  }

  return res.json();
}

/** Crea preferencia de Mercado Pago */
export async function createMercadoPagoPreference(payload: {
  externalReference: string;
  payerEmail: string;
  items: { title: string; quantity: number; unit_price: number }[];
  backUrl?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/payments/mercadopago/preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al crear preferencia de pago');
  }

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
