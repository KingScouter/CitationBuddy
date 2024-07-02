import { APIGuild } from 'discord-api-types/v10';

export interface DiscordGuild {
  guild: APIGuild;
  hasBot: boolean;
}
