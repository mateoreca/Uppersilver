import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Habilita pgvector en PostgreSQL y añade columna embedding a productos.
 * 
 * PREREQUISITO: La instancia de Cloud SQL debe tener PostgreSQL 15+ y
 * la extensión pgvector disponible (en Cloud SQL está disponible desde pg15).
 * 
 * Para ejecutar: npm run typeorm migration:run
 */
export class EnablePgvector1742843000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensión pgvector
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Añadir columna de embedding (1536 dimensiones = OpenAI text-embedding-3-small)
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS embedding vector(1536)
    `);

    // Índice IVFFlat para búsqueda coseno eficiente
    // lists=100 es apropiado para ~100K registros; ajustar a sqrt(n) para más datos
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS products_embedding_idx
      ON products
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS products_embedding_idx`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS embedding`);
    // No droppear la extensión por si otros módulos la usan
  }
}
