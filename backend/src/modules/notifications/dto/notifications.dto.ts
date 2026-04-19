import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class SendWhatsAppDto {
  /** Número en formato E.164, ej: +573001234567 */
  @IsString()
  to: string;

  /** Nombre del template de WhatsApp Business pre-aprobado */
  @IsString()
  templateName: string;

  /** Parámetros del template en orden */
  components?: Array<{ type: string; parameters: any[] }>;
}

export class SendOrderStatusWhatsAppDto {
  @IsString()
  to: string;

  @IsString()
  customerName: string;

  @IsString()
  orderId: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  trackingGuide?: string;
}

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  htmlBody: string;

  @IsString()
  @IsOptional()
  fromName?: string;
}

export class SendOtpDto {
  /** Número de teléfono en formato E.164, ej: +573001234567 */
  @IsString()
  phone: string;

  /** Propósito del OTP: verificación de cuenta, pago, etc. */
  @IsString()
  @IsOptional()
  purpose?: string;
}

export class OrderStatusNotificationDto {
  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  orderId: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  trackingGuide?: string;
}
