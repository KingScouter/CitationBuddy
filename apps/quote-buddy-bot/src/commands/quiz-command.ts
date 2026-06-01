import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';
import { QuizUsers } from '../models/quiz-users';
import { QuizOption, QuizService } from '../quiz/quiz-service';
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

    const persons = new Set<string>();
    QuizUsers.defaultUsers.forEach(elem => persons.add(elem.name));
    const randomUsers = messageCache.getRandomUsers(3, message.person);
    randomUsers.forEach(elem => persons.add(elem));

    let idx = 0;
    const quizOptions: QuizOption[] = Array.from(persons.values()).map(
      elem =>
        ({ id: `${commandId}-${idx++}`, label: elem }) satisfies QuizOption
    );

    const buttons = quizOptions.map(choice => {
      return new ButtonBuilder()
        .setCustomId(choice.id)
        .setLabel(choice.label)
        .setStyle(ButtonStyle.Secondary);
    });

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];

    while (buttons.length) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...buttons.slice(0, 4)
      );
      buttons.splice(0, 4);

      rows.push(row);
    }

    const quiz = QuizService.getInstance().startQuiz(guildId);
    const name = BotUtils.getUsername(interaction);
    console.log('Add user to quiz: ', name);
    quiz.addUser(name);
    const round = quiz.startRound(
      quizOptions,
      message.person,
      message.toAnonymString()
    );
    if (!round) {
      await interaction.reply('Error while trying to start a round');
      return;
    }

    const response = await interaction.reply({
      content: round.getMessage(),
      components: rows,
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
      await interaction.reply('No quiz running');
      return true;
    }

    // Send reply
    await interaction.reply({
      content: 'Stimme abgegeben!',
      flags: 'Ephemeral',
    });
    BotUtils.autoDeleteReply(interaction);

    const name = BotUtils.getUsername(interaction);
    quiz.addGuess(name, interaction.customId);
    const round = quiz.currRound;
    if (round) {
      await interaction.message.edit(quiz.currRound.getMessage());
    }

    if (quiz.isFinished()) {
      const result = quiz.resolveRound();

      console.log('Result of quiz: ', result);

      await interaction.followUp(
        `Quiz ended.\nCorrect answers by: ${result?.correctUsers.join(', ')}\nWrong guesses by: ${result?.wrongUsers.map(elem => `${elem.user} (${elem.answer})`).join(', ')}`
      );
      return true;
    }

    return true;
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
