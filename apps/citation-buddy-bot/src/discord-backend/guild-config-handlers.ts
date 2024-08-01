import { Request, Response } from 'express';
import {
  FullGuildConfig,
  GuildConfig,
  GuildConfigResponse,
} from '@cite/models';
import { HttpStatusCode } from 'axios';
import { ChannelType } from 'discord.js';
import { BotUtils } from '../bot/bot-utils';
import { GuildConfigDbService } from '../db/guild-config-db/guild-config-db.service';
import { OauthBackendUtils } from './oauth-backend-utils';
import { MessageConfigDbService } from '../db/message-config-db/message-config-db.service';

/**
 * Update the guild configuration for a given guild
 * @param req Request with the guild-config in the body
 * @param res Response
 */
export async function putGuildConfig(
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
 * @param req Request with the guildId in the URL-params
 * @param res Response with the server-config
 */
export async function getGuildConfig(
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

  const guildConfig =
    await GuildConfigDbService.getInstance().getConfig(guildId);

  const guildChannels = await BotUtils.getChannels(guildId);
  if (!guildChannels || guildChannels.length <= 0) {
    return res.status(HttpStatusCode.InternalServerError).send(null);
  }

  const configResponse: GuildConfigResponse = {
    ...guildConfig,
    availableChannels: guildChannels.filter(
      elem => elem.type === ChannelType.GuildText
    ) as any,
  };

  return res.json(configResponse);
}

/**
 * Get the complete config for a given guild (general- and message-config)
 * @param req Request with the guildId in the URL-params
 * @param res Response with the full config
 */
export async function getFullGuildConfig(
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

  const guildConfig =
    await GuildConfigDbService.getInstance().getConfig(guildId);

  const messageConfig =
    await MessageConfigDbService.getInstance().getConfig(guildId);

  return res.json({
    generalConfig: guildConfig,
    messageConfig,
  } satisfies FullGuildConfig);
}
