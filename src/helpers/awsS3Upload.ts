import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from '../config/config';
import { UnauthorizedError } from '../errors/MainErrors';

export async function awsS3Upload(file: Express.Multer.File): Promise<void> {
  const { accessKeyId, secretAccessKey, bucketRegion, bucketName } = config;
  if (accessKeyId && secretAccessKey) {
    const s3 = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region: bucketRegion,
    });

    const params = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);
  } else {
    throw new UnauthorizedError('Missing AWS credentials');
  }
}
