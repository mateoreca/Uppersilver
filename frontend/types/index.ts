// ─── Tipos del dominio UpperSilver ────────────────────────────────────────────

/** Producto tal como lo devuelve el backend */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | null;
  imageUrl: string | null;
  sizes?: string[];
  colors?: string[];
  createdAt: string;
  updatedAt: string;
}

/** Ítem dentro del carrito de compras */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string | null;
}

/** Géneros disponibles */
export type Gender = 'hombre' | 'mujer';

/** Categorías por género */
export const MEN_CATEGORIES = [
  'Camisas',
  'Pantalones',
  'Chaquetas',
  'Ropa Interior',
  'Accesorios',
] as const;

export const WOMEN_CATEGORIES = [
  'Vestidos',
  'Blusas',
  'Pantalones',
  'Chaquetas',
  'Accesorios',
] as const;

export type MenCategory = typeof MEN_CATEGORIES[number];
export type WomenCategory = typeof WOMEN_CATEGORIES[number];

/** Tallas disponibles */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = typeof SIZES[number];

/** Colores disponibles */
export interface ColorOption {
  name: string;
  hex: string;
}

export const COLORS: ColorOption[] = [
  { name: 'Negro', hex: '#1a1a1a' },
  { name: 'Blanco', hex: '#f5f5f5' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Plateado', hex: '#C0C0C0' },
  { name: 'Azul marino', hex: '#1B2A4A' },
  { name: 'Borgoña', hex: '#800020' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Verde oliva', hex: '#556B2F' },
  { name: 'Azul Claro', hex: '#D2E1EF' },
  { name: 'Rosa', hex: '#EED4D8' },
  { name: 'Khaki', hex: '#C3B091' },
  { name: 'Gris Oscuro', hex: '#404040' },
  { name: 'Marrón Oscuro', hex: '#5C4033' },
  { name: 'Floral Rosa', hex: '#F4C2C2' },
  { name: 'Blanco Roto', hex: '#F9F6EE' },
];

/** Estado del carrito */
export interface CartState {
  items: CartItem[];
}

/** Acciones del carrito */
export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string; color: string } }
  | { type: 'INCREMENT'; payload: { productId: string; size: string; color: string } }
  | { type: 'DECREMENT'; payload: { productId: string; size: string; color: string } }
  | { type: 'CLEAR_CART' };
