import { Request, Response } from 'express';
import { MessageConfig } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { ConfigService } from '../configuration/config.service';
import { BotUtils } from '../bot/bot-utils';
import { OauthBackendUtils } from './oauth-backend-utils';

/**
 * Get the message-config for a specific guild
 * @param req Request with guildId in query-params
 * @param res Response with the message-config
 */
export async function getMessageConfig(
  req: Request,
  res: Response
): Promise<Response> {
  const guildId = req.query.guildId as string;
  if (!guildId) {
    return res.status(HttpStatusCode.BadRequest).send(null);
  }

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  const config = await ConfigService.getInstance().getConfig(guildId);

  return res.status(HttpStatusCode.Accepted).json(config.messageConfigs);
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
  const guildId = req.query.guildId as string;
  if (!guildId) {
    return res.status(HttpStatusCode.BadRequest).send(null);
  }

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  const config = await ConfigService.getInstance().getConfig(guildId);
  if (!config.citeChannelId) {
    return res.status(HttpStatusCode.NotFound).send();
  }

  const messages = await BotUtils.getMessages(config.citeChannelId);

  return res.status(HttpStatusCode.Accepted).json(messages);
}
