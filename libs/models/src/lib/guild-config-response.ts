import { APIChannel } from 'discord-api-types/v10';
import { GuildConfig } from './guild-config';

interface GuildInfo {
  availableChannels: APIChannel[];
}

export type GuildConfigResponse = GuildConfig & GuildInfo;
