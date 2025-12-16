import bcrypt from 'bcrypt';

export interface ILoginService {
  createHash(password: string, saltRounds?: number): Promise<string>;
  isPasswordHashed(password: string, hash: string): Promise<boolean>;
}

export class LoginService implements ILoginService {
  async createHash(password: string, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async isPasswordHashed(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
