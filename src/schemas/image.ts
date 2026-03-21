import { model, Schema } from 'mongoose';
import { IImage } from '../dto/IImage';

const imageSchema = new Schema<IImage>(
  {
    originalName: { type: String, required: true },
    imageId: { type: String, required: false, unique: true },
    imageUrl: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export const Image = model<IImage>('images', imageSchema);
