import { MessageConfig } from './message-config';

export interface ServerConfig {
  guildId: string;
  citeChannelId: string;
  excludedMessageIds: string[];
  additionalContexts: string[];
  messageConfigs: MessageConfig[];
}
