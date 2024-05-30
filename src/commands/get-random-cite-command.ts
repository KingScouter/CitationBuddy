import {
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { ApiCommand } from './models/api-command';
import { Response } from 'express';
import { InteractionResponseFlags } from 'discord-interactions';
import { ChannelUtils } from '../channel-utils';
import { ServerConfig } from 'src/models';

class GetRandomCitecommand extends ApiCommand {
  constructor() {
    super('random_cite', 'Get a random cite', ApplicationCommandType.ChatInput);
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void> {
    const messages = await ChannelUtils.getMessages(config.citeChannelId);
    console.log('Messages', messages);

    if (!messages || messages.length <= 0) {
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
      Math.random() * randomNumber(0, messages.length - 1),
    );
    const randomMsg = messages[randomIdx];

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: randomMsg.content,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default new GetRandomCitecommand();
