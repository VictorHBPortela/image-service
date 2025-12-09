import { model, Schema } from 'mongoose';
import { IUser, IUserModelType } from '../dto/IUser';

const userSchema = new Schema<IUser, IUserModelType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // TODO: Create an email class with proper validation
    password: { type: String, required: true, select: false },
  },
  {
    statics: {
      comparePassword(name: string) {
        return true;
      },
    },
    timestamps: true,
  },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    console.log('Check if password is hashed with bcrypt');
  }
});

export const User = model<IUser, IUserModelType>('users', userSchema);
