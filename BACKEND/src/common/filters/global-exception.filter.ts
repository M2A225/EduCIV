import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      `HTTP ${status}: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
    );

    if (status >= 500) {
      Sentry.captureException(exception);
    }

    response.status(status).json({
      success: false,
      data: null,
      error:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    });
  }
}
