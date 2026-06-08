import {
  Collection,
  FetchMessagesOptions,
  Message,
  MessageResolvable,
} from 'discord.js';
import { ParsedQuote } from '../../models/parsed-quote';
import { QuizUsers } from '../../quiz/models/quiz-users';

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class ChannelMessageCache {
  private readonly guildId: string;
  private readonly channelId: string;

  private readonly _quoteNames = new Set<string>();

  private _messages = new Collection<string, ParsedQuote>();

  get messages(): Collection<string, ParsedQuote> {
    return this._messages;
  }

  get quoteNames(): string[] {
    return Array.from(this._quoteNames.values());
  }

  constructor(guildId: string, channelId: string) {
    this.guildId = guildId;
    this.channelId = channelId;
  }

  getRandomUsers(num: number, defaultUser: string): string[] {
    const allNames = new Set<string>([...this.quoteNames, defaultUser]);
    if (num >= allNames.size) {
      return Array.from(allNames).filter(elem => !!elem);
    }

    const allNamesArray = this.quoteNames;
    const names = new Set<string>([defaultUser]);
    while (names.size < num) {
      const randomIdx = randomNumber(0, allNamesArray.length);
      names.add(allNamesArray[randomIdx]);
    }

    return Array.from(names.values()).filter(elem => !!elem);
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
      const parsedQuote = ParsedQuote.parse(msg.content, msg.url);
      if (!parsedQuote) {
        continue;
      }

      this._messages.set(msg.id, parsedQuote);

      const name = QuizUsers.ParseName(parsedQuote.person);
      if (name) {
        this._quoteNames.add(name);
      }
    }

    return this._messages;
  }
}
