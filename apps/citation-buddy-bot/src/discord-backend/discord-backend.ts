import { Express, Response, CookieOptions, Request } from 'express';
import axios, { AxiosHeaders, HttpStatusCode } from 'axios';
import {
  ChannelType,
  OAuth2Routes,
  RESTPostOAuth2AccessTokenResult,
} from 'discord.js';
import jwt from 'jsonwebtoken';
import { DiscordUser } from '../user-db/models/discord-user';
import { UserDbService } from '../user-db/user-db.service';
import { BotUtils } from '../bot/bot-utils';
import {
  DiscordGuild,
  MessageConfig,
  ServerConfig,
  ServerConfigResponse,
} from '@cite/models';
import { OauthBackendUtils } from './oauth-backend-utils';
import { ConfigService } from '../configuration/config.service';
import { DiscordBackendEndpoints } from './discord-backend-endpoints.enum';

const userDb = UserDbService.getInstance();
const COOKIE_NAME = process.env.OAUTH2_COOKIE_NAME;

const authenticatedErrorName = 'Not Authenticated';

type UserJWTPayload = Pick<DiscordUser, 'id'> & { accessToken: string };

export default function (app: Express): void {
  app.get(DiscordBackendEndpoints.Oauth, async function (req, res) {
    try {
      // Parse authentication code
      const code = req.query['code'];

      // Exchange for token
      const headers = new AxiosHeaders();
      const data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000/oauth',
      };
      headers.setContentType('application/x-www-form-urlencoded');

      const discordUrl = OAuth2Routes.tokenURL;
      const tokenRes = await axios.post(discordUrl, data, {
        headers,
        auth: {
          username: process.env.CLIENT_ID,
          password: process.env.CLIENT_SECRET,
        },
      });
      const tokenResData = tokenRes.data as RESTPostOAuth2AccessTokenResult;
      console.log('TokenRes: ', tokenResData);

      const user = await OauthBackendUtils.getUserMe(tokenResData.access_token);
      const userFromDb: DiscordUser = {
        id: user.id,
        name: user.global_name,
        username: user.username,
      };

      // Store user
      await userDb.setUser(userFromDb);

      // Encode token in cookie
      addCookieToRes(res, userFromDb, tokenResData.access_token);
    } catch (ex) {
      console.error(ex);
      res.redirect(`${process.env.CLIENT_URL}/oauth-error`);
      return;
    }

    // Redirect
    res.redirect(`${process.env.CLIENT_URL}/oauth`);
  });

  app.get(DiscordBackendEndpoints.Me, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

      const discordUser = await OauthBackendUtils.getUserMe(
        jwtPayload.accessToken
      );
      if (discordUser?.id !== jwtPayload.id) {
        throw new Error(authenticatedErrorName);
      }

      res.json(discordUser);
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(401).json(authenticatedErrorName);
    }
  });

  app.get(DiscordBackendEndpoints.Guilds, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);
      const guilds = await OauthBackendUtils.getUserGuilds(
        jwtPayload.accessToken
      );
      if (!guilds || guilds.length <= 0) {
        res.status(HttpStatusCode.NotFound).send([]);
      }

      const botGuilds = await BotUtils.getGuilds();

      const mappedGuilds: DiscordGuild[] = guilds.map(
        elem =>
          ({
            guild: elem,
            hasBot: botGuilds.some(botGuild => botGuild.id === elem.id),
          }) as DiscordGuild
      );

      res.json(mappedGuilds);
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(HttpStatusCode.Unauthorized).json(authenticatedErrorName);
    }
  });

  app.get(DiscordBackendEndpoints.Guild, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

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

      res.json(guild);
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(HttpStatusCode.Unauthorized).json(authenticatedErrorName);
    }
  });

  app.put(DiscordBackendEndpoints.ServerConfig, async (req, res) => {
    const jwtPayload = await checkAuth(req);

    const config = req.body as ServerConfig;
    if (!config) {
      res.status(HttpStatusCode.BadRequest).send();
      return;
    }

    await ConfigService.getInstance().setConfig(config);

    res.status(HttpStatusCode.Accepted).send();
  });

  app.get(DiscordBackendEndpoints.ServerConfig, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

      // ToDo: Check user-permissions for server

      const guildId = req.query.guildId as string;
      if (!guildId) {
        res.status(HttpStatusCode.BadRequest).send(null);
        return;
      }

      let serverConfig: ServerConfig =
        await ConfigService.getInstance().getConfig(guildId);
      if (!serverConfig) {
        serverConfig = {
          guildId,
          citeChannelId: '',
          excludedMessageIds: [],
          additionalContexts: [],
          messageConfigs: [],
        };
      }

      const guildChannels = await BotUtils.getChannels(serverConfig.guildId);
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
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(HttpStatusCode.Unauthorized).json(authenticatedErrorName);
    }
  });

  app.post(DiscordBackendEndpoints.Logout, async (req, res) => {
    const jwtPayload = await checkAuth(req);

    UserDbService.getInstance().removeUser(jwtPayload.id);

    res.clearCookie(COOKIE_NAME);

    try {
      // Exchange for token
      const headers = new AxiosHeaders();
      const data = {
        token: jwtPayload.accessToken,
        token_type_hint: 'access_token',
      };
      headers.setContentType('application/x-www-form-urlencoded');

      const discordUrl = OAuth2Routes.tokenRevocationURL;
      await axios.post(discordUrl, data, {
        headers,
        auth: {
          username: process.env.CLIENT_ID,
          password: process.env.CLIENT_SECRET,
        },
      });
    } catch (ex) {
      console.error(ex);
      res.status(HttpStatusCode.BadRequest).send();
      return;
    }

    res.status(HttpStatusCode.Accepted).send();
  });

  app.get(DiscordBackendEndpoints.Messages, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

      const guildId = req.query.guildId as string;
      if (!guildId) {
        res.status(HttpStatusCode.BadRequest).send(null);
        return;
      }

      const config = await ConfigService.getInstance().getConfig(guildId);
      if (!config) {
        res.status(HttpStatusCode.NotFound).send();
        return;
      }

      const messages = await BotUtils.getMessages(config.citeChannelId);

      res.status(HttpStatusCode.Accepted).json(messages);
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(HttpStatusCode.Unauthorized).json(authenticatedErrorName);
    }
  });

  app.get(DiscordBackendEndpoints.MessageConfig, async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

      const guildId = req.query.guildId as string;
      if (!guildId) {
        res.status(HttpStatusCode.BadRequest).send(null);
        return;
      }

      const config = await ConfigService.getInstance().getConfig(guildId);
      let messageConfigs = config?.messageConfigs;
      if (!messageConfigs) {
        messageConfigs = [];
      }

      res.status(HttpStatusCode.Accepted).json(messageConfigs);
    } catch (err) {
      if (err.message !== authenticatedErrorName) console.error(err);
      res.status(HttpStatusCode.Unauthorized).json(authenticatedErrorName);
    }
  });

  app.put(DiscordBackendEndpoints.MessageConfig, async (req, res) => {
    const jwtPayload = await checkAuth(req);

    if (!req.body) {
      res.status(HttpStatusCode.BadRequest).send();
      return;
    }

    const { guildId, message }: { guildId: string; message: MessageConfig } =
      req.body;

    const config = await ConfigService.getInstance().getConfig(guildId);
    if (!config) {
      res.status(HttpStatusCode.NotFound).send();
      return;
    }

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
  });
}

function addCookieToRes(res: Response, user: DiscordUser, accessToken: string) {
  // cookie setting options
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const { id } = user;
  const token = jwt.sign(
    {
      // Signing the token to send to client side
      id,
      accessToken,
    } satisfies UserJWTPayload,
    process.env.JWT_SECRET
  );
  res.cookie(COOKIE_NAME, token, {
    // adding the cookie to response here
    ...cookieOptions,
    expires: new Date(Date.now() + 7200 * 1000),
  });
}

async function checkAuth(req: Request): Promise<UserJWTPayload> {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    throw new Error(authenticatedErrorName);
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET) as UserJWTPayload;
  const userFromDb = await userDb.getUser(payload?.id);
  if (!payload.accessToken || !userFromDb) {
    throw new Error(authenticatedErrorName);
  }
  // ToDo: Check expiration date for token

  return payload;
}
