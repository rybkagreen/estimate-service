import { Module } from '@nestjs/common';
import { EstimateStreamingService } from './streaming.service';

/**
 * Модуль для поддержки streaming обработки больших файлов смет
 *
 * Предоставляет:
 * - Streaming экспорт смет в различных форматах
 * - Streaming импорт больших файлов
 * - Обработка данных по частям (chunking)
 * - Мониторинг прогресса обработки
 *
 * @example
 * ```typescript
 * // В контроллере
 * @Get(':id/stream')
 * async streamEstimate(
 *   @Param('id') id: string,
 *   @Res({ passthrough: true }) response: Response
 * ) {
 *   await this.streamingService.streamEstimateToResponse(
 *     parseInt(id, 10),
 *     response,
 *     { format: 'json', chunkSize: 1000 }
 *   );
 * }
 * ```
 */
@Module({
  providers: [EstimateStreamingService],
  exports: [EstimateStreamingService],
})
export class StreamingModule {}
