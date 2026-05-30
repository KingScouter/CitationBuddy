import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';

const userCommand: ApplicationCommand = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user!'),

  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.reply(
      `This command was run by ${interaction.user.username}, who joined on ${JSON.stringify(interaction.member)}.`
    );
  },
  hasSubCommands: false,
};

export default userCommand;
