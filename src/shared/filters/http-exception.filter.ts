import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Error inesperado';

    const errors =
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).message instanceof Array
        ? (exceptionResponse as any).message
        : undefined;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: errors ? 'Datos inválidos' : message,
      errors: errors ?? undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}