import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { GuildConfigDbService } from '@citation-buddy/config';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';

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

    const config = await GuildConfigDbService.getInstance().getConfig(guildId);
    const quoteChannelId = config.citeChannelId;

    const messages = await ChannelMessagesCacheService.fetchMessages(
      guildId,
      quoteChannelId
    );
    console.log(`Got ${messages?.size} number of messages`);
    await interaction.reply(`Got ${messages?.size} number of messages`);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
