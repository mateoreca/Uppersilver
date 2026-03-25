import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ShippingRatesDto, CreateShipmentDto, ShippingCarrier } from './dto/shipping.dto';

// ──────────────────────────────────────────────────────────────────────────────
// Response types
// ──────────────────────────────────────────────────────────────────────────────

export interface ShippingRate {
  carrier: string;
  serviceName: string;
  transitDays: number;
  totalPrice: number;
  currency: string;
  cashOnDeliveryFee?: number;
}

export interface ShipmentGuide {
  guideNumber: string;
  carrier: ShippingCarrier;
  trackingUrl: string;
  orderId: string;
  labelUrl?: string;
}

export interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  // Envíame base URL — multicourier platform
  private readonly enviameBaseUrl = 'https://api.enviame.io/api';

  // Coordinadora sandbox/prod URLs
  private readonly coordinadoraBaseUrl = 'https://api.coordinadora.com';

  constructor(private readonly config: ConfigService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // ENVÍAME — Multi-courier rates
  // Documentación: https://developer.enviame.io/
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Consulta tarifas de múltiples couriers en paralelo via Envíame.
   * Retorna la lista de opciones ordenadas por precio ascendente.
   */
  async getRates(dto: ShippingRatesDto): Promise<ShippingRate[]> {
    const apiKey = this.config.getOrThrow<string>('ENVIAME_API_KEY');

    const response = await fetch(`${this.enviameBaseUrl}/s2/rates`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: { commune_name: dto.originCity },
        destination: { commune_name: dto.destinationCity },
        packages: [
          {
            weight: dto.weightGrams / 1000, // Envíame trabaja en kg
            height: dto.heightCm,
            width: dto.widthCm,
            length: dto.lengthCm,
          },
        ],
        declared_value: dto.declaredValue,
        cash_on_delivery: dto.cashOnDelivery ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('Envíame getRates error', error);
      throw new BadRequestException('No se pudieron obtener tarifas de envío');
    }

    const result = await response.json() as { data: any[] };

    return result.data
      .map((rate: any): ShippingRate => ({
        carrier: rate.carrier?.name ?? rate.courier,
        serviceName: rate.service_type ?? 'Estándar',
        transitDays: rate.transit_days ?? 0,
        totalPrice: rate.total_price,
        currency: 'COP',
        cashOnDeliveryFee: rate.cash_on_delivery_fee,
      }))
      .sort((a, b) => a.totalPrice - b.totalPrice);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ENVÍAME — Crear guía de envío
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Genera una guía de envío con Envíame (multicourier) o específicamente
   * con Coordinadora cuando cashOnDelivery === true.
   */
  async createShipment(dto: CreateShipmentDto): Promise<ShipmentGuide> {
    if (dto.cashOnDelivery && dto.carrier === ShippingCarrier.COORDINADORA) {
      return this.createCoordinadoraShipment(dto);
    }

    return this.createEnviameShipment(dto);
  }

  private async createEnviameShipment(dto: CreateShipmentDto): Promise<ShipmentGuide> {
    const apiKey = this.config.getOrThrow<string>('ENVIAME_API_KEY');

    const response = await fetch(`${this.enviameBaseUrl}/s2/deliveries`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: dto.orderId,
        carrier: dto.carrier,
        packages: [{ weight: dto.weightGrams / 1000 }],
        destination: {
          name: dto.recipientName,
          phone: dto.recipientPhone,
          address: dto.recipientAddress,
          commune_name: dto.recipientCity,
        },
        declared_value: dto.declaredValue,
        cash_on_delivery: dto.cashOnDelivery ?? false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('Envíame createShipment error', error);
      throw new BadRequestException('No se pudo crear la guía de envío');
    }

    const result = await response.json() as { data: any };
    this.logger.log(`Guía creada: ${result.data.tracking_number} (${dto.carrier})`);

    return {
      guideNumber: result.data.tracking_number,
      carrier: dto.carrier,
      trackingUrl: result.data.tracking_url ?? `https://enviame.io/tracking/${result.data.tracking_number}`,
      orderId: dto.orderId,
      labelUrl: result.data.label_url,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // COORDINADORA — Contraentrega
  // Documentación: https://developer.coordinadora.com/
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Genera guía Coordinadora con modalidad contraentrega.
   * Coordinadora recauda el efectivo y transfiere al vendedor.
   */
  private async createCoordinadoraShipment(dto: CreateShipmentDto): Promise<ShipmentGuide> {
    const user = this.config.getOrThrow<string>('COORDINADORA_USER');
    const password = this.config.getOrThrow<string>('COORDINADORA_PASSWORD');

    // Paso 1: Autenticación
    const authResponse = await fetch(`${this.coordinadoraBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: user, contrasena: password }),
    });

    if (!authResponse.ok) {
      throw new BadRequestException('Error de autenticación con Coordinadora');
    }

    const { token } = await authResponse.json() as { token: string };

    // Paso 2: Crear guía contraentrega
    const guideResponse = await fetch(`${this.coordinadoraBaseUrl}/guias/crear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referencia: dto.orderId,
        destinatario: {
          nombre: dto.recipientName,
          telefono: dto.recipientPhone,
          direccion: dto.recipientAddress,
          ciudad: dto.recipientCity,
        },
        peso: dto.weightGrams / 1000,
        valor_declarado: dto.declaredValue,
        contraentrega: {
          activa: true,
          valor: dto.declaredValue, // valor a recaudar = precio del pedido
        },
      }),
    });

    if (!guideResponse.ok) {
      const error = await guideResponse.json();
      this.logger.error('Coordinadora createShipment error', error);
      throw new BadRequestException('No se pudo crear guía contraentrega');
    }

    const result = await guideResponse.json() as { numero_guia: string; url_etiqueta?: string };
    this.logger.log(`Guía Coordinadora contraentrega: ${result.numero_guia}`);

    return {
      guideNumber: result.numero_guia,
      carrier: ShippingCarrier.COORDINADORA,
      trackingUrl: `https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/?guia=${result.numero_guia}`,
      orderId: dto.orderId,
      labelUrl: result.url_etiqueta,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ENVÍAME — Rastreo
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene los eventos de rastreo de una guía específica.
   */
  async trackShipment(guide: string, carrier: ShippingCarrier): Promise<TrackingEvent[]> {
    const apiKey = this.config.getOrThrow<string>('ENVIAME_API_KEY');

    const response = await fetch(
      `${this.enviameBaseUrl}/s2/deliveries/tracking/${guide}?carrier=${carrier}`,
      { headers: { 'api-key': apiKey } },
    );

    if (!response.ok) {
      throw new BadRequestException(`No se pudo rastrear la guía ${guide}`);
    }

    const result = await response.json() as { data: any[] };

    return result.data.map((event: any): TrackingEvent => ({
      date: event.date ?? event.fecha,
      status: event.status ?? event.estado,
      description: event.description ?? event.descripcion,
      location: event.location ?? event.ubicacion,
    }));
  }
}
