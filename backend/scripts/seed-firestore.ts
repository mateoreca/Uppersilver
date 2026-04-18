/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UpperSilver — Firestore Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Pobla la base de datos Firestore "uppersilver2" con los productos que
 * coinciden exactamente con el frontend del e-commerce.
 *
 * USO:
 *   npx ts-node scripts/seed-firestore.ts
 *
 * AUTENTICACIÓN (una de las dos opciones):
 *   1. gcloud auth application-default login
 *   2. Establecer GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// ─── Configuración ───────────────────────────────────────────────────────────
const GCP_PROJECT_ID = 'project-a50f6246-1ee7-413c-b77';
const FIRESTORE_DATABASE_ID = 'uppersilver2';
const COLLECTION_NAME = 'products';

// ─── Inicializar Firebase Admin ──────────────────────────────────────────────
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  console.log('Autenticando con service-account.json...');
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: GCP_PROJECT_ID,
  });
} else {
  console.log('Autenticando con Application Default Credentials...');
  admin.initializeApp({
    projectId: GCP_PROJECT_ID,
  });
}

const db = admin.firestore();
db.settings({ databaseId: FIRESTORE_DATABASE_ID });

// ─── Datos de productos (coinciden con el mock data del frontend) ────────────

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  gender: 'hombre' | 'mujer';
  imageUrl: string | null;
  sizes: string[];
  colors: string[];
}

const PRODUCTS: ProductSeed[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // HOMBRE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Camisa Oxford Premium',
    description:
      'Camisa de algodón pima 100% con corte slim y acabados en nácar.',
    price: 189000,
    stock: 12,
    category: 'Camisas',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul Claro', 'Rosa'],
  },
  {
    name: 'Camisa Lino Mediterráneo',
    description:
      'Tejido en lino natural, perfecta para ocasiones formales y casuales.',
    price: 215000,
    stock: 8,
    category: 'Camisas',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['M', 'L', 'XL'],
    colors: ['Beige', 'Azul Marino', 'Arena'],
  },
  {
    name: 'Pantalón Chino Clásico',
    description:
      'Corte recto en gabardina elástica. Comodidad y estilo para todo el día.',
    price: 245000,
    stock: 15,
    category: 'Pantalones',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Azul Marino', 'Oliva'],
  },
  {
    name: 'Pantalón Jogging Luxury',
    description:
      'Tejido modal suave con cinturilla elástica y bolsillos con cierre.',
    price: 198000,
    stock: 6,
    category: 'Pantalones',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Gris Jaspeado'],
  },
  {
    name: 'Chaqueta Bomber Italiana',
    description:
      'Bomber en sarga de seda con forro interior estampado. Edición limitada.',
    price: 520000,
    stock: 4,
    category: 'Chaquetas',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['M', 'L'],
    colors: ['Verde Oliva', 'Negro'],
  },
  {
    name: 'Blazer Estructurado',
    description:
      'Blazer en lana merino con solapas satinadas. Versatil y elegante.',
    price: 680000,
    stock: 9,
    category: 'Chaquetas',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['40R', '42R', '44R'],
    colors: ['Azul Noche', 'Gris Carbón'],
  },
  {
    name: 'Set Interior Modal',
    description:
      'Camiseta y boxers en modal premium. Suavidad superior garantizada.',
    price: 145000,
    stock: 20,
    category: 'Ropa Interior',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris Oscuro', 'Blanco'],
  },
  {
    name: 'Cinturón Cuero Artesanal',
    description:
      'Cuero full-grain curtido al vegetal, hebilla de latón. Hecho a mano.',
    price: 175000,
    stock: 3,
    category: 'Accesorios',
    gender: 'hombre',
    imageUrl: null,
    sizes: ['S/M', 'L/XL'],
    colors: ['Marrón Oscuro', 'Negro'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUJER
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Vestido Midi Satén',
    description:
      'Satén fluido con escote V y manga larga. Elegancia para cada ocasión.',
    price: 385000,
    stock: 7,
    category: 'Vestidos',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Champagne', 'Esmeralda', 'Negro'],
  },
  {
    name: 'Vestido Wrap Floral',
    description:
      'Estampado exclusivo en gasa ligera. Corte envolvente favorecedor.',
    price: 295000,
    stock: 11,
    category: 'Vestidos',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['S', 'M', 'L'],
    colors: ['Floral Rosa', 'Floral Azul'],
  },
  {
    name: 'Blusa Francesa Bordada',
    description:
      'Bordados artesanales en algodón orgánico. Manga globo y cuello bebé.',
    price: 225000,
    stock: 14,
    category: 'Blusas',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['S', 'M', 'L'],
    colors: ['Blanco Roto', 'Marfil'],
  },
  {
    name: 'Top Seda Natural',
    description:
      'Top sin tirantes en seda pura con tirillas finas regulables.',
    price: 195000,
    stock: 5,
    category: 'Blusas',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Perla', 'Rosado Jaspeado', 'Negro'],
  },
  {
    name: 'Pantalón Wide Leg',
    description:
      'Pierna ancha en crepé de alta calidad. Tiro alto y bolsillos laterales.',
    price: 265000,
    stock: 10,
    category: 'Pantalones',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['32', '34', '36', '38'],
    colors: ['Blanco', 'Negro', 'Camel'],
  },
  {
    name: 'Chaqueta Tweed Premium',
    description:
      'Tejido tweed artesanal con botones dorados. Inspiración couture.',
    price: 595000,
    stock: 6,
    category: 'Chaquetas',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['S', 'M', 'L'],
    colors: ['Blanco y Negro', 'Rosa Empolvado'],
  },
  {
    name: 'Blazer Oversize Cream',
    description:
      'Blazer oversized en lana virgen. Botón único y solapas amplias.',
    price: 545000,
    stock: 8,
    category: 'Chaquetas',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['XS/S', 'M/L'],
    colors: ['Crema', 'Cámel'],
  },
  {
    name: 'Collar Perlas Cultivadas',
    description:
      'Perlas cultivadas de agua dulce en hilo de seda. Cierre en plata 925.',
    price: 320000,
    stock: 4,
    category: 'Accesorios',
    gender: 'mujer',
    imageUrl: null,
    sizes: ['Única'],
    colors: ['Blanco Nácar'],
  },
];

// ─── Función principal ──────────────────────────────────────────────────────

async function seed() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║       UpperSilver — Firestore Seed Script              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`📦 Proyecto GCP:    ${GCP_PROJECT_ID}`);
  console.log(`🗄️  Base de datos:   ${FIRESTORE_DATABASE_ID}`);
  console.log(`📁 Colección:       ${COLLECTION_NAME}`);
  console.log(`🛍️  Productos:       ${PRODUCTS.length}`);
  console.log();

  // 1. Limpiar colección existente
  console.log('🧹 Limpiando colección existente...');
  const existingDocs = await db.collection(COLLECTION_NAME).listDocuments();
  if (existingDocs.length > 0) {
    const batch = db.batch();
    existingDocs.forEach((doc) => batch.delete(doc));
    await batch.commit();
    console.log(`   ✓ ${existingDocs.length} documentos eliminados.`);
  } else {
    console.log('   ✓ Colección vacía o nueva.');
  }

  // 2. Insertar productos nuevos
  console.log('📝 Insertando productos...');
  const batch = db.batch();
  const now = admin.firestore.Timestamp.now();

  for (const product of PRODUCTS) {
    const docRef = db.collection(COLLECTION_NAME).doc(); // Auto-ID
    batch.set(docRef, {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      gender: product.gender,
      imageUrl: product.imageUrl,
      sizes: product.sizes,
      colors: product.colors,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`   ✓ ${product.gender.toUpperCase()} | ${product.category} → ${product.name}`);
  }

  await batch.commit();

  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🎉 ¡Listo! ${PRODUCTS.length} productos insertados exitosamente.`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log('Estructura de cada documento en Firestore:');
  console.log('  ├── name:        string');
  console.log('  ├── description: string');
  console.log('  ├── price:       number (en COP, sin decimales)');
  console.log('  ├── stock:       number');
  console.log('  ├── category:    string (Camisas, Pantalones, etc.)');
  console.log('  ├── gender:      string ("hombre" | "mujer")');
  console.log('  ├── imageUrl:    string | null');
  console.log('  ├── sizes:       string[]');
  console.log('  ├── colors:      string[]');
  console.log('  ├── createdAt:   Timestamp');
  console.log('  └── updatedAt:   Timestamp');
  console.log();

  // Cerrar
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error al ejecutar seed:', err.message ?? err);
  process.exit(1);
});
