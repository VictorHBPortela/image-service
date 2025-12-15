import { IUser } from '../dto/IUser';
import { User } from '../schemas/user';

export interface IUserRepository {
  create(name: string, email: string, password: string): Promise<void>;
  findCredentials(email: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async create(name: string, email: string, password: string): Promise<void> {
    await User.create({ name, email, password });
  }

  async findCredentials(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select('+password');
  }
}
