import { Request, Response } from 'express';
import { MessageConfig } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { GuildConfigDbService } from '../db/guild-config-db/guild-config-db.service';
import { BotUtils } from '../bot/bot-utils';
import { OauthBackendUtils } from './oauth-backend-utils';
import { MessageConfigDbService } from '../db/message-config-db/message-config-db.service';

/**
 * Get the message-config for a specific guild
 * @param req Request with guildId in query-params
 * @param res Response with the message-config
 */
export async function getMessageConfig(
  req: Request,
  res: Response
): Promise<Response> {
  const guildId = req.params.guildId as string;
  if (!guildId) {
    return res.status(HttpStatusCode.BadRequest).send(null);
  }

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  const config = await MessageConfigDbService.getInstance().getConfig(guildId);

  return res.status(HttpStatusCode.Accepted).json(config);
}

/**
 * Update the message-config for a specific guild
 * @param req Request with new message-config in body
 * @param res Response
 */
export async function putMessageConfig(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.body) {
    return res.status(HttpStatusCode.BadRequest).send();
  }

  const { guildId, message }: { guildId: string; message: MessageConfig } =
    req.body;

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  const config = await MessageConfigDbService.getInstance().getConfig(guildId);
  const existingConfigIdx = config.configs.findIndex(
    elem => elem.id === message.id
  );
  if (existingConfigIdx >= 0) {
    config.configs.splice(existingConfigIdx, 1, message);
  } else {
    config.configs.push(message);
  }

  await MessageConfigDbService.getInstance().setConfig(config);

  return res.status(HttpStatusCode.Accepted).send();
}

/**
 * Get the list of messages from the configured citation-channel of a specific guild.
 * @param req Request with guildId in query-params
 * @param res Reponse with list of messages
 */
export async function getMessages(
  req: Request,
  res: Response
): Promise<Response> {
  const guildId = req.params.guildId as string;
  if (!guildId) {
    return res.status(HttpStatusCode.BadRequest).send(null);
  }

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  const config = await GuildConfigDbService.getInstance().getConfig(guildId);
  if (!config.citeChannelId) {
    return res.status(HttpStatusCode.NotFound).send();
  }

  const messages = await BotUtils.getMessages(config.citeChannelId);

  return res.status(HttpStatusCode.Accepted).json(messages);
}
