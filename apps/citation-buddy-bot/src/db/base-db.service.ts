import { JsonDB, Config } from 'node-json-db';
import path from 'node:path';

export class BaseDbService<T> {
  private db: JsonDB;
  private readonly dbName: string;
  private readonly basePath: string = '/';
  private readonly baseDirectory = 'db';

  constructor(dbName: string) {
    this.dbName = dbName;

    this.db = new JsonDB(
      new Config(
        path.join(this.baseDirectory, this.dbName),
        true,
        false,
        this.basePath
      )
    );
  }

  async set(key: string, user: T): Promise<void> {
    await this.db.push(path.join(this.basePath, key), user, true);
  }

  async get(key: string): Promise<T | null> {
    try {
      const obj = await this.db.getObject<T>(path.join(this.basePath, key));
      return obj;
    } catch (ex) {
      console.log('Element not found', ex);
      return null;
    }
  }

  async getAll(): Promise<Record<string, T> | null> {
    try {
      const allObj = await this.db.getObject<Record<string, T>>(this.basePath);
      return allObj;
    } catch (ex) {
      console.log('No elements found', ex);
      return null;
    }
  }

  async unset(key: string): Promise<void> {
    await this.db.delete(path.join(this.basePath, key));
  }
}
