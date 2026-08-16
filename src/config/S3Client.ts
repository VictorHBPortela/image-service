import { S3Client } from '@aws-sdk/client-s3';
import config from './config';
import { UnauthorizedError } from '../errors/MainErrors';

export function s3Client(): { s3: S3Client; bucketName: string } {
  const { accessKeyId, secretAccessKey, bucketRegion, bucketName } = config;
  if (!accessKeyId || !secretAccessKey)
    throw new UnauthorizedError('Missing AWS credentials');
  const s3 = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    region: bucketRegion,
  });

  return { s3, bucketName };
}
