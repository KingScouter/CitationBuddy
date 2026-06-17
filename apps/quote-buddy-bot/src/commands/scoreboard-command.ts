import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { QuizScoreDbService } from '@quote-buddy/db-json';
import { printScores } from '@cite/models';

const commandId = 'scoreboard';

export default {
  data: new SlashCommandBuilder()
    .setName(commandId)
    .setDescription('Print the scoreboards for quizes and quote guesses!'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply('No guild available!');
      return;
    }

    const guildScores = await QuizScoreDbService.getGuild(guildId);

    const msg = `**Quiz Gewinne:**\n${printScores(guildScores.quizScores)}\n\n**Rate Gewinne (einzeln):**\n${printScores(guildScores.guessScores)}`;
    await interaction.reply(msg);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
