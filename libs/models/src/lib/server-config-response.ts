import { APIChannel } from 'discord-api-types/v10';
import { ServerConfig } from './server-config';

interface ServerInfo {
  availableChannels: APIChannel[];
}

export type ServerConfigResponse = ServerConfig & ServerInfo;
