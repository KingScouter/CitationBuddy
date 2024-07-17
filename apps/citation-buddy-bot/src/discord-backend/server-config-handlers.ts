import { Request, Response } from 'express';
import { ServerConfig, ServerConfigResponse } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { ChannelType } from 'discord.js';
import { BotUtils } from '../bot/bot-utils';
import { ConfigService } from '../configuration/config.service';
import { AppConfig } from '../models';

/**
 * Update the server configuration for a given guild
 * @param req Request with the server-config in the body
 * @param res Response
 */
export async function putServerConfig(
  req: Request,
  res: Response
): Promise<void> {
  const config = req.body as ServerConfig;
  if (!config) {
    res.status(HttpStatusCode.BadRequest).send();
    return;
  }

  await ConfigService.getInstance().setConfig(config);

  res.status(HttpStatusCode.Accepted).send();
}

/**
 * Get the server-configuration for a specific guild
 * @param req Request with the guildId in the query-params
 * @param res Response with the server-config
 */
export async function getServerConfig(
  req: Request,
  res: Response
): Promise<void> {
  // ToDo: Check user-permissions for server

  const guildId = req.query.guildId as string;
  if (!guildId) {
    res.status(HttpStatusCode.BadRequest).send(null);
    return;
  }

  const serverConfig = await ConfigService.getInstance().getConfig(guildId);

  const guildChannels = await BotUtils.getChannels(guildId);
  if (!guildChannels || guildChannels.length <= 0) {
    res.status(HttpStatusCode.InternalServerError).send(null);
    return;
  }

  const configResponse: ServerConfigResponse = {
    ...serverConfig,
    availableChannels: guildChannels.filter(
      elem => elem.type === ChannelType.GuildText
    ) as any,
  };

  res.json(configResponse);
}
