import {
  APIChatInputApplicationCommandInteraction,
  InteractionResponseType,
} from 'discord.js';
import { Response } from 'express';
import { InteractionResponseFlags } from 'discord-interactions';
import { BotUtils } from '../../bot-utils';
import { ServerConfig } from '@cite/models';
import { BaseChatInputCommand } from './base-chat-input-commands';

class GetRandomCitecommand extends BaseChatInputCommand {
  constructor() {
    super('random_cite', 'Get a random cite');
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig
  ): Promise<void> {
    const messages = await BotUtils.getMessages(config.citeChannelId);
    const filteredMessages = messages?.filter(elem => {
      const isIgnored = config.messageConfigs.some(
        msg => msg.id === elem.id && msg.ignored
      );
      if (isIgnored) {
        console.log('Skip exluded message: ', elem.content);
      }
      return !isIgnored;
    });

    if (!filteredMessages || filteredMessages.length <= 0) {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'No citations found!',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
      return;
    }

    const randomIdx = Math.floor(
      Math.random() * randomNumber(0, filteredMessages.length - 1)
    );
    const randomMsg = filteredMessages[randomIdx];
    const parsedMsg = hidePersonInCitation(randomMsg.content);

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: parsedMsg,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function hidePersonInCitation(msg: string): string {
  if (!msg) {
    return msg;
  }

  const citeRegex = /(.*\n)(.*),(\s?\d+)(,?s?.*)/gms;
  const regexRes = citeRegex.exec(msg);

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

  const parsedMsg = `${partMsg}${partPerson}${partYear}${partCtx}`;

  return parsedMsg;
}

export default new GetRandomCitecommand();
