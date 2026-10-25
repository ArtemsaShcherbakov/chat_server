import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

export interface ApiError {
  statusCode: number;
  message: string;
  details?: string[];
}

// Wraps every error into the `{ data, error }` envelope required for all routes
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const error = this.toApiError(exception);

    if (error.statusCode >= 500) {
      this.logger.error(exception);
    }

    response.status(error.statusCode).json({ data: null, error });
  }

  private toApiError(exception: unknown): ApiError {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }

    const statusCode = exception.getStatus();
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return { statusCode, message: body };
    }

    // ValidationPipe returns { message: string[] } for DTO errors
    const { message } = body as { message?: string | string[] };
    if (Array.isArray(message)) {
      return { statusCode, message: 'Validation failed', details: message };
    }
    return { statusCode, message: message ?? exception.message };
  }
}
