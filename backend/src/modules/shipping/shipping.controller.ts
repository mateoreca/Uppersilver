import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingRatesDto, CreateShipmentDto, ShippingCarrier } from './dto/shipping.dto';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /** Calcula tarifas de múltiples couriers para una ruta y paquete dado */
  @Post('rates')
  getRates(@Body() dto: ShippingRatesDto) {
    return this.shippingService.getRates(dto);
  }

  /** Genera una guía de envío (automáticamente usa Coordinadora si es contraentrega) */
  @Post('create')
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto);
  }

  /** Rastrear una guía de envío por número de guía y transportadora */
  @Get('track/:guide')
  trackShipment(
    @Param('guide') guide: string,
    @Query('carrier') carrier: ShippingCarrier,
  ) {
    return this.shippingService.trackShipment(guide, carrier);
  }
}
