import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';
import { ParsedQuote } from '../models/parsed-quote';
import { QuizUsers, QuizOption } from './models';
import { Quiz } from './quiz';
import { QuizRound } from './quiz-round';

export async function initQuiz(guildId: string): Promise<ParsedQuote> {
  const messageCache = await ChannelMessagesCacheService.fetchMessages(guildId);
  if (!messageCache?.messages || messageCache?.messages.size === 0) {
    throw new Error('No messages available!');
  }

  const message = messageCache.messages.random();

  if (!message) {
    throw new Error('No quote found!');
  }

  return message;
}

/**
 * Prepares a new quiz round. Returns the prepared round and the button-components
 * for the message.
 * @param quiz Quiz
 * @returns The prepared round and components, or undefined if an error occured.
 */
export async function PrepareRound(
  quiz: Quiz,
  commandPrefix: string,
  quickRound: boolean
): Promise<{
  round?: QuizRound;
  components?: ActionRowBuilder<ButtonBuilder>[];
}> {
  const messageCache = await ChannelMessagesCacheService.fetchMessages(
    quiz.guildId
  );
  if (!messageCache?.messages || messageCache?.messages.size === 0) {
    return {};
  }

  const message = messageCache.getRandomMessage(quiz.doneMessages);

  if (!message) {
    return {};
  }

  const persons = new Set<string>();
  QuizUsers.defaultUsers.forEach(elem => persons.add(elem.name));
  const randomUsers = messageCache.getRandomUsers(3, message.person);
  randomUsers.forEach(elem => persons.add(elem));

  let idx = 0;
  const quizOptions: QuizOption[] = Array.from(persons.values()).map(
    elem =>
      ({ id: `${commandPrefix}${idx++}`, label: elem }) satisfies QuizOption
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

  const round = quiz.startRound(quizOptions, message, quickRound);
  if (!round) {
    return {};
  }

  return { round, components: rows };
}
