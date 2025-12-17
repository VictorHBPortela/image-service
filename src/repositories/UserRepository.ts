import { IUser } from '../dto/IUser';
import { ConflictError } from '../errors/MainErrors';
import { User } from '../schemas/user';

export interface IUserRepository {
  create(name: string, email: string, password: string): Promise<void>;
  findCredentials(email: string): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
  async create(name: string, email: string, password: string): Promise<void> {
    if (await this.emailExists(email)) {
      throw new ConflictError(
        'This email is already registered. Provide a new one.',
      );
    }
    await User.create({ name, email, password });
  }

  async findCredentials(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select('+password');
  }

  async emailExists(email: string): Promise<boolean> {
    return (await User.exists({ email })) !== null;
  }
}
