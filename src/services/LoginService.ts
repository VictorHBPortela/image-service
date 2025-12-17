import bcrypt from 'bcrypt';
import config from '../config/config';
import { InternalError } from '../errors/MainErrors';
import jwt from 'jsonwebtoken';

export interface ILoginService {
  createHash(password: string, saltRounds?: number): Promise<string>;
  passwordMatchesHash(password: string, hash: string): Promise<boolean>;
  signToken(name: string): string;
}

export class LoginService implements ILoginService {
  async createHash(password: string, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async passwordMatchesHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  signToken(name: string): string {
    const accessToken = config.accessToken;
    if (!accessToken)
      throw new InternalError('Missing access token enviroment variable');
    return jwt.sign(name, accessToken);
  }

  // isTokenExpired()
}
