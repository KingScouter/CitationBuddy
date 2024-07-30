import { GuildConfig } from './guild-config';
import { GuildMessageConfig } from './message-config';

export interface FullGuildConfig {
  generalConfig: GuildConfig;
  messageConfig: GuildMessageConfig;
}
