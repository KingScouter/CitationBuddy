import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { BotUtils } from '../bot-utils';

const testCommand: ApplicationCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong or something!'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.reply('Pongigong!');

    BotUtils.autoDeleteReply(interaction);
  },
  hasSubCommands: false,
};

export default testCommand;
