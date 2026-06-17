import { DiscordClient } from './models/discord-client';
import { DbClient } from '@citation-buddy/db-mongodb';

declare global {
  // eslint-disable-next-line no-var
  var client: DiscordClient;
  var dbClient: DbClient;

  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}

export {};
