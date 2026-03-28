import bcrypt from 'bcrypt';
import config from '../config/config';
import { InternalError } from '../errors/MainErrors';
import jwt from 'jsonwebtoken';

export interface ILoginService {
  createHash(password: string, saltRounds?: number): Promise<string>;
  passwordMatchesHash(password: string, hash: string): Promise<boolean>;
  signToken(id: string, name: string, email: string): string;
  signRefreshToken(id: string, name: string, email: string): string;
  isPasswordComplex(password: string): boolean;
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

  // ^                               start anchor
  // (?=(.*[a-z]){3,})               lowercase letters. {3,} indicates that you want 3 of this group
  // (?=(.*[A-Z]){1,})               uppercase letters. {1,} indicates that you want 1 of this group
  // (?=(.*[0-9]){2,})               numbers. {2,} indicates that you want 2 of this group
  // (?=(.*[!@#$%^&*()\-__+.]){1,})  all the special characters in the [] fields. The ones used by regex are escaped by using the \ or the character itself. {1,} is redundant, but good practice, in case you change that to more than 1 in the future. Also keeps all the groups consistent
  // {8,}                            indicates that you want 8 or more
  // $  
  isPasswordComplex(password: string): boolean {
    const lowerCasePattern = '(?=(.*[a-z]){3,})';
    const upperCasePattern = '(?=(.*[A-Z]){1,})';
    const numberPattern = '(?=(.*[0-9]){2,})';
    const specialCharacterPattern = '(?=(.*[!@#$%^&*()\-__+.]){1,})'

    const passwordComplexity = new RegExp(`^${lowerCasePattern}${upperCasePattern}${numberPattern}${specialCharacterPattern}.{8,}$`)
    
    return passwordComplexity.test(password)
  }
}
