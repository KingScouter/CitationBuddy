import { CookieOptions, NextFunction, Request, Response } from 'express';
import { DiscordUser } from '../db/user-db/models/discord-user';
import jwt from 'jsonwebtoken';
import { UserDbService } from '../db/user-db/user-db.service';
import axios, { AxiosHeaders, HttpStatusCode } from 'axios';
import { OAuth2Routes, RESTPostOAuth2AccessTokenResult } from 'discord.js';
import { OauthBackendUtils } from './oauth-backend-utils';
import { AppConfig, UserJWT } from '../models';
import { DiscordBackendEndpoints } from '@cite/models';

const COOKIE_NAME = process.env.OAUTH2_COOKIE_NAME;

/**
 * Handle the Oauth2-token exchange and redirect the client to the correct page afterwards
 * @param req Request with the authorization code in the query-params
 * @param res Response with generated authentication-cookie
 */
export async function getOauth(req: Request, res: Response): Promise<void> {
  try {
    // Parse authentication code
    const code = req.query['code'];

    // Exchange for token
    const headers = new AxiosHeaders();
    const data = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: new URL('/oauth', process.env.API_URL).toString(),
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

    const user = await OauthBackendUtils.getUserMe(tokenResData.access_token);
    const userFromDb: DiscordUser = {
      id: user.id,
      name: user.global_name,
      username: user.username,
    };

    // Store user
    await UserDbService.getInstance().setUser(userFromDb);

    // Encode token in cookie
    addCookieToRes(res, userFromDb, tokenResData.access_token);
  } catch (ex) {
    console.error(ex);
    res.redirect(new URL('/oauth-error', process.env.CLIENT_URL).toString());
    return;
  }

  // Redirect
  res.redirect(new URL('/oauth-success', process.env.CLIENT_URL).toString());
}

/**
 * Logout the current user and revoke the token
 * @param req Request
 * @param res Response
 */
export async function postLogout(req: Request, res: Response): Promise<void> {
  const jwtPayload = OauthBackendUtils.getUserFromCookie(req);

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
}

/**
 * Get the informations for the currently authenticated user.
 * @param req Request
 * @param res Response with the user informations
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  const jwtPayload = OauthBackendUtils.getUserFromCookie(req);

  const discordUser = await OauthBackendUtils.getUserMe(jwtPayload.accessToken);
  if (discordUser?.id !== jwtPayload.id) {
    throw new Error(AppConfig.AUTH_ERROR_NAME);
  }

  res.json(discordUser);
}

export async function checkCookieAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Check if route needs auth
  if (
    Object.values(DiscordBackendEndpoints).indexOf(
      req.url as DiscordBackendEndpoints
    ) <= 0 ||
    req.url === DiscordBackendEndpoints.Oauth
  ) {
    next();
    return;
  }

  try {
    // Check auth
    await OauthBackendUtils.checkAuth(req);
    next();
  } catch (err) {
    if (err.message !== AppConfig.AUTH_ERROR_NAME) console.error(err);
    res.status(HttpStatusCode.Unauthorized).send(AppConfig.AUTH_ERROR_NAME);
  }
}

/**
 * Generate the JWT and add the authentication-cookie to the response
 * @param res Response to add the cookie to
 * @param user User data
 * @param accessToken Access token
 */
function addCookieToRes(
  res: Response,
  user: DiscordUser,
  accessToken: string
): void {
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
    } satisfies UserJWT,
    process.env.JWT_SECRET
  );
  res.cookie(COOKIE_NAME, token, {
    // adding the cookie to response here
    ...cookieOptions,
    expires: new Date(Date.now() + 7200 * 1000),
  });
}
