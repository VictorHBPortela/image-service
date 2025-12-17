import { STATUS_CODE } from '../shared/constants';
import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, STATUS_CODE.NOT_FOUND);
  }
}
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, STATUS_CODE.BAD_REQUEST);
  }
}
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Invalid or expired token.') {
    super(message, STATUS_CODE.UNAUTHORIZED);
  }
}
export class ForbiddenError extends AppError {
  constructor(message: string = 'You have no access to this resource') {
    super(message, STATUS_CODE.FORBIDDEN);
  }
}
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, STATUS_CODE.CONFLICT);
  }
}
export class InternalError extends AppError {
  constructor(message: string) {
    super(message, STATUS_CODE.INTERNAL_ERROR);
  }
}
