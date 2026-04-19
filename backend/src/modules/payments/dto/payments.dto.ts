import { IsString, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';

// ──────────────────────────────────────────────────────────────────────────────
// WOMPI DTOs
// ──────────────────────────────────────────────────────────────────────────────

export enum WompiCurrency {
  COP = 'COP',
}

export enum WompiPaymentMethod {
  PSE = 'PSE',
  NEQUI = 'NEQUI',
  BANCOLOMBIA_TRANSFER = 'BANCOLOMBIA_TRANSFER',
  CARD = 'CARD',
}

export class CreateWompiTransactionDto {
  @IsNumber()
  amountInCents: number;

  @IsEnum(WompiCurrency)
  currency: WompiCurrency;

  @IsString()
  customerEmail: string;

  @IsString()
  reference: string;

  @IsEnum(WompiPaymentMethod)
  paymentMethod: WompiPaymentMethod;

  @IsString()
  @IsOptional()
  redirectUrl?: string;
}

export class WompiWebhookDto {
  @IsString()
  event: string;

  @IsObject()
  data: {
    transaction: {
      id: string;
      reference: string;
      status: string;
      amount_in_cents: number;
    };
  };

  @IsString()
  signature: { checksum: string; properties: string[] };

  @IsString()
  timestamp: number;

  @IsString()
  sent_at: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// MERCADO PAGO DTOs
// ──────────────────────────────────────────────────────────────────────────────

export class MpPreferenceItemDto {
  @IsString()
  title: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateMpPreferenceDto {
  @IsString()
  externalReference: string;

  @IsString()
  payerEmail: string;

  items: MpPreferenceItemDto[];

  @IsString()
  @IsOptional()
  backUrl?: string;
}

export class MpWebhookDto {
  @IsString()
  action: string;

  @IsString()
  type: string;

  @IsObject()
  data: { id: string };
}
