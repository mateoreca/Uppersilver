/**
 * Script de inicialización del administrador en Firestore.
 * 
 * INSTRUCCIONES:
 * 1. Ve a Firebase Console → Authentication → Add user
 *    - Email: admin@uppersilver.com
 *    - Password: admin123
 *    - Copia el UID que aparece en la lista
 * 
 * 2. Ve a Firestore → Colección "users" → Add document
 *    - Document ID: [el UID copiado]
 *    - Campos:
 *        uid: [el UID]
 *        email: "admin@uppersilver.com"
 *        displayName: "Administrador"
 *        role: "admin"
 *        createdAt: [timestamp actual]
 *
 * Eso es todo. Al iniciar sesión con admin@uppersilver.com / admin123
 * verás el link "Admin ⚡" en el navbar.
 * 
 * ---
 * 
 * ÍNDICES NECESARIOS EN FIRESTORE:
 * Ve a Firestore → Indexes → Composite indexes → Add Index:
 * 
 * Colección: orders
 * Campos: userId (Ascending), createdAt (Descending)
 * 
 * Esto permite que la página "Mis pedidos" filtre por usuario y ordene por fecha.
 * Si no lo creas, Firestore te mostrará un error con un link directo para crearlo.
 */

export {};
