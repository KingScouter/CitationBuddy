import { DiscordClient } from './models/discord-client';

declare global {
  // eslint-disable-next-line no-var
  var client: DiscordClient;

  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}

export {};
