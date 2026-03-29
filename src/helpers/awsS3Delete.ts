import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import config from '../config/config';
import { UnauthorizedError } from '../errors/MainErrors';
import { IImage } from '../dto/IImage';

export async function awsS3Delete(imageId: string): Promise<IImage | void> {
  const { accessKeyId, secretAccessKey, bucketRegion, bucketName } = config;
  if (accessKeyId && secretAccessKey) {
    const s3 = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region: bucketRegion,
    });

    const params = {
      Bucket: bucketName,
      Key: imageId,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    
    return
  } else {
    throw new UnauthorizedError('Missing AWS credentials');
  }
}
