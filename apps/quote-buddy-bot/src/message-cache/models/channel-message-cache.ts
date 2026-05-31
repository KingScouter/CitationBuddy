import {
  Collection,
  FetchMessagesOptions,
  Message,
  MessageResolvable,
} from 'discord.js';
import { ParsedQuote } from '../../models/parsed-quote';

export class ChannelMessageCache {
  private readonly guildId: string;
  private readonly channelId: string;

  private _messages = new Collection<string, ParsedQuote>();

  get messages(): Collection<string, ParsedQuote> {
    return this._messages;
  }

  constructor(guildId: string, channelId: string) {
    this.guildId = guildId;
    this.channelId = channelId;
  }

  async fetchMessages(): Promise<Collection<string, ParsedQuote> | null> {
    const guild = await client.guilds.fetch(this.guildId);
    if (!guild) {
      return null;
    }

    const channel = await guild.channels.fetch(this.channelId);
    if (!channel || !channel.isTextBased()) {
      return null;
    }

    let allMessages = new Collection<string, Message>();
    let lastMessageId: string | undefined;

    while (true) {
      const options: FetchMessagesOptions | MessageResolvable = {
        limit: 100,
      } satisfies FetchMessagesOptions; // Max per request
      if (lastMessageId) {
        options.before = lastMessageId;
      }

      const messages = await channel.messages.fetch(options);

      if (messages.size === 0) {
        break;
      }

      allMessages = allMessages.concat(messages);
      lastMessageId = messages.last()?.id;
    }

    this._messages.clear();
    for (const msg of allMessages.values()) {
      const parsedQuote = ParsedQuote.parse(msg.content);
      if (!parsedQuote) {
        continue;
      }

      this._messages.set(msg.id, parsedQuote);
    }

    return this._messages;
  }
}
