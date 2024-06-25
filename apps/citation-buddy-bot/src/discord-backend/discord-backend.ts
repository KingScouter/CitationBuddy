import { Express, Response, CookieOptions } from 'express';
import axios, { AxiosHeaders } from 'axios';
import { OAuth2Routes, RESTPostOAuth2AccessTokenResult } from 'discord.js';
import { getUserMe } from '../utils';
import { UserDbService } from '../user-db/user-db.service';
import jwt from 'jsonwebtoken';
import { DiscordUser } from '../user-db/models/discord-user';

const userDb = new UserDbService();
const COOKIE_NAME = process.env.OAUTH2_COOKIE_NAME;

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

      // Store user
      userDb.addUser(user);

      // Encode token in cookie
      addCookieToRes(res, user, tokenResData.access_token);
    } catch (ex) {
      console.error(ex);
      res.redirect(`${process.env.CLIENT_URL}/oauth-error`);
      return;
    }

    // Redirect
    res.redirect(`${process.env.CLIENT_URL}/oauth`);
  });

  type UserJWTPayload = Pick<DiscordUser, 'id'> & { accessToken: string };

  app.get('/me', async (req, res) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        throw new Error('Not Authenticated');
      }
      const payload = (await jwt.verify(
        token,
        process.env.JWT_SECRET
      )) as UserJWTPayload;
      const userFromDb = userDb.getUser(payload?.id);
      if (!userFromDb) {
        throw new Error('Not Authenticated');
      }
      if (!payload.accessToken) {
        throw new Error('Not Authenticated');
      }

      console.log('User authenticated');
      const discordUser = await getUserMe(payload.accessToken);
      if (discordUser?.id !== userFromDb.id) {
        throw new Error('Not Authenticated');
      }

      res.json(userFromDb);
    } catch (err) {
      console.error(err);
      res.status(401).json('Not Authenticated');
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
    },
    process.env.JWT_SECRET
  );
  res.cookie(COOKIE_NAME, token, {
    // adding the cookie to response here
    ...cookieOptions,
    expires: new Date(Date.now() + 7200 * 1000),
  });
}
