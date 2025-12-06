import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Invalid or expired token.') {
    super(message, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(message: string = 'You have no access to this resource') {
    super(message, 403);
  }
}
