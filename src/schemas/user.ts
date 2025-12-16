import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { IUser, IUserModelType } from '../dto/IUser';
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
    try {
      // checks if password is hashed before saving
      bcrypt.getRounds(this.password);
    } catch (error) {
      throw new BadRequestError(
        `Error saving user: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  }
});

export const User = model<IUser, IUserModelType>('users', userSchema);
