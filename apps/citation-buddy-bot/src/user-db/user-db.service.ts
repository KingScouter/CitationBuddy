import { JsonDB, Config } from 'node-json-db';
import { DiscordUser } from './models/discord-user';

type DiscordUsers = Record<string, DiscordUser>;

export class UserDbService {
  private static instance: UserDbService;
  private db: JsonDB;
  private readonly dbName = 'usersDb';
  private readonly basePath = '/';

  static getInstance(): UserDbService {
    if (!this.instance) {
      this.instance = new UserDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.initDatabase();
  }

  async setUser(user: DiscordUser): Promise<void> {
    await this.db.push(`${this.basePath}${user.id}`, user, true);
  }

  async getUser(id: string): Promise<DiscordUser | null> {
    try {
      const user = await this.db.getObject<DiscordUser>(
        `${this.basePath}${id}`
      );
      return user;
    } catch (ex) {
      console.error('User not found', ex);
      return null;
    }
  }

  async getUsers(): Promise<DiscordUsers | null> {
    try {
      const users = await this.db.getObject<DiscordUsers>(this.basePath);
      return users;
    } catch (ex) {
      console.error('No users found', ex);
      return null;
    }
  }

  private initDatabase(): void {
    this.db = new JsonDB(new Config(this.dbName, true, false, this.basePath));
  }
}
