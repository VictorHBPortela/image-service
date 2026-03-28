import { IUser } from '../../dto/IUser';
import { BadRequestError, ConflictError, NotFoundError } from '../../errors/MainErrors';
import { User } from '../../schemas/user';

export interface IUserRepository {
  create(
    _id: string,
    name: string,
    email: string,
    password: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<void>;
  findCredentials(email: string): Promise<IUser | null>;
  findByRefreshToken(refreshToken: string): Promise<IUser>;
  emailExists(email: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async create(
    _id: string, 
    name: string,
    email: string,
    password: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<IUser> {
    if (await this.emailExists(email)) {
      throw new ConflictError(
        'This email is already registered. Provide a new one.',
      );
    }
    return await User.create({ _id, name, email, password, accessToken, refreshToken });
  }

  async update(id: string, data: Partial<IUser>): Promise<void> {
    await User.updateOne({ _id: id }, { $set: data });
  }

  async findCredentials(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email }).select('+password').lean();
    if (!user) throw new NotFoundError('User not found with provided email.');
    return { ...user, _id: user._id.toString() };
  }

  async findByRefreshToken(refreshToken:string): Promise<IUser> {
    const user = await User.findOne({ accessToken: refreshToken });
    if (!user) throw new BadRequestError("User not found with token provided")
    return user
  }

  async emailExists(email: string): Promise<boolean> {
    return (await User.exists({ email })) !== null;
  }
}
