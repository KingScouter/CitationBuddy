import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { printScores } from '@cite/models';
import { QuizScoreDbService } from '@citation-buddy/db-mongodb';

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

    const guildScores = await QuizScoreDbService.getGuildScores(guildId);
    if (!guildScores) {
      await interaction.reply('Kein Punktestand vorhanden für diesen Server!');
      return;
    }

    const msg = `**Quiz Gewinne:**\n${printScores(guildScores.quizScores)}\n\n**Rate Gewinne (einzeln):**\n${printScores(guildScores.guessScores)}`;
    await interaction.reply(msg);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
