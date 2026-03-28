import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from '../config/config';
import { UnauthorizedError } from '../errors/MainErrors';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateImageId } from './generateImageId';
import { IImage } from '../dto/IImage';

const urlExpirationInSeconds = 86400;

export async function awsS3Upload(file: Express.Multer.File): Promise<IImage | void> {
  const { accessKeyId, secretAccessKey, bucketRegion, bucketName } = config;
  if (accessKeyId && secretAccessKey) {
    const s3 = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region: bucketRegion,
    });

    const imageId = generateImageId()

    const params = {
      Bucket: bucketName,
      Key: imageId,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: urlExpirationInSeconds });
    await s3.send(command);
    
    return { imageUrl: url, originalName: file.originalname, imageId }
  } else {
    throw new UnauthorizedError('Missing AWS credentials');
  }
}
