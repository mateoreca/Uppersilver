import { Product } from '@/types';

/** 
 * ============================================================================
 * INSTRUCCIONES PARA EL EQUIPO (SUBIDA DE IMÁGENES):
 * ============================================================================
 * 
 * Para que las imágenes de los productos se muestren correctamente, deben 
 * guardar las fotos en la siguiente carpeta del proyecto:
 * 
 *    frontend/public/img/products/
 * 
 * (Si las carpetas 'img' y 'products' no existen dentro de 'public', por favor créenlas).
 * 
 * YA ESTAN CREADAS LAS CARPETAS S4M0L
 * 
 * Cada imagen debe tener EXACTAMENTE el mismo nombre que el 'id' del producto, 
 * con la extensión '.jpg'. 
 * 
 * Lista de nombres de archivo requeridos para Hombre:
 * - mock-h1.jpg (Camisa Oxford Premium)
 * - mock-h2.jpg (Camisa Lino Mediterráneo)
 * - mock-h3.jpg (Pantalón Chino Clásico)
 * - mock-h4.jpg (Pantalón Jogging Luxury)
 * - mock-h5.jpg (Chaqueta Bomber Italiana)
 * - mock-h6.jpg (Blazer Estructurado)
 * - mock-h7.jpg (Set Interior Modal)
 * - mock-h8.jpg (Cinturón Cuero Artesanal)
 * 
 * Lista de nombres de archivo requeridos para Mujer:
 * - mock-m1.jpg (Vestido Midi Satén)
 * - mock-m2.jpg (Vestido Wrap Floral)
 * - mock-m3.jpg (Blusa Francesa Bordada)
 * - mock-m4.jpg (Top Seda Natural)
 * - mock-m5.jpg (Pantalón Wide Leg)
 * - mock-m6.jpg (Chaqueta Tweed Premium)
 * - mock-m7.jpg (Blazer Oversize Cream)
 * - mock-m8.jpg (Collar Perlas Cultivadas)
 * 
 * Una vez guarden las imágenes ahí, el frontend las cargará automáticamente.
 * ============================================================================
 */

export const MOCK_MEN_PRODUCTS: Product[] = [
  {
    id: 'mock-h1',
    name: 'Camisa Oxford Premium',
    description: 'Camisa de algodón pima 100% con corte slim y acabados en nácar.',
    price: 189000,
    stock: 12,
    category: 'Camisas',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul Claro', 'Rosa'],
    imageUrl: '/img/products/mock-h1.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h2',
    name: 'Camisa Lino Mediterráneo',
    description: 'Tejido en lino natural, perfecta para ocasiones formales y casuales.',
    price: 215000,
    stock: 8,
    category: 'Camisas',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul Claro', 'Rosa'],
    imageUrl: '/img/products/mock-h2.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h3',
    name: 'Pantalón Chino Clásico',
    description: 'Corte recto en gabardina elástica. Comodidad y estilo para todo el día.',
    price: 245000,
    stock: 15,
    category: 'Pantalones',
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Azul Marino', 'Negro'],
    imageUrl: '/img/products/mock-h3.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h4',
    name: 'Pantalón Jogging Luxury',
    description: 'Tejido modal suave con cinturilla elástica y bolsillos con cierre.',
    price: 198000,
    stock: 6,
    category: 'Pantalones',
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Azul Marino', 'Negro'],
    imageUrl: '/img/products/mock-h4.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h5',
    name: 'Chaqueta Bomber Italiana',
    description: 'Bomber en sarga de seda con forro interior estampado. Edición limitada.',
    price: 520000,
    stock: 4,
    category: 'Chaquetas',
    sizes: ['M', 'L'],
    colors: ['Verde Oliva', 'Negro'],
    imageUrl: '/img/products/mock-h5.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h6',
    name: 'Blazer Estructurado',
    description: 'Blazer en lana merino con solapas satinadas. Versatil y elegante.',
    price: 680000,
    stock: 9,
    category: 'Chaquetas',
    sizes: ['M', 'L'],
    colors: ['Cafe', 'Negro'],
    imageUrl: '/img/products/mock-h6.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h7',
    name: 'Set Interior Modal',
    description: 'Camiseta y boxers en modal premium. Suavidad superior garantizada.',
    price: 145000,
    stock: 20,
    category: 'Ropa Interior',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Rojo', 'Gris Oscuro', 'Blanco'],
    imageUrl: '/img/products/mock-h7.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-h8',
    name: 'Cinturón Cuero Artesanal',
    description: 'Cuero full-grain curtido al vegetal, hebilla de latón. Hecho a mano.',
    price: 175000,
    stock: 3,
    category: 'Accesorios',
    sizes: ['S/M', 'L/XL'],
    colors: ['Marrón Oscuro', 'Negro'],
    imageUrl: '/img/products/mock-h8.jpg',
    createdAt: '',
    updatedAt: '',
  },
];

export const MOCK_WOMEN_PRODUCTS: Product[] = [
  {
    id: 'mock-m1',
    name: 'Vestido Midi Satén',
    description: 'Satén fluido con escote V y manga larga. Elegancia para cada ocasión.',
    price: 385000,
    stock: 7,
    category: 'Vestidos',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral Rosa', 'Negro'],
    imageUrl: '/img/products/mock-m1.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m2',
    name: 'Vestido Wrap Floral',
    description: 'Estampado exclusivo en gasa ligera. Corte envolvente favorecedor.',
    price: 295000,
    stock: 11,
    category: 'Vestidos',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral Rosa', 'Negro'],
    imageUrl: '/img/products/mock-m2.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m3',
    name: 'Blusa Francesa Bordada',
    description: 'Bordados artesanales en algodón orgánico. Manga globo y cuello bebé.',
    price: 225000,
    stock: 14,
    category: 'Blusas',
    sizes: ['S', 'M', 'L'],
    colors: ['Blanco Roto', 'Rosa'],
    imageUrl: '/img/products/mock-m3.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m4',
    name: 'Top Seda Natural',
    description: 'Top sin tirantes en seda pura con tirillas finas regulables.',
    price: 195000,
    stock: 5,
    category: 'Blusas',
    sizes: ['S', 'M', 'L'],
    colors: ['Blanco Roto', 'Rosa'],
    imageUrl: '/img/products/mock-m4.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m5',
    name: 'Pantalón Wide Leg',
    description: 'Pierna ancha en crepé de alta calidad. Tiro alto y bolsillos laterales.',
    price: 265000,
    stock: 10,
    category: 'Pantalones',
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Azul Marino', 'Negro'],
    imageUrl: '/img/products/mock-m5.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m6',
    name: 'Chaqueta Tweed Premium',
    description: 'Tejido tweed artesanal con botones dorados. Inspiración couture.',
    price: 595000,
    stock: 6,
    category: 'Chaquetas',
    sizes: ['M', 'L'],
    colors: ['Verde Oliva', 'Negro'],
    imageUrl: '/img/products/mock-m6.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m7',
    name: 'Blazer Oversize Cream',
    description: 'Blazer oversized en lana virgen. Botón único y solapas amplias.',
    price: 545000,
    stock: 8,
    category: 'Chaquetas',
    sizes: ['M', 'L'],
    colors: ['Verde Oliva', 'Negro'],
    imageUrl: '/img/products/mock-m7.jpg',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'mock-m8',
    name: 'Collar Perlas Cultivadas',
    description: 'Perlas cultivadas de agua dulce en hilo de seda. Cierre en plata 925.',
    price: 320000,
    stock: 4,
    category: 'Accesorios',
    sizes: ['S/M', 'L/XL'],
    colors: ['Marrón Oscuro', 'Negro'],
    imageUrl: '/img/products/mock-m8.jpg',
    createdAt: '',
    updatedAt: '',
  },
];

export const ALL_MOCK_PRODUCTS: Product[] = [
  ...MOCK_MEN_PRODUCTS,
  ...MOCK_WOMEN_PRODUCTS,
];
