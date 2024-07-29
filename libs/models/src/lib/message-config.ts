export interface MessageConfig {
  id: string;
  ignored: boolean;
  additionalData: Record<string, string>;
}

export interface GuildMessageConfig {
  guildId: string;
  configs: MessageConfig[];
}
