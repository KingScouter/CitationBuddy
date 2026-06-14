import { AdditionalContext } from './additional-context';

export interface GuildConfig {
  guildId: string;
  citeChannelId: string | null;
  additionalContexts: AdditionalContext[];
}
