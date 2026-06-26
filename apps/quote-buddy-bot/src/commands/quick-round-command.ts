import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ParsedQuote } from '../models/parsed-quote';
import { initQuiz, PrepareRound } from '../quiz/quiz-handler';
import { QuizService } from '../quiz/quiz-service';
import { BotUtils } from '../bot-utils';
import { Quiz } from '../quiz/quiz';
import { QuizScoreDbService } from '@citation-buddy/db-mongodb';
import { GuildQuizScores } from '@cite/models';

const commandId = 'quick-round';
const commandIdGuess = `${commandId}-guess-`;
const commandIdEndRound = `${commandId}-endRound-`;

export default {
  data: new SlashCommandBuilder()
    .setName(commandId)
    .setDescription('Quick round of Quote-Quiz'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply('No guild available!');
      return;
    }

    await interaction.deferReply();

    let message: ParsedQuote;

    try {
      message = await initQuiz(guildId);
    } catch (err: unknown) {
      let errMsg =
        err instanceof Error ?
          err.message
        : `Error during quiz init: ${JSON.stringify(err)}`;
      await interaction.editReply(errMsg);

      return;
    }

    const quiz = QuizService.getInstance().startQuiz(guildId);

    const { round, components } = await PrepareRound(
      quiz,
      commandIdGuess,
      true
    );

    if (!round || !components) {
      await BotUtils.sendAutoDeleteEditReply(
        interaction,
        'Error while trying to start a round'
      );
      return;
    }

    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(commandIdEndRound)
          .setLabel('Runde beenden')
          .setStyle(ButtonStyle.Danger)
      )
    );

    const response = await interaction.editReply({
      content: round.getMessage(),
      components,
    });
    round.messageId = response.id;
  },
  handleFollowup: async (interaction: BaseInteraction): Promise<boolean> => {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith(`${commandId}-`)
    ) {
      return false;
    }

    const quiz = QuizService.getInstance().getQuiz(interaction.guildId ?? '');
    if (!quiz) {
      await interaction.reply('Aktuell läuft kein Quiz');
      return true;
    }

    if (interaction.customId === commandIdEndRound) {
      await handleEndRound(interaction, quiz);
      return true;
    } else if (interaction.customId.startsWith(commandIdGuess)) {
      await handleQuizGuess(interaction, quiz);
      return true;
    }

    return false;
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;

/**
 * Handle a new guess for the active quiz
 * @param interaction Interaction
 * @param quiz Active quiz
 * @returns {Promise<boolean>} True if everything went well, otherwise false
 */
async function handleQuizGuess(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<boolean> {
  const name = BotUtils.getUsername(interaction);
  const displayName = BotUtils.getUserDisplayName(interaction);
  if (!quiz.addUser(name, displayName)) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Du hast deine Stimme bereits abgegeben!'
    );
    return true;
  }
  if (!quiz.addGuess(displayName, interaction.customId)) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Du nimmt an diesem Quiz aktuell nicht teil!'
    );
    return true;
  }

  const round = quiz.currRound;
  if (!round) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Aktuell läuft keine Runde!'
    );
    return true;
  }
  await interaction.deferUpdate();

  const roundMessage = round.getMessage();

  await interaction.message.edit({
    content: roundMessage,
  });

  return true;
}

async function handleEndRound(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<boolean> {
  const round = quiz.currRound;
  if (!round) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Aktuell läuft keine Runde!'
    );
    return true;
  }
  await interaction.deferUpdate();

  const roundSolution = round.correct;
  const result = quiz.resolveRound();
  if (!result) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Fehler beim Beenden der Runde!'
    );
    return true;
  }

  QuizService.getInstance().endQuiz(quiz);

  // Add correct guesses to global scoreboard
  let guildScores = await QuizScoreDbService.getGuildScores(quiz.guildId);
  if (!guildScores) {
    guildScores = new GuildQuizScores(quiz.guildId);
  }
  result.correctUsers.forEach(elem => {
    const user = quiz.getUser(elem);
    guildScores.addGuessWin(user.username, user.displayName);
  });
  await QuizScoreDbService.addOrUpdateConfig(guildScores);

  const components = interaction.message.components
    .map(row => {
      if (row.type !== ComponentType.ActionRow) {
        return row;
      }
      const oldSubComps = row.components;
      const newComps = oldSubComps
        .map(subElem => {
          if (subElem.type !== ComponentType.Button) {
            return null;
          }
          const btn = ButtonBuilder.from(subElem).setDisabled(true);
          if (subElem.label === roundSolution) {
            btn.setStyle(ButtonStyle.Success);
          }
          return btn;
        })
        .filter(elem => !!elem);
      const newRow = ActionRowBuilder.from(row)
        .setComponents(...newComps)
        .toJSON();
      return newRow;
    })
    .filter(elem => !!elem);
  const finalRoundMsg = round.getMessage(true);

  let resultsText = '';
  const correctUsersText = result.correctUsers
    .map(elem => quiz.getUserDisplayname(elem))
    .join(', ');
  const incorrectUsersText = result.wrongUsers
    .map(elem => `${quiz.getUserDisplayname(elem.user)} ("*${elem.answer}*")`)
    .join(', ');
  if (!result.wrongUsers.length && result.correctUsers.length) {
    // All correct
    resultsText = `:white_check_mark: Alle haben's erraten! *(Das war wohl zu einfach)*`;
  } else if (result.wrongUsers.length && !result.correctUsers.length) {
    // All incorrect
    resultsText = `:x: **Niemand hat*s erraten, wie peinlich!**\n:no_entry_sign: **Falsch geraten:** ${incorrectUsersText}`;
  } else {
    // Some correct
    resultsText = `:white_check_mark:**Richtig geraten:** ${correctUsersText}\n:no_entry_sign: **Falsch geraten:** ${incorrectUsersText}`;
  }
  // resultsText += `\n\n**Aktueller Punktestand:**\n${quiz.getScoreMessage()}`;

  const finalMessage = `**Runde beendet!**.\n\nDie korrekte Antwort war: ***${roundSolution}***\n${resultsText}`;

  await interaction.message.edit({
    content: finalRoundMsg + finalMessage,
    components: components,
  });

  // await interaction.followUp({
  //   content: `**Runde beendet!**.\n\nDie korrekte Antwort war: ***${roundSolution}***\n${resultsText}`,
  // });
  return true;
}
