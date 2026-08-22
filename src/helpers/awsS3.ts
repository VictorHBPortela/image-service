import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateImageId } from './generateImageId';
import { IImage } from '../dto/IImage';
import { s3Client } from '../config/S3Client';
import { resolveImageContentType } from './fileFilter';

const { s3, bucketName } = s3Client();

async function awsS3Upload(file: Express.Multer.File): Promise<IImage | void> {
  const imageId = generateImageId();
  const contentType = resolveImageContentType(file) ?? file.mimetype;

  const params = {
    Bucket: bucketName,
    Key: imageId,
    Body: file.buffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  await s3.send(command);

  return { imageUrl: url, originalName: file.originalname, imageId };
}

async function awsS3Update(fileBuffer: Buffer, imageId: string): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: imageId,
    Body: fileBuffer,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);
}

async function awsS3Delete(imageId: string): Promise<IImage | void> {
  const params = {
    Bucket: bucketName,
    Key: imageId,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);

  return;
}

async function awsS3GetSignedUrl(imageId: string): Promise<string> {
  const params = {
    Bucket: bucketName,
    Key: imageId,
  };

  const command = new GetObjectCommand(params);
  return await getSignedUrl(s3, command);
}

async function awsS3GetObject(
  imageId: string,
): Promise<GetObjectCommandOutput> {
  const params = {
    Bucket: bucketName,
    Key: imageId,
  };

  const command = new GetObjectCommand(params);
  return await s3.send(command);
}

export {
  awsS3Upload,
  awsS3Update,
  awsS3Delete,
  awsS3GetSignedUrl,
  awsS3GetObject,
};
