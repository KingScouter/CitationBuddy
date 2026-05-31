import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';

export default {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Start quiz with a random quote'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply('No guild available!');
      return;
    }
    const messages = await ChannelMessagesCacheService.fetchMessages(guildId);
    if (!messages || messages.size === 0) {
      await interaction.reply('No messages available!');
      return;
    }

    const message = messages.random();

    console.log('Loaded message: ', message);
    if (!message) {
      await interaction.reply('No quote found!');
      return;
    }

    await interaction.reply(message.toAnonymString());
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
