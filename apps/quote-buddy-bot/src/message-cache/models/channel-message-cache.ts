import {
  Collection,
  FetchMessagesOptions,
  Message,
  MessageResolvable,
} from 'discord.js';

export class ChannelMessageCache {
  private readonly guildId: string;
  private readonly channelId: string;

  private _messages = new Collection<string, Message>();

  get messages(): Collection<string, Message> {
    return this._messages;
  }

  constructor(guildId: string, channelId: string) {
    this.guildId = guildId;
    this.channelId = channelId;
  }

  async fetchMessages(): Promise<Collection<string, Message> | null> {
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
    this._messages = allMessages.clone();

    return this._messages;
  }
}
