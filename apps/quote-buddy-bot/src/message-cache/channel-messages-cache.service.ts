import { Collection, Message } from 'discord.js';
import { ChannelMessageCache } from './models/channel-message-cache';
import { GuildConfigDbService } from '@citation-buddy/config';

export class ChannelMessagesCacheService {
  private static instance: ChannelMessagesCacheService;

  static getInstance(): ChannelMessagesCacheService {
    if (!this.instance) {
      this.instance = new ChannelMessagesCacheService();
    }

    return this.instance;
  }

  private readonly messages = new Map<string, ChannelMessageCache>();

  static async fetchMessages(
    guildId: string
  ): Promise<Collection<string, Message> | null> {
    const config = await GuildConfigDbService.getInstance().getConfig(guildId);
    const channelId = config.citeChannelId;
    if (!channelId) {
      return null;
    }

    let guildInstance = this.getInstance().messages.get(guildId);
    if (!guildInstance) {
      guildInstance = new ChannelMessageCache(guildId, channelId);
    }

    if (guildInstance.messages.size === 0) {
      return guildInstance.fetchMessages();
    }

    return guildInstance.messages;
  }

  static getMessages(guildId: string): Collection<string, Message> | null {
    const guildInstance = this.getInstance().messages.get(guildId);
    if (!guildInstance) {
      return null;
    }

    return guildInstance.messages;
  }
}
