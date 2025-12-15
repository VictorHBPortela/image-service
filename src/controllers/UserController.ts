import { Request, Response } from 'express';
import { BadRequestError } from '../errors/MainErrors';
import { STATUS_CODE } from '../shared/constants';
import { IUserService } from '../services/UserService';

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
      return res
        .status(STATUS_CODE.CREATED)
        .json({ status: 'success', message: 'User registered sucessfully' });
    } catch (error) {
      throw new Error(
        `Failed to register user: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(STATUS_CODE.BAD_REQUEST).json({
          status: 'error',
          message: 'Missing user credentials: email or password',
        });
      const loggedIn = await this.service.login(email, password);
      if (!loggedIn)
        return res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ status: 'error', message: 'Invalid credentials' });

      return res
        .status(STATUS_CODE.SUCCESS)
        .json({ status: 'success', message: 'User logged in!' });
    } catch (error) {
      throw new Error(
        `Failed to login user: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  };
}
