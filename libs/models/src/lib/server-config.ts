import { MessageConfig } from './message-config';

export interface ServerConfig {
  guildId: string;
  citeChannelId: string;
  additionalContexts: string[];
  messageConfigs: MessageConfig[];
}
