import bcrypt from 'bcrypt';
import { model, Schema } from 'mongoose';
import { IUser, IUserModelType } from '../dto/IUser';
import { BadRequestError } from '../errors/MainErrors';

const userSchema = new Schema<IUser, IUserModelType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // TODO: Create an email class with proper validation
    password: { type: String, required: true, select: false },
    accessToken: { type: String, required: false, select: false },
    refreshToken: { type: String, required: false, select: false },
    expiresIn: { type: Number, required: false, select: false },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    try {
      // Check if password is already hashed
      bcrypt.getRounds(this.password);
    } catch (error) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
});

export const User = model<IUser, IUserModelType>('users', userSchema);
