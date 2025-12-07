import { Db, MongoClient } from 'mongodb';
import config from './config';

export class MongoConnection {
  private static instance: MongoConnection | null = null;
  public readonly uri: string;
  private client: MongoClient | null;

  private constructor() {
    this.uri = config.mongoUri;
    this.client = null;
  }

  async connect(): Promise<MongoClient> {
    try {
      if (this.client) {
        return this.client;
      }
      this.client = new MongoClient(this.uri);

      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });

      console.log('Connection to MongoDB successful!');
      return this.client;
    } catch (error) {
      this.client = null;
      throw new Error(
        `MongoDB connection error: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
    }
  }

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('No client assigned use method connect()');
    }
    return this.client;
  }

  public getDatabase(dbName?: string): Db {
    const client = this.getClient();
    return dbName ? client.db(dbName) : client.db();
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      console.log('MongoDB connection closed.');
    }
  }
}
