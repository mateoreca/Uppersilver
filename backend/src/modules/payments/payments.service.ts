import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CreateWompiTransactionDto,
  WompiWebhookDto,
  CreateMpPreferenceDto,
  MpWebhookDto,
} from './dto/payments.dto';

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de respuesta de las APIs externas
// ──────────────────────────────────────────────────────────────────────────────
export interface WompiTransactionResponse {
  data: { id: string; status: string; redirect_url?: string };
}

export interface MpPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly wompiBaseUrl = 'https://production.wompi.co/v1';
  private readonly mpBaseUrl = 'https://api.mercadopago.com';

  constructor(private readonly config: ConfigService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // WOMPI
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Crea una transacción en Wompi.
   * Referencia: https://docs.wompi.co/reference/crear-una-transaccion
   */
  async createWompiTransaction(dto: CreateWompiTransactionDto): Promise<WompiTransactionResponse> {
    const privateKey = this.config.getOrThrow<string>('WOMPI_PRIVATE_KEY');

    const response = await fetch(`${this.wompiBaseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_in_cents: dto.amountInCents,
        currency: dto.currency,
        customer_email: dto.customerEmail,
        reference: dto.reference,
        payment_method: { type: dto.paymentMethod },
        redirect_url: dto.redirectUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('Wompi transaction error', error);
      throw new BadRequestException(error);
    }

    return response.json() as Promise<WompiTransactionResponse>;
  }

  /**
   * Valida y procesa un webhook de Wompi.
   * Verifica la firma HMAC-SHA256 con WOMPI_EVENTS_SECRET.
   * Referencia: https://docs.wompi.co/docs/colombia/eventos-webhooks
   */
  processWompiWebhook(dto: WompiWebhookDto, rawSignature: string): { orderId: string; status: string } {
    const eventsSecret = this.config.getOrThrow<string>('WOMPI_EVENTS_SECRET');

    // Reconstruir la cadena de firma según la especificación de Wompi
    const properties = (dto.signature as any).properties as string[];
    const checksum = (dto.signature as any).checksum as string;

    const signedString =
      properties.map((prop) => this.dotNotationGet(dto, prop)).join('') +
      dto.timestamp +
      eventsSecret;

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(signedString)
      .digest('hex');

    if (expectedChecksum !== checksum) {
      this.logger.warn('Invalid Wompi webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const { reference, status } = dto.data.transaction;
    this.logger.log(`Wompi webhook: order ${reference} → ${status}`);

    // Aquí se puede emitir un evento NestJS o actualizar la DB de órdenes
    return { orderId: reference, status };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MERCADO PAGO
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Crea una preferencia de pago en Mercado Pago.
   * Retorna el init_point (URL de pago) para redirigir al cliente.
   * Referencia: https://www.mercadopago.com.co/developers/es/reference/preferences/_checkout_preferences/post
   */
  async createMpPreference(dto: CreateMpPreferenceDto): Promise<MpPreferenceResponse> {
    const accessToken = this.config.getOrThrow<string>('MP_ACCESS_TOKEN');

    const response = await fetch(`${this.mpBaseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_reference: dto.externalReference,
        payer: { email: dto.payerEmail },
        items: dto.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: 'COP',
        })),
        back_urls: {
          success: dto.backUrl ?? `${this.config.get('FRONTEND_URL')}/orders/success`,
          failure: dto.backUrl ?? `${this.config.get('FRONTEND_URL')}/orders/failure`,
          pending: dto.backUrl ?? `${this.config.get('FRONTEND_URL')}/orders/pending`,
        },
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('MercadoPago preference error', error);
      throw new BadRequestException(error);
    }

    return response.json() as Promise<MpPreferenceResponse>;
  }

  /**
   * Procesa notificaciones IPN de Mercado Pago.
   * Consulta el estado real del pago en la API de MP y retorna el estado.
   * Referencia: https://www.mercadopago.com.co/developers/es/docs/your-integrations/notifications/ipn
   */
  async processMpWebhook(dto: MpWebhookDto): Promise<{ paymentId: string; status: string }> {
    if (dto.type !== 'payment') {
      return { paymentId: dto.data.id, status: 'ignored' };
    }

    const accessToken = this.config.getOrThrow<string>('MP_ACCESS_TOKEN');
    const response = await fetch(`${this.mpBaseUrl}/v1/payments/${dto.data.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new BadRequestException('Could not retrieve MP payment');
    }

    const payment = await response.json() as { status: string; external_reference: string };
    this.logger.log(`MP payment ${dto.data.id}: ${payment.status} (ref: ${payment.external_reference})`);

    return { paymentId: dto.data.id, status: payment.status };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  /** Accede a una propiedad de un objeto usando notación de punto (e.g. 'data.transaction.id') */
  private dotNotationGet(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
  }
}
