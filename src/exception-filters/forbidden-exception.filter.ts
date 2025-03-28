import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.FORBIDDEN;

    response.status(status).json({
      statusCode: status,
      // timestamp: new Date().toLocaleString(),
      // path: request.url,
      message:
        exception.message ||
        "You don't have permission to access this resource", // Custom message
    });
  }
}
