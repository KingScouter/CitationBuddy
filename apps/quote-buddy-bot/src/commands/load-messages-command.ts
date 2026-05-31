import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';
import { BotUtils } from '../bot-utils';

export default {
  data: new SlashCommandBuilder()
    .setName('load-messages')
    .setDescription('Load all messages for the configured quote channel'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply('No guild available!');
      return;
    }

    const messages = await ChannelMessagesCacheService.fetchMessages(guildId);
    console.log(`Got ${messages?.size} number of messages`);
    await interaction.reply(`Got ${messages?.size} number of messages`);

    BotUtils.autoDeleteReply(interaction);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
