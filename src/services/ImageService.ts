import { IImage } from '../dto/IImage';
import { awsS3Delete, awsS3GetObject, awsS3Upload } from '../helpers/awsS3';
import { IImageRepository } from '../repositories/image/ImageRepository';
import { NotFoundError } from '../errors/MainErrors';

export interface RetrievedImage {
  buffer: Buffer;
  contentType: string;
}

export interface IImageReader {
  getImage(imageId: string): Promise<RetrievedImage>;
}

export interface IImageService extends IImageReader {
  upload(file: Express.Multer.File, userId: string): Promise<IImage | void>;
  list(userId: string): Promise<IImage[]>;
  delete(imageId: string, userId: string): Promise<IImage | null>;
}

export class ImageService implements IImageService {
  private repository: IImageRepository;

  constructor(repository: IImageRepository) {
    this.repository = repository;
  }

  async getImage(imageId: string): Promise<RetrievedImage> {
    const object = await awsS3GetObject(imageId);
    if (!object.Body) throw new NotFoundError('Image content not found');

    const bytes = await object.Body.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: object.ContentType ?? 'application/octet-stream',
    };
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
  ): Promise<IImage | void> {
    const image = await awsS3Upload(file);
    if (image) await this.repository.save(image, userId);
    return image;
  }

  async list(userId: string): Promise<IImage[]> {
    return await this.repository.list(userId);
  }

  async delete(imageId: string, userId: string): Promise<IImage | null> {
    await awsS3Delete(imageId);
    return await this.repository.delete(imageId, userId);
  }
}
