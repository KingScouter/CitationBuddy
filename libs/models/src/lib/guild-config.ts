import { AdditionalContext } from './additional-context';

export interface GuildConfig {
  guildId: string;
  citeChannelId: string;
  additionalContexts: AdditionalContext[];
}
