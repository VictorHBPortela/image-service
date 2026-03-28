import bcrypt from 'bcrypt';
import config from '../config/config';
import { InternalError } from '../errors/MainErrors';
import jwt from 'jsonwebtoken';

export interface ILoginService {
  createHash(password: string, saltRounds?: number): Promise<string>;
  passwordMatchesHash(password: string, hash: string): Promise<boolean>;
  signToken(id: string, name: string, email: string): string;
  signRefreshToken(id: string, name: string, email: string): string;
}

export class LoginService implements ILoginService {
  async createHash(password: string, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async passwordMatchesHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  signToken(id: string, name: string, email: string): string {
    const accessToken = config.accessToken;
    if (!accessToken)
      throw new InternalError('Missing access token enviroment variable');
    return jwt.sign({ id, name, email }, accessToken, { expiresIn: '15m'});
  }

  signRefreshToken(id: string, name: string, email: string): string {
    const refreshToken = config.refreshToken;
    if (!refreshToken)
      throw new InternalError('Missing access refresh token enviroment variable');
    return jwt.sign({ id, name, email }, refreshToken, { expiresIn: '7d'});
  }
}
