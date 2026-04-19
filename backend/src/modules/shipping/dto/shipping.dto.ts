import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum ShippingCarrier {
  COORDINADORA = 'coordinadora',
  INTERRAPIDISIMO = 'interrapidisimo',
  SERVIENTREGA = 'servientrega',
  TCC = 'tcc',
}

export class ShippingRatesDto {
  @IsString()
  originCity: string;

  @IsString()
  destinationCity: string;

  /** Peso en gramos */
  @IsNumber()
  weightGrams: number;

  /** Alto en cm */
  @IsNumber()
  heightCm: number;

  /** Ancho en cm */
  @IsNumber()
  widthCm: number;

  /** Largo en cm */
  @IsNumber()
  lengthCm: number;

  /** Valor declarado en COP (para seguro) */
  @IsNumber()
  declaredValue: number;

  /** Si es verdadero, incluye tarifa contraentrega */
  @IsBoolean()
  @IsOptional()
  cashOnDelivery?: boolean;
}

export class CreateShipmentDto {
  @IsString()
  orderId: string;

  @IsEnum(ShippingCarrier)
  carrier: ShippingCarrier;

  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  recipientAddress: string;

  @IsString()
  recipientCity: string;

  @IsNumber()
  weightGrams: number;

  @IsNumber()
  declaredValue: number;

  @IsBoolean()
  @IsOptional()
  cashOnDelivery?: boolean;
}

export class TrackShipmentDto {
  @IsString()
  guide: string;

  @IsEnum(ShippingCarrier)
  carrier: ShippingCarrier;
}
