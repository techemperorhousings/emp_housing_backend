import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger = new Logger(HttpExceptionFilter.name),
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract the error message(s) from the exception
    let message = exception.message || 'Unexpected error';
    let errorResponse = exception.getResponse();

    // Handle BadRequestException with DTO validation errors
    if (exception instanceof BadRequestException) {
      const validationErrors = (errorResponse as any).message;

      // Format validation errors if they exist
      if (Array.isArray(validationErrors)) {
        message = this.formatValidationErrors(validationErrors);
      }
    }

    // Structured logging for better monitoring
    this.logger.error({
      message: `${request.method} ${request.originalUrl} failed with status ${status}`,
      error: message,
      timestamp: new Date().toISOString(),
    });

    // Send the response to the client
    response.status(status).json({
      statusCode: status,
      error: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // Helper method to format validation errors into a readable message
  private formatValidationErrors(errors: any[]): string {
    return errors
      .map((err) => {
        if (typeof err === 'string') {
          return err; // Handle simple string messages
        }

        const constraints = Object.values(err.constraints || {});
        return constraints.join(', '); // Join all error messages for this field
      })
      .join('; '); // Separate multiple field errors with semicolons
  }
}
