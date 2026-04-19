import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as crypto from 'crypto';
import {
  SendWhatsAppDto,
  SendEmailDto,
  SendOtpDto,
  OrderStatusNotificationDto,
} from './dto/notifications.dto';

// Mapa de estados de orden a texto amigable en español
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'pendiente de pago',
  paid: 'pago confirmado',
  processing: 'en preparación',
  shipped: 'enviado',
  delivered: 'entregado',
  cancelled: 'cancelado',
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  /** OTP store en memoria (en producción usar Redis con TTL) */
  private readonly otpStore = new Map<string, { code: string; expiresAt: number }>();

  constructor(private readonly config: ConfigService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // WHATSAPP BUSINESS API (Meta)
  // Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api/
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Envía un mensaje de template de WhatsApp Business.
   * Los templates deben estar aprobados en Meta Business Suite.
   */
  async sendWhatsApp(dto: SendWhatsAppDto): Promise<void> {
    const token = this.config.getOrThrow<string>('WHATSAPP_TOKEN');
    const phoneNumberId = this.config.getOrThrow<string>('WHATSAPP_PHONE_NUMBER_ID');

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: dto.to,
          type: 'template',
          template: {
            name: dto.templateName,
            language: { code: 'es_CO' },
            components: dto.components ?? [],
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(`WhatsApp send error to ${dto.to}`, error);
      throw new BadRequestException('Error enviando mensaje de WhatsApp');
    }

    this.logger.log(`WhatsApp enviado a ${dto.to} — template: ${dto.templateName}`);
  }

  /**
   * Envía notificación de estado de orden por WhatsApp.
   * Usa el template "order_status_update" (debe estar aprobado).
   */
  async sendOrderStatusWhatsApp(dto: OrderStatusNotificationDto): Promise<void> {
    const statusLabel = ORDER_STATUS_LABELS[dto.status] ?? dto.status;

    await this.sendWhatsApp({
      to: dto.customerPhone,
      templateName: 'order_status_update',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: dto.customerName },
            { type: 'text', text: dto.orderId },
            { type: 'text', text: statusLabel },
            { type: 'text', text: dto.trackingGuide ?? 'N/A' },
          ],
        },
      ],
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // EMAIL — Gmail API (googleapis)
  // Regla del AGENT_RULES: obligatoriamente usar googleapis para Gmail.
  // Requiere: cuenta de servicio GCP con acceso a Gmail API y dominio delegado.
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Envía un correo electrónico usando la Gmail API oficial de Google.
   */
  async sendEmail(dto: SendEmailDto): Promise<void> {
    const serviceAccountKey = JSON.parse(
      this.config.getOrThrow<string>('GOOGLE_SERVICE_ACCOUNT_JSON'),
    );

    const senderEmail = this.config.getOrThrow<string>('GMAIL_SENDER_EMAIL');

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      clientOptions: { subject: senderEmail }, // Impersonate the sender
    });

    const gmail = google.gmail({ version: 'v1', auth });

    const fromName = dto.fromName ?? 'UpperSilver';
    const rawMessage = this.buildRawEmail({
      from: `${fromName} <${senderEmail}>`,
      to: dto.to,
      subject: dto.subject,
      htmlBody: dto.htmlBody,
    });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: rawMessage },
    });

    this.logger.log(`Email enviado a ${dto.to} — asunto: ${dto.subject}`);
  }

  /** Construye el mensaje RFC 2822 en Base64URL para la Gmail API */
  private buildRawEmail(params: { from: string; to: string; subject: string; htmlBody: string }): string {
    const boundary = `boundary_${Date.now()}`;
    const message = [
      `From: ${params.from}`,
      `To: ${params.to}`,
      `Subject: =?UTF-8?B?${Buffer.from(params.subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(params.htmlBody).toString('base64'),
      '',
      `--${boundary}--`,
    ].join('\r\n');

    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SMS / OTP — Háblame.co
  // Documentación: https://hablame.co/docs/api/
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Genera un OTP de 6 dígitos, lo almacena en memoria con TTL de 5 minutos,
   * y lo envía por SMS vía Háblame.co.
   */
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const apiKey = this.config.getOrThrow<string>('HABLAME_API_KEY');
    const apiSecret = this.config.getOrThrow<string>('HABLAME_API_SECRET');

    const otp = this.generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos

    this.otpStore.set(dto.phone, { code: otp, expiresAt });

    const purpose = dto.purpose ?? 'verificación';
    const smsText = `UpperSilver: Tu código de ${purpose} es ${otp}. Válido por 5 minutos. No lo compartas.`;

    const response = await fetch('https://api104.hablame.co/api/sms/v3/send/', {
      method: 'POST',
      headers: {
        account: apiKey,
        apiKey: apiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toNumber: dto.phone,
        sms: smsText,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error(`SMS OTP error to ${dto.phone}`, error);
      throw new BadRequestException('Error enviando SMS');
    }

    this.logger.log(`OTP enviado a ${dto.phone}`);
    return { message: 'Código OTP enviado exitosamente' };
  }

  /**
   * Verifica un OTP ingresado por el usuario.
   * Retorna true si es válido y no ha expirado.
   */
  verifyOtp(phone: string, code: string): boolean {
    const stored = this.otpStore.get(phone);
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(phone);
      return false;
    }
    const isValid = stored.code === code;
    if (isValid) this.otpStore.delete(phone);
    return isValid;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Orquestador omnicanal
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Envía notificación de estado de orden por TODOS los canales:
   * WhatsApp + Email (en paralelo para rapidez).
   */
  async notifyOrderStatus(dto: OrderStatusNotificationDto): Promise<void> {
    const statusLabel = ORDER_STATUS_LABELS[dto.status] ?? dto.status;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">UpperSilver — Actualización de Pedido</h2>
        <p>Hola <strong>${dto.customerName}</strong>,</p>
        <p>Tu pedido <strong>#${dto.orderId}</strong> está <strong>${statusLabel}</strong>.</p>
        ${dto.trackingGuide ? `<p>Guía de rastreo: <strong>${dto.trackingGuide}</strong></p>` : ''}
        <p>Gracias por comprar en UpperSilver.</p>
        <hr>
        <small style="color: #666;">UpperSilver — Ropa y Accesorios Premium</small>
      </div>
    `;

    await Promise.allSettled([
      this.sendEmail({
        to: dto.customerEmail,
        subject: `Pedido #${dto.orderId} — ${statusLabel}`,
        htmlBody: emailHtml,
      }),
      this.sendOrderStatusWhatsApp(dto),
    ]);

    this.logger.log(`Notificaciones enviadas para orden ${dto.orderId} (${dto.status})`);
  }

  // ──── Helpers ─────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
}
