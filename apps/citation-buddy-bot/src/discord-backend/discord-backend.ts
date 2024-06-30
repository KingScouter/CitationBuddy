import { Express, Response, CookieOptions, Request } from 'express';
import axios, { AxiosHeaders, HttpStatusCode } from 'axios';
import { OAuth2Routes, RESTPostOAuth2AccessTokenResult } from 'discord.js';
import { getUserGuilds, getUserMe } from '../utils';
import jwt from 'jsonwebtoken';
import { DiscordUser } from '../user-db/models/discord-user';
import { UserDbService } from '../user-db/user-db.service';

const userDb = UserDbService.getInstance();
const COOKIE_NAME = process.env.OAUTH2_COOKIE_NAME;

type UserJWTPayload = Pick<DiscordUser, 'id'> & { accessToken: string };

export default function (app: Express): void {
  app.get('/oauth', async function (req, res) {
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

      const user = await getUserMe(tokenResData.access_token);
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

  app.get('/me', async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);

      const discordUser = await getUserMe(jwtPayload.accessToken);
      if (discordUser?.id !== jwtPayload.id) {
        throw new Error('Not Authenticated');
      }

      res.json(discordUser);
    } catch (err) {
      console.error(err);
      res.status(401).json('Not Authenticated');
    }
  });

  app.get('/channels', async (req, res) => {
    try {
      const jwtPayload = await checkAuth(req);
      const guilds = await getUserGuilds(jwtPayload.accessToken);
      if (!guilds || guilds.length <= 0) {
        res.status(HttpStatusCode.NotFound).send([]);
      }

      res.json(guilds);
    } catch (err) {
      console.error(err);
      res.status(HttpStatusCode.Unauthorized).json('Not Authenticated');
    }
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
    throw new Error('Not Authenticated');
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET) as UserJWTPayload;
  const userFromDb = await userDb.getUser(payload?.id);
  if (!payload.accessToken || !userFromDb) {
    throw new Error('Not Authenticated');
  }
  // ToDo: Check expiration date for token

  return payload;
}
