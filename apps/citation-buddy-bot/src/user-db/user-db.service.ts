import { DiscordUser } from './models/discord-user';

export class UserDbService {
  private users = new Map<string, DiscordUser>();

  getUser(id: string): DiscordUser {
    return this.users.get(id);
  }

  addUser(user: DiscordUser): void {
    this.users.set(user.id, user);
  }
}
