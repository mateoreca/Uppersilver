import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { IsString, MinLength } from 'class-validator';
import { AiService } from './ai.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  message: string;
}

// ─── Controller ──────────────────────────────────────────────────────────────

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/chat
   * Respuesta completa (no-streaming). Útil para tests e integraciones sencillas.
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() dto: ChatMessageDto): Promise<{ reply: string }> {
    const reply = await this.aiService.chat(dto.message);
    return { reply };
  }

  /**
   * POST /ai/chat/stream
   * Respuesta en modo streaming SSE (Server-Sent Events).
   * El frontend usa EventSource o fetch con ReadableStream para consumirlo.
   */
  @Post('chat/stream')
  @HttpCode(HttpStatus.OK)
  async chatStream(
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const chunk of this.aiService.chatStream(dto.message)) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } finally {
      res.end();
    }
  }

  /**
   * GET /ai/embed-products
   * Genera embeddings para todos los productos del catálogo.
   * Debe protegerse con un guard de admin en producción.
   */
  @Get('embed-products')
  embedProducts(): Promise<{ embedded: number }> {
    return this.aiService.embedAllProducts();
  }
}
