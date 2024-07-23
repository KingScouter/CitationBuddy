import { Request, Response } from 'express';
import { DiscordGuild } from '@cite/models';
import { HttpStatusCode } from 'axios';
import { BotUtils } from '../bot/bot-utils';
import { OauthBackendUtils } from './oauth-backend-utils';

/**
 * Get a list of all guilds of the currently authenticated user
 * @param req Request
 * @param res Response with the list of guilds
 */
export async function getGuilds(req: Request, res: Response): Promise<void> {
  const jwtPayload = OauthBackendUtils.getUserFromCookie(req);
  const guilds = await OauthBackendUtils.getUserGuilds(jwtPayload.accessToken);
  if (!guilds || guilds.length <= 0) {
    res.status(HttpStatusCode.NotFound).send([]);
  }

  const botGuilds = await BotUtils.getGuilds();

  const mappedGuilds = guilds.map(
    elem =>
      ({
        guild: elem,
        hasBot: botGuilds.some(botGuild => botGuild.id === elem.id),
      }) as DiscordGuild
  );

  res.json(mappedGuilds);
}

/**
 * Get a specific guild by ID
 * @param req Request with the guildId in the query-params
 * @param res Response with the guild
 */
export async function getGuild(req: Request, res: Response): Promise<Response> {
  const jwtPayload = OauthBackendUtils.getUserFromCookie(req);

  const guildId = req.query.guildId as string;
  if (!guildId) {
    res.status(HttpStatusCode.BadRequest).send(null);
    return;
  }

  const guild = await OauthBackendUtils.getGuild(
    guildId,
    jwtPayload.accessToken
  );
  if (!guild) {
    res.status(HttpStatusCode.NotFound).send(null);
    return;
  }

  if (!OauthBackendUtils.checkUserPermissions(guild)) {
    console.log('User is not permitted');
    return res
      .status(HttpStatusCode.Unauthorized)
      .send('No sufficient user permissions');
  } else {
    console.log('User is permitted');
  }

  return res.json(guild);
}
