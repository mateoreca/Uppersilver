import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreateWompiTransactionDto,
  WompiWebhookDto,
  CreateMpPreferenceDto,
  MpWebhookDto,
} from './dto/payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Wompi ────────────────────────────────────────────────────────────────

  /** Crea una transacción (PSE, Nequi, Daviplata, tarjeta) */
  @Post('wompi/create')
  createWompiTransaction(@Body() dto: CreateWompiTransactionDto) {
    return this.paymentsService.createWompiTransaction(dto);
  }

  /** Recibe eventos de Wompi (confirmación de pago, rechazo, etc.) */
  @Post('wompi/webhook')
  @HttpCode(HttpStatus.OK)
  wompiWebhook(
    @Body() dto: WompiWebhookDto,
    @Headers('wompi-signature-checksum') signature: string,
  ) {
    return this.paymentsService.processWompiWebhook(dto, signature);
  }

  // ─── Mercado Pago ─────────────────────────────────────────────────────────

  /** Crea una preferencia de pago y devuelve el init_point (URL de checkout) */
  @Post('mercadopago/preference')
  createMpPreference(@Body() dto: CreateMpPreferenceDto) {
    return this.paymentsService.createMpPreference(dto);
  }

  /** Recibe notificaciones IPN de Mercado Pago */
  @Post('mercadopago/webhook')
  @HttpCode(HttpStatus.OK)
  mpWebhook(@Body() dto: MpWebhookDto) {
    return this.paymentsService.processMpWebhook(dto);
  }
}
