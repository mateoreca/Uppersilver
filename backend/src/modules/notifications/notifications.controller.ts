import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendOtpDto, OrderStatusNotificationDto } from './dto/notifications.dto';

// ── DTO inline for OTP verification ──────────────────────────────────────────
import { IsString } from 'class-validator';

class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  code: string;
}

// ─── Controller ──────────────────────────────────────────────────────────────

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /notifications/order-status
   * Envía notificación de actualización de pedido por WhatsApp + Email en paralelo.
   */
  @Post('order-status')
  @HttpCode(HttpStatus.OK)
  notifyOrderStatus(@Body() dto: OrderStatusNotificationDto): Promise<void> {
    return this.notificationsService.notifyOrderStatus(dto);
  }

  /**
   * POST /notifications/otp
   * Genera y envía un código OTP por SMS (Háblame.co).
   */
  @Post('otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.notificationsService.sendOtp(dto);
  }

  /**
   * POST /notifications/otp/verify
   * Verifica un OTP ingresado por el usuario.
   */
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto): { valid: boolean } {
    const valid = this.notificationsService.verifyOtp(dto.phone, dto.code);
    return { valid };
  }
}
