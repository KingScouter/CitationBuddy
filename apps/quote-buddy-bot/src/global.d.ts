/* eslint-disable no-var */
import { Client, Collection } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import MessageCommand from '../models/message-command';

interface DiscordClient extends Client {
  commands: Collection<string, ApplicationCommand>;
  msgCommands: Collection<string, MessageCommand>;
}

declare global {
  var client: DiscordClient;

  type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}

export {};
