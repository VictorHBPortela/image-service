import bcrypt from 'bcrypt';
import config from '../config/config';
import { InternalError } from '../errors/MainErrors';
import jwt from 'jsonwebtoken';

export interface ILoginService {
  createHash(password: string, saltRounds?: number): Promise<string>;
  passwordMatchesHash(password: string, hash: string): Promise<boolean>;
  signToken(name: string, email: string): string;
  signRefreshToken(name: string, email: string): string;
  isTokenExpired(token: string): boolean;
}

export class LoginService implements ILoginService {
  async createHash(password: string, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async passwordMatchesHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  signToken(name: string, email: string): string {
    const accessToken = config.accessToken;
    if (!accessToken)
      throw new InternalError('Missing access token enviroment variable');
    return jwt.sign({ name, email }, accessToken, { expiresIn: '15m'});
  }

  signRefreshToken(name: string, email: string): string {
    const refreshToken = config.refreshToken;
    if (!refreshToken)
      throw new InternalError('Missing access refresh token enviroment variable');
    return jwt.sign({ name, email }, refreshToken, { expiresIn: '7d'});
  }

  isTokenExpired(token: string): boolean {
    let expiresIn = 0;
    const jwtPayload = jwt.decode(token);
    if (jwtPayload && typeof jwtPayload !== 'string') {
      const { exp = 0 } = jwtPayload;
      expiresIn = exp;
    }

    if (Date.now() >= expiresIn * 1000) {
     return true;
    }

    return false
  } 
}
