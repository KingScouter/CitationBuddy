import { Db, MongoClient } from 'mongodb';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export class DbClient {
  private static readonly DB_NAME = process.env.DB_NAME ?? 'quote-buddy';

  private readonly _client: MongoClient;

  private isConnected = false;

  get db(): Db {
    return this._client.db(DbClient.DB_NAME);
  }

  protected constructor(connectionString: string) {
    this._client = new MongoClient(connectionString);
  }

  static async createGlobalClient(connectionString: string): Promise<boolean> {
    try {
      if (global.dbClient) {
        await this.closeGlobalClient();
      }

      global.dbClient = new DbClient(connectionString);
      for (let idx = 0; idx < 5; idx++) {
        console.info('Connecting to MongoDb instance...');
        const connResult = await global.dbClient.connect();
        if (connResult) {
          console.log('Connection to MongoDb instance successfully!');
          return true;
        }

        console.log(
          `Attempt #${idx + 1} to connect to MongoDb instance failed.`
        );
        delay(1000);
      }

      if (global.dbClient.isConnected) {
        return true;
      }
    } catch (ex) {
      console.error(
        'Error while trying to establish connection to MongoDb:',
        ex
      );
    }

    return false;
  }

  static async closeGlobalClient(): Promise<void> {
    try {
      if (!global.dbClient) {
        return;
      }

      if (global.dbClient.isConnected) {
        await global.dbClient.close();
      }
    } catch (ex) {
      console.error('Error while trying to close connection to MongoDb:', ex);
    }
  }

  private async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    try {
      await this._client.connect();
      this.isConnected = true;
    } catch (ex) {
      console.error('Error while connecting to MongoDB instance:', ex);
      this.isConnected = false;
    }

    return this.isConnected;
  }

  private async close(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this._client.close();
      this.isConnected = false;
    } catch (ex) {
      console.error('Error while trying to close the MongoDB connection:', ex);
    }
  }
}
