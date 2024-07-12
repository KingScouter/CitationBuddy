import { JsonDB, Config } from 'node-json-db';

export class BaseDbService<T> {
  private db: JsonDB;
  private readonly dbName: string;
  private readonly basePath: string = '/';

  constructor(dbName: string) {
    this.dbName = dbName;

    this.db = new JsonDB(new Config(this.dbName, true, false, this.basePath));
  }

  async set(key: string, user: T): Promise<void> {
    await this.db.push(`${this.basePath}${key}`, user, true);
  }

  async get(key: string): Promise<T | null> {
    try {
      const obj = await this.db.getObject<T>(`${this.basePath}${key}`);
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
    await this.db.delete(`${this.basePath}${key}`);
  }
}
