import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { QuizScoreDbService, QuizScores } from '@citation-buddy/config';

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

function printScores(scores: QuizScores): string {
  if (Object.keys(scores).length === 0) {
    return 'Noch keine Ergebnisse vorhanden!';
  }

  const sortedScores = Object.values(scores).sort(
    (elemA, elemB) => elemA.score - elemB.score
  );
  const highScore = Math.max(...sortedScores.map(elem => elem.score));
  const lowScore = Math.min(...sortedScores.map(elem => elem.score));

  const msg = sortedScores
    .map(elem => {
      let val = `${elem.displayName}: ${elem.score}`;
      if (elem.score === highScore) {
        val = ':crown: ' + val;
      } else if (elem.score === lowScore) {
        val = ':anger: ' + val;
      }

      return val;
    })
    .join('\n');

  return msg;
}
