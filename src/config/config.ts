import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  accessToken: string | undefined;
  refreshToken: string | undefined;
  bucketName: string;
  bucketRegion: string;
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/',
  accessToken: process.env.ACCESS_TOKEN,
  refreshToken: process.env.REFRESH_TOKEN,
  bucketName: process.env.BUCKET_NAME || 'my-image-service-demo-s3-bucket',
  bucketRegion: process.env.BUCKET_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

export default config;
