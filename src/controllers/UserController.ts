import { NextFunction, Request, Response } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors/MainErrors';
import { IUserService } from '../services/UserService';
import { successResponse } from '../helpers/responses';

export class UserController {
  constructor(private service: IUserService) {
    this.service = service;
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw new BadRequestError(
          'Please provide all required fields: name, email, and password.',
        );
      }

      await this.service.register(name, email, password);
      return successResponse(res, 'Account created successfully!');
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new BadRequestError(
          'Please provide both email and password to log in.',
        );
      }

      const loggedIn = await this.service.login(email, password);
      if (!loggedIn) {
        throw new UnauthorizedError(
          'Invalid email or password. Please try again.',
        );
      }

      return successResponse(res, 'You have successfully logged in.');
    } catch (error) {
      next(error);
    }
  };
}
