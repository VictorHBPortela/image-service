import { IUser } from '../dto/IUser';
import { IUserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

export interface IUserService {
  register(name: string, email: string, password: string): Promise<void>;
  login(email: string, password: string): Promise<boolean>;
}

export class UserService implements IUserService {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    await this.repository.create(name, email, hash);
  }

  async login(email: string, password: string): Promise<boolean> {
    const user = await this.repository.findCredentials(email);
    if (user) {
      return await bcrypt.compare(password, user.password);
    }
    return false;
  }
}
