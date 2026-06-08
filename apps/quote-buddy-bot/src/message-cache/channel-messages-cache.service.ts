import { Collection } from 'discord.js';
import { ChannelMessageCache } from './models/channel-message-cache';
import { GuildConfigDbService } from '@citation-buddy/config';
import { ParsedQuote } from '../models/parsed-quote';

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
  ): Promise<ChannelMessageCache | null> {
    const config = await GuildConfigDbService.getInstance().getConfig(guildId);
    const channelId = config.citeChannelId;
    if (!channelId) {
      return null;
    }

    let guildInstance = this.getInstance().messages.get(guildId);
    if (!guildInstance) {
      guildInstance = new ChannelMessageCache(guildId, channelId);
      this.getInstance().messages.set(guildId, guildInstance);
    }

    if (guildInstance.messages.size === 0) {
      console.log('MessageCacheService - No messages, fetch new');
      await guildInstance.fetchMessages();
    } else {
      console.log('MessageCacheService - Messages already fetched');
    }

    return guildInstance;
  }
}
