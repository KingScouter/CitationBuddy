import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  TextChannel,
  ThreadAutoArchiveDuration,
} from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { QuizService } from '../quiz/quiz-service';
import { BotUtils } from '../bot-utils';
import { Quiz } from '../quiz/quiz';
import { QuizScoreDbService } from '@citation-buddy/db-mongodb';
import { GuildQuizScores } from '@cite/models';
import { initQuiz, PrepareRound } from '../quiz/quiz-handler';
import { ParsedQuote } from '../models/parsed-quote';

const commandId = 'quiz';
const commandIdGuess = `${commandId}-guess-`;
const commandIdStartQuiz = `${commandId}-startQuiz-`;
const commandIdJoinQuiz = `${commandId}-joinQuiz-`;
const commandIdNextRound = `${commandId}-nextRound-`;
const commandIdEndQuiz = `${commandId}-endQuiz-`;

export default {
  data: new SlashCommandBuilder()
    .setName(commandId)
    .setDescription('Start quiz with a random quote'),
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

    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) {
      await BotUtils.sendAutoDeleteEditReply(
        interaction,
        'Channel must be a text channel!'
      );
      return;
    }

    // Start quiz
    const quiz = QuizService.getInstance().startQuiz(guildId);

    const buttons = [
      new ButtonBuilder()
        .setCustomId(`${commandIdJoinQuiz}`)
        .setLabel('Mitmachen')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${commandIdStartQuiz}`)
        .setLabel('Quiz starten')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
    ];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
    const joinMessage = await interaction.editReply({
      content: quiz.getJoinMessage(),
      components: [row],
    });
    quiz.joinMessageId = joinMessage.id;
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

    if (interaction.customId === commandIdJoinQuiz) {
      await handleJoinQuiz(interaction, quiz);
      return true;
    } else if (interaction.customId === commandIdStartQuiz) {
      await handleStartQuiz(interaction, quiz);
      return true;
    } else if (interaction.customId === commandIdNextRound) {
      await handleNextRound(interaction, quiz);
      return true;
    } else if (interaction.customId === commandIdEndQuiz) {
      await handleEndQuiz(interaction, quiz);
      return true;
    } else if (interaction.customId.startsWith(commandIdGuess)) {
      return await handleQuizGuess(interaction, quiz);
    }

    return false;
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;

/**
 * Handle an interaction to end the current quiz.
 * @param interaction Interaction
 * @param quiz Quiz to end
 */
async function handleEndQuiz(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<void> {
  await interaction.deferUpdate();

  let msg = `**Quiz beendet!**\n\n**Finaler Score:**\n${quiz.getScoreMessage()}\n\n`;

  const scores = quiz.scores;
  const highScore = Math.max(...scores.map(elem => elem[1]));
  const lowScore = Math.min(...scores.map(elem => elem[1]));

  const winners = scores
    .filter(elem => elem[1] === highScore)
    .map(elem => elem[0]);
  const losers = scores
    .filter(elem => elem[1] === lowScore)
    .map(elem => elem[0]);

  if (highScore === 0) {
    msg += `Niemand hat irgendwas erraten *(also mir wär das echt peinlich)*!`;
  } else if (highScore === lowScore) {
    msg += `**Gleichstand!** Karl Marx wäre stolz auf euch!`;
  } else {
    if (winners.length > 1) {
      msg += `:crown: Die großen Gewinner sind:`;
    } else {
      msg += `:crown: Der große Gewinner ist:`;
    }
    msg += ` **${winners.join(', ')}**\n`;

    if (losers.length > 0) {
      msg += `:anger: Wer kennt sich am wenigsten aus: **${losers.join(', ')}**`;
    }
  }

  let guildScores = await QuizScoreDbService.getGuildScores(quiz.guildId);
  if (!guildScores) {
    guildScores = new GuildQuizScores(quiz.guildId);
  }
  winners.forEach(elem => {
    const user = quiz.getUser(elem);
    guildScores.addQuizWin(user.username, user.displayName);
  });
  await QuizScoreDbService.addOrUpdateConfig(guildScores);

  QuizService.getInstance().endQuiz(quiz);

  await BotUtils.disableMessageButtons(interaction);

  await interaction.followUp(msg);
}

/**
 * Handle an interaction for starting the next round in a quiz.
 * @param interaction Interaction
 * @param quiz Active quiz
 */
async function handleNextRound(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<void> {
  await interaction.deferReply();

  const { round, components } = await PrepareRound(quiz, commandIdGuess, false);

  if (!round || !components) {
    await BotUtils.sendAutoDeleteFollowUp(
      interaction,
      'Error while trying to start a round'
    );
    await interaction.editReply({});
    return;
  }

  const response = await interaction.editReply({
    content: round.getMessage(),
    components,
  });
  round.messageId = response.id;
}

/**
 * Handle an interaction for joining the active quiz.
 * Adds the interaction-user as a player to the active quiz.
 * @param interaction Interaction
 * @param quiz Active quiz
 */
async function handleJoinQuiz(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<void> {
  const displayName = BotUtils.getUserDisplayName(interaction);
  const username = BotUtils.getUsername(interaction);

  if (quiz.addUser(username, displayName)) {
    await interaction.deferUpdate();
    if (quiz.players.length === 1) {
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

              const btn = ButtonBuilder.from(subElem);
              if (subElem.customId === commandIdStartQuiz) {
                btn.setDisabled(false);
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

      await interaction.message.edit({
        content: quiz.getJoinMessage(),
        components: components,
      });
    } else {
      interaction.message.edit(quiz.getJoinMessage());
    }
  } else {
    await BotUtils.sendAutoDeleteReply(interaction, 'Du bist bereits dabei!');
  }
}

/**
 * Handle an interaction for starting the active quiz.
 * Starts the prepared quiz by opening a new thread and posting the first
 * round there.
 * @param interaction Interaction
 * @param quiz Active quiz
 */
async function handleStartQuiz(
  interaction: ButtonInteraction,
  quiz: Quiz
): Promise<void> {
  const channel = interaction.channel;
  if (!(channel instanceof TextChannel)) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Channel must be a text channel!'
    );
    return;
  }

  await interaction.deferUpdate();

  const thread = await interaction.message.startThread({
    name: 'Quiz',
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
  });

  const { round, components } = await PrepareRound(quiz, commandIdGuess, false);

  if (!round || !components) {
    await BotUtils.sendAutoDeleteFollowUp(
      interaction,
      'Error while trying to start a round'
    );
    return;
  }

  const response = await thread.send({
    content: round.getMessage(),
    components,
  });
  round.messageId = response.id;

  await BotUtils.removeMessageButtons(
    interaction,
    `Quiz gestartet!\n\n**Teilnehmer:** ${quiz.playerDisplayNames.join(', ')}`
  );
}

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
  if (!quiz.addGuess(name, interaction.customId)) {
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

  if (!quiz.isFinished()) {
    await interaction.message.edit({
      content: roundMessage,
    });

    return true;
  }

  const roundSolution = round.correct;
  const result = quiz.resolveRound();
  if (!result) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Fehler beim Beenden der Runde!'
    );
    return true;
  }

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

  await interaction.message.edit({
    content: finalRoundMsg,
    components: components,
  });

  const roundEndButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(commandIdNextRound)
      .setLabel('Nächste Runde')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(commandIdEndQuiz)
      .setLabel('Quiz beenden')
      .setStyle(ButtonStyle.Danger)
  );

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

  resultsText += `\n\n**Aktueller Punktestand:**\n${quiz.getScoreMessage()}`;

  await interaction.followUp({
    content: `**Runde beendet!**.\n\nDie korrekte Antwort war: ***${roundSolution}***\n${resultsText}\n\nNächste Runde?`,
    components: [roundEndButtons],
  });
  return true;
}
