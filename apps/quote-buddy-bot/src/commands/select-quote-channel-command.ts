import {
  ChannelType,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  MessagePayload,
  SlashCommandBuilder,
} from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { GuildConfigDbService } from '@citation-buddy/config';

const channelOption = 'channelinput';

export default {
  data: new SlashCommandBuilder()
    .setName('select-channel')
    .setDescription('Select the channel to read the quotes from.')
    .addChannelOption(option =>
      option
        .setName(channelOption)
        .setDescription('The channel to echo into')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const selectedChannel = interaction.options.getChannel(channelOption);
    if (!selectedChannel || !interaction.guildId) {
      await interaction.reply('No channel selected');
      return;
    }

    const config = await GuildConfigDbService.getInstance().getConfig(
      interaction.guildId
    );
    config.citeChannelId = selectedChannel.id;
    await GuildConfigDbService.getInstance().setConfig(config);

    await interaction.reply({
      content: `Selected channel: ${selectedChannel.name}`,
      flags: 'Ephemeral',
    } satisfies InteractionReplyOptions);
    setTimeout(() => {
      interaction.deleteReply();
    }, 3000);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
