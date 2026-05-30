import { Client, Collection } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import MessageCommand from '../models/message-command';

export class DiscordClient extends Client {
  commands = new Collection<string, ApplicationCommand>();
  msgCommands = new Collection<string, MessageCommand>();
}
