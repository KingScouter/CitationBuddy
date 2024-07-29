import { Request, Response } from 'express';
import { GuildConfig, ServerConfigResponse } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { ChannelType } from 'discord.js';
import { BotUtils } from '../bot/bot-utils';
import { GuildConfigDbService } from '../db/guild-config-db/guild-config-db.service';
import { OauthBackendUtils } from './oauth-backend-utils';

/**
 * Update the server configuration for a given guild
 * @param req Request with the server-config in the body
 * @param res Response
 */
export async function putServerConfig(
  req: Request,
  res: Response
): Promise<Response> {
  const config = req.body as GuildConfig;
  if (!config) {
    return res.status(HttpStatusCode.BadRequest).send();
  }

  if (!OauthBackendUtils.checkUserGuildPrivileges(req, config.guildId)) {
    return res.status(HttpStatusCode.Unauthorized).send(null);
  }

  await GuildConfigDbService.getInstance().setConfig(config);

  return res.status(HttpStatusCode.Accepted).send();
}

/**
 * Get the server-configuration for a specific guild
 * @param req Request with the guildId in the query-params
 * @param res Response with the server-config
 */
export async function getServerConfig(
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

  const serverConfig =
    await GuildConfigDbService.getInstance().getConfig(guildId);

  const guildChannels = await BotUtils.getChannels(guildId);
  if (!guildChannels || guildChannels.length <= 0) {
    return res.status(HttpStatusCode.InternalServerError).send(null);
  }

  const configResponse: ServerConfigResponse = {
    ...serverConfig,
    availableChannels: guildChannels.filter(
      elem => elem.type === ChannelType.GuildText
    ) as any,
  };

  return res.json(configResponse);
}
