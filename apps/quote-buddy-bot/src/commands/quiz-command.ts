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
} from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';
import { QuizUsers } from '../models/quiz-users';
import { Quiz, QuizOption, QuizService } from '../quiz/quiz-service';
import { BotUtils } from '../bot-utils';

const commandId = 'quiz';

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
    const messageCache =
      await ChannelMessagesCacheService.fetchMessages(guildId);
    if (!messageCache?.messages || messageCache?.messages.size === 0) {
      await interaction.reply('No messages available!');
      return;
    }

    const message = messageCache.messages.random();

    if (!message) {
      await interaction.reply('No quote found!');
      return;
    }

    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) {
      await BotUtils.sendAutoDeleteReply(
        interaction,
        'Channel must be a text channel!'
      );
      return;
    }

    // Start quiz
    const quiz = QuizService.getInstance().startQuiz(guildId);
    const name = BotUtils.getUsername(interaction);
    quiz.addUser(name);

    const buttons = [
      new ButtonBuilder()
        .setCustomId(`${commandId}-joinQuiz`)
        .setLabel('Mitmachen')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${commandId}-startQuiz`)
        .setLabel('Quiz starten')
        .setStyle(ButtonStyle.Success),
    ];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
    await interaction.reply({
      content: 'Quiz wird gestartet. Wer will teilnehmen?',
      components: [row],
    });
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
      await interaction.reply('No quiz running');
      return true;
    }

    if (interaction.customId === `${commandId}-joinQuiz`) {
      await handleJoinQuiz(interaction, quiz);
      return true;
    } else if (interaction.customId === `${commandId}-startQuiz`) {
      await handleStartQuiz(interaction, quiz);
      return true;
    }

    return await handleQuizGuess(interaction, quiz);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;

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
  const username = BotUtils.getUsername(interaction);

  if (quiz.addUser(username)) {
    await BotUtils.sendAutoDeleteReply(interaction, 'Quiz beigetreten!');
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

  const thread = await channel.threads.create({
    name: 'quiz',
  });

  await thread.send('Quiz message');

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply('No guild available!');
    return;
  }
  const messageCache = await ChannelMessagesCacheService.fetchMessages(guildId);
  if (!messageCache?.messages || messageCache?.messages.size === 0) {
    await interaction.reply('No messages available!');
    return;
  }

  const message = messageCache.messages.random();

  if (!message) {
    await interaction.reply('No quote found!');
    return;
  }

  const persons = new Set<string>();
  QuizUsers.defaultUsers.forEach(elem => persons.add(elem.name));
  const randomUsers = messageCache.getRandomUsers(3, message.person);
  randomUsers.forEach(elem => persons.add(elem));

  let idx = 0;
  const quizOptions: QuizOption[] = Array.from(persons.values()).map(
    elem =>
      ({ id: `${commandId}-guess-${idx++}`, label: elem }) satisfies QuizOption
  );

  const buttons = quizOptions.map(choice => {
    return new ButtonBuilder()
      .setCustomId(choice.id)
      .setLabel(choice.label)
      .setStyle(ButtonStyle.Primary);
  });

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  while (buttons.length) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...buttons.slice(0, 4)
    );
    buttons.splice(0, 4);

    rows.push(row);
  }

  const round = quiz.startRound(
    quizOptions,
    message.person,
    message.toAnonymString()
  );
  if (!round) {
    await BotUtils.sendAutoDeleteReply(
      interaction,
      'Error while trying to start a round'
    );
    return;
  }

  const response = await thread.send({
    content: round.getMessage(),
    components: rows,
  });
  round.messageId = response.id;

  await BotUtils.sendAutoDeleteReply(interaction, 'Quiz started');
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

  // Send reply
  await BotUtils.sendAutoDeleteReply(interaction, 'Stimme abgegeben!');

  const round = quiz.currRound;
  if (!round) {
    return true;
  }

  const roundMessage = round.getMessage();

  if (quiz.isFinished()) {
    const roundSolution = round.correct;
    const result = quiz.resolveRound();

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

    await interaction.message.edit({
      content: roundMessage,
      components: components,
    });

    await interaction.followUp(
      `Quiz ended.\nCorrect answers by: ${result?.correctUsers.join(', ')}\nWrong guesses by: ${result?.wrongUsers.map(elem => `${elem.user} (${elem.answer})`).join(', ')}`
    );
    return true;
  }

  await interaction.message.edit({
    content: roundMessage,
  });

  return true;
}
