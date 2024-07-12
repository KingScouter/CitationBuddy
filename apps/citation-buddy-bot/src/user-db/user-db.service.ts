import { DiscordUser } from './models/discord-user';
import { BaseDbService } from '../bot/base-db.service';

type DiscordUsers = Record<string, DiscordUser>;

export class UserDbService {
  private static instance: UserDbService;

  private readonly dbName = 'usersDb';
  private readonly db: BaseDbService<DiscordUser>;

  /**
   * Get the singleton-instance of the UserDbService
   */
  static getInstance(): UserDbService {
    if (!this.instance) {
      this.instance = new UserDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<DiscordUser>(this.dbName);
  }

  /**
   * Set a given user in the database
   * @param user User to set
   */
  async setUser(user: DiscordUser): Promise<void> {
    await this.db.set(user.id, user);
  }

  /**
   * Get a user by ID from the database.
   * @param id ID of the user
   * @returns { Promise<DiscordUser | null> } The user from the database, otherwise null if the user could not be found.
   */
  async getUser(id: string): Promise<DiscordUser | null> {
    return this.db.get(id);
  }

  /**
   * Get all users from the database
   * @returns { Promise<DiscordUsers | null> } Object with all users from the DB, otherwise null if no users are in the DB.
   */
  async getUsers(): Promise<DiscordUsers | null> {
    return this.db.getAll();
  }

  /**
   * Remove a user by id from the database
   * @param id ID of the user to remove
   */
  async removeUser(id: string): Promise<void> {
    await this.db.unset(id);
  }
}
