import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../models/application-command';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function hidePersonInCitation(msg: string): string | null {
  if (!msg) {
    return msg;
  }

  const citeRegex = /(.*\n)(.*),(\s?\d+)(,?s?.*)/gms;
  const regexRes = citeRegex.exec(msg);
  if (!regexRes) {
    return null;
  }

  const partMsg = regexRes[1];
  let partPerson = regexRes[2];
  let partYear = regexRes[3];
  let partCtx = regexRes[4];

  if (partMsg === undefined || partPerson === undefined) {
    return msg;
  }

  partPerson = `||${partPerson}||`;
  partYear = `||${partYear}||`;
  if (partCtx) partCtx = `||${partCtx}||`;

  const additionalInfoPart = '';

  const parsedMsg = `${partMsg}${partPerson}${partYear}${partCtx}${additionalInfoPart}`;

  return parsedMsg;
}

export default {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Start quiz with a random quote'),
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply('No guild available!');
      return;
    }
    const messages = await ChannelMessagesCacheService.fetchMessages(guildId);
    if (!messages || messages.size === 0) {
      await interaction.reply('No messages available!');
      return;
    }

    const randomIdx = Math.floor(
      Math.random() * randomNumber(0, messages.size - 1)
    );

    const message = messages.random();

    const parsedMessage = hidePersonInCitation(message?.content ?? '');
    if (!parsedMessage) {
      await interaction.reply('Quiote invalid!');
      return;
    }

    await interaction.reply(parsedMessage);
  },
  hasSubCommands: false,
} satisfies ApplicationCommand;
