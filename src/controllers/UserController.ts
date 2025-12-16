import { Request, Response } from 'express';
import { BadRequestError } from '../errors/MainErrors';
import { IUserService } from '../services/UserService';
import { AppError } from '../errors/AppError';
import {
  badRequestResponse,
  successResponse,
  unauthorizedResponse,
} from '../helpers/responses';

export class UserController {
  constructor(private service: IUserService) {
    this.service = service;
  }

  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw new BadRequestError(
          'Missing user credentials: name, email, password.',
        );
      }

      await this.service.register(name, email, password);
      return successResponse(res, 'User registered sucessfully');
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new Error(
        `Failed to register user: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return badRequestResponse(
          res,
          'Missing user credentials: email or password',
        );
      const loggedIn = await this.service.login(email, password);
      if (!loggedIn) return unauthorizedResponse(res, 'Invalid credentials');

      return successResponse(res, 'User logged in succesfully');
    } catch (error) {
      throw new Error(
        `Failed to login user: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  };
}
