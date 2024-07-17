import { Request, Response } from 'express';
import { MessageConfig } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { ConfigService } from '../configuration/config.service';
import { BotUtils } from '../bot/bot-utils';

/**
 * Get the message-config for a specific guild
 * @param req Request with guildId in query-params
 * @param res Response with the message-config
 */
export async function getMessageConfig(
  req: Request,
  res: Response
): Promise<void> {
  const guildId = req.query.guildId as string;
  if (!guildId) {
    res.status(HttpStatusCode.BadRequest).send(null);
    return;
  }

  const config = await ConfigService.getInstance().getConfig(guildId);

  res.status(HttpStatusCode.Accepted).json(config.messageConfigs);
}

/**
 * Update the message-config for a specific guild
 * @param req Request with new message-config in body
 * @param res Response
 */
export async function putMessageConfig(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.body) {
    res.status(HttpStatusCode.BadRequest).send();
    return;
  }

  const { guildId, message }: { guildId: string; message: MessageConfig } =
    req.body;

  const config = await ConfigService.getInstance().getConfig(guildId);
  const existingConfigIdx = config.messageConfigs.findIndex(
    elem => elem.id === message.id
  );
  if (existingConfigIdx >= 0) {
    config.messageConfigs.splice(existingConfigIdx, 1, message);
  } else {
    config.messageConfigs.push(message);
  }

  await ConfigService.getInstance().setConfig(config);

  res.status(HttpStatusCode.Accepted).send();
}

/**
 * Get the list of messages from the configured citation-channel of a specific guild.
 * @param req Request with guildId in query-params
 * @param res Reponse with list of messages
 */
export async function getMessages(req: Request, res: Response): Promise<void> {
  const guildId = req.query.guildId as string;
  if (!guildId) {
    res.status(HttpStatusCode.BadRequest).send(null);
    return;
  }

  const config = await ConfigService.getInstance().getConfig(guildId);
  if (!config.citeChannelId) {
    res.status(HttpStatusCode.NotFound).send();
    return;
  }

  const messages = await BotUtils.getMessages(config.citeChannelId);

  res.status(HttpStatusCode.Accepted).json(messages);
}
