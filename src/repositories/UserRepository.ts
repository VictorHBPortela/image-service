import { Types } from 'mongoose';
import { IUser } from '../dto/IUser';
import { ConflictError, NotFoundError } from '../errors/MainErrors';
import { User } from '../schemas/user';

export interface IUserRepository {
  create(name: string, email: string, password: string): Promise<void>;
  update(id: string, data: Partial<IUser>): Promise<void>;
  findCredentials(email: string): Promise<IUser | null>;
  emailExists(email: string): Promise<boolean>;
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

  async update(id: string, data: Partial<IUser>): Promise<void> {
    await User.updateOne({ _id: id }, { $set: data });
  }

  async findCredentials(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email }).select('+password').lean();
    if (!user) throw new NotFoundError('User not found with provided email.');
    return { ...user, _id: user._id.toString() };
  }

  async emailExists(email: string): Promise<boolean> {
    return (await User.exists({ email })) !== null;
  }
}
