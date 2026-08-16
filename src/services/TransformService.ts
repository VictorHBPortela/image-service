import sharp, { Matrix3x3 } from 'sharp';
import { ITransformOptions } from '../dto/ITransformOptions';

const SEPIA_MATRIX: Matrix3x3 = [
  [0.3588, 0.7044, 0.1368],
  [0.299, 0.587, 0.114],
  [0.2392, 0.4696, 0.0912],
];

interface ITransformService {
  transform(buffer: Buffer, options: ITransformOptions): Promise<Buffer>;
}

class TransformService implements ITransformService {
  async transform(buffer: Buffer, options: ITransformOptions): Promise<Buffer> {
    let pipeline = sharp(buffer);

    if (options.resize) {
      const { width, height, fit } = options.resize;
      pipeline = pipeline.resize(width, height, { fit });
    }

    if (options.crop) {
      pipeline = pipeline.extract(options.crop);
    }

    if (options.rotate !== undefined) {
      pipeline = pipeline.rotate(options.rotate);
    }

    if (options.flip) {
      pipeline = pipeline.flip();
    }

    if (options.mirror) {
      pipeline = pipeline.flop();
    }

    if (options.filters?.grayscale) {
      pipeline = pipeline.grayscale();
    }

    if (options.filters?.sepia) {
      pipeline = pipeline.recomb(SEPIA_MATRIX);
    }

    if (options.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: options.compress?.quality });
    } else if (options.format === 'webp') {
      pipeline = pipeline.webp({ quality: options.compress?.quality });
    } else if (options.format === 'png') {
      pipeline = pipeline.png();
    } else if (options.compress) {
      pipeline = pipeline.jpeg({ quality: options.compress.quality });
    }

    return pipeline.toBuffer();
  }
}

export { TransformService, ITransformService };
