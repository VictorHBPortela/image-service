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

      const user = await this.service.register(name, email, password);
      return successResponse(res, 'Account created successfully!', user);
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
    
      const user = await this.service.login(email, password);
      if (!user) {
          return successResponse(res, 'User is already logged in.')
      }

      return successResponse(res, 'You have successfully logged in.', user);
    } catch (error) {
      next(error);
    }
  };

 refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw new BadRequestError('Refresh token required');

        const result = await this.service.refresh(refreshToken);
        return successResponse(res, 'Token refreshed', result);
    } catch (error) {
        next(error);
    }
  }
}
