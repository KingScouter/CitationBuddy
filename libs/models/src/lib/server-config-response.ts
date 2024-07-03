import { APIChannel } from 'discord-api-types/v10';

export interface ServerConfigResponse {
  citeChannelName: string;
  numberIgnoredMessages: number;
  availableChannels: APIChannel[];
}
