import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private embeddings: OpenAIEmbeddings;
  private llm: ChatOpenAI;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    this.embeddings = new OpenAIEmbeddings({ apiKey, model: 'text-embedding-3-small' });
    this.llm = new ChatOpenAI({ apiKey, model: 'gpt-4o-mini', temperature: 0.3 });
  }

  /**
   * Genera un embedding para un texto dado usando OpenAI text-embedding-3-small,
   * retorna un array de 1536 floats.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const [vector] = await this.embeddings.embedDocuments([text]);
    return vector;
  }

  /**
   * Genera y persiste embeddings para todos los productos del catálogo.
   * Se llama desde el endpoint de admin GET /ai/embed-products.
   */
  async embedAllProducts(): Promise<{ embedded: number }> {
    const products = await this.productRepository.find();
    let embedded = 0;

    for (const product of products) {
      const text = `${product.name}. ${product.description}. Categoría: ${product.category ?? 'sin categoría'}. Precio: $${product.price}.`;
      const vector = await this.generateEmbedding(text);

      // Persistir como JSON string para compatibilidad antes de ejecutar la migración de pgvector
      await this.productRepository.manager.query(
        `UPDATE products SET embedding = $1 WHERE id = $2`,
        [JSON.stringify(vector), product.id],
      );

      embedded++;
    }

    return { embedded };
  }

  /**
   * Realiza una búsqueda semántica por similitud coseno usando pgvector.
   * Requiere que la migración enable-pgvector.ts haya sido ejecutada.
   */
  async semanticSearch(query: string, limit = 5): Promise<Product[]> {
    const queryVector = await this.generateEmbedding(query);
    const vectorStr = `[${queryVector.join(',')}]`;

    const products = await this.productRepository.manager.query(
      `SELECT id, name, description, price, stock, category, "imageUrl"
       FROM products
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorStr, limit],
    );

    return products as Product[];
  }

  /**
   * Flujo principal RAG:
   * 1. Busca productos semánticamente relevantes.
   * 2. Verifica stock real en la DB.
   * 3. Genera respuesta del LLM con contexto.
   * 4. Retorna la respuesta como string (el controller maneja el streaming SSE).
   */
  async chat(message: string): Promise<string> {
    const relevantProducts = await this.semanticSearch(message, 5);

    // Construye contexto de productos con stock real
    const context = relevantProducts
      .map(
        (p) =>
          `- ${p.name} | Precio: $${p.price} COP | Stock: ${p.stock} unidades | Categoría: ${p.category ?? 'N/A'} | Descripción: ${p.description}`,
      )
      .join('\n');

    const systemPrompt = `Eres el asistente de ventas de UpperSilver, una tienda de ropa y accesorios premium para hombres y mujeres.
Tu objetivo es ayudar a los clientes a encontrar productos, responder preguntas sobre stock, precios y disponibilidad.
Sé amable, conciso y utiliza la información de productos disponibles para dar respuestas precisas.
Si un producto no tiene stock, sugiere alternativas similares.

PRODUCTOS DISPONIBLES RELEVANTES A LA CONSULTA:
${context || 'No se encontraron productos directamente relacionados.'}

Responde en español colombiano. Sé directo y útil.`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    const response = await chain.invoke({ input: message });

    return response;
  }

  /**
   * Versión streaming del chat. Retorna un AsyncGenerator de chunks de texto.
   * El controller lo transforma en SSE para el cliente.
   */
  async *chatStream(message: string): AsyncGenerator<string> {
    const relevantProducts = await this.semanticSearch(message, 5);

    const context = relevantProducts
      .map(
        (p) =>
          `- ${p.name} | Precio: $${p.price} COP | Stock: ${p.stock} unidades | Categoría: ${p.category ?? 'N/A'}`,
      )
      .join('\n');

    const systemPrompt = `Eres el asistente de ventas de UpperSilver, una tienda de ropa y accesorios premium.
Responde en español colombiano. Sé amable y conciso.
PRODUCTOS RELEVANTES:
${context || 'No hay productos directamente relacionados.'}`;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', '{input}'],
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    const stream = await chain.stream({ input: message });

    for await (const chunk of stream) {
      yield chunk;
    }
  }
}
