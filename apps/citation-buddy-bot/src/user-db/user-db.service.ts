import { DiscordUser } from './models/discord-user';
import { BaseDbService } from '../bot/base-db.service';

type DiscordUsers = Record<string, DiscordUser>;

export class UserDbService {
  private static instance: UserDbService;

  private readonly dbName = 'usersDb';
  private readonly db: BaseDbService<DiscordUser>;

  static getInstance(): UserDbService {
    if (!this.instance) {
      this.instance = new UserDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<DiscordUser>(this.dbName);
  }

  async setUser(user: DiscordUser): Promise<void> {
    await this.db.set(user.id, user);
  }

  async getUser(id: string): Promise<DiscordUser | null> {
    return this.db.get(id);
  }

  async getUsers(): Promise<DiscordUsers | null> {
    return this.db.getAll();
  }

  async removeUser(id: string): Promise<void> {
    await this.db.unset(id);
  }
}
