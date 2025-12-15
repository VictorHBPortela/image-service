import { model, Schema } from 'mongoose';
import { IUser, IUserModelType } from '../dto/IUser';
import bcrypt from 'bcrypt';
import { BadRequestError } from '../errors/MainErrors';

const userSchema = new Schema<IUser, IUserModelType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // TODO: Create an email class with proper validation
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashRounds = bcrypt.getRounds(this.password);
    if (!hashRounds) {
      throw new BadRequestError('Something went wrong: Unhashed password');
    }
  }
});

export const User = model<IUser, IUserModelType>('users', userSchema);
