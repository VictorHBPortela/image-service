import mongoose from 'mongoose';
import config from './config';

export class MongoConnection {
  private static instance: MongoConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      await mongoose.connect(config.mongoUri);
      this.isConnected = true;
      console.log('MongoDB connection established successfully');

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });
    } catch (error) {
      this.isConnected = false;
      throw new Error(
        `MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): typeof mongoose {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return mongoose;
  }

  public checkConnection(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const mongoConnection = MongoConnection.getInstance();

export const connectDB = async (): Promise<void> => {
  await mongoConnection.connect();
};

export const disconnectDB = async (): Promise<void> => {
  await mongoConnection.disconnect();
};
