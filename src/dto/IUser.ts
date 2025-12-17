import { Model, Types } from 'mongoose';

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose models do not have an explicit generic parameter for statics. If your model has statics,
 * we recommend creating an interface that extends Mongoose's Model interface as shown below.
 */
interface IUserModelType extends Model<IUser> {
  comparePassword(name: string): boolean;
}

export { IUser, IUserModelType };
