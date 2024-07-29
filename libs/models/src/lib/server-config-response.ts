import { APIChannel } from 'discord-api-types/v10';
import { GuildConfig } from './guild-config';

interface ServerInfo {
  availableChannels: APIChannel[];
}

export type ServerConfigResponse = GuildConfig & ServerInfo;
