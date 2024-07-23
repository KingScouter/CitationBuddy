import {
  APIGuild,
  APIUser,
  PermissionFlagsBits,
  REST,
  RESTGetAPIOAuth2CurrentAuthorizationResult,
  Routes,
} from 'discord.js';
import jwt from 'jsonwebtoken';
import { UserDbService } from '../user-db/user-db.service';
import { AppConfig, UserJWT } from '../models';
import { Request } from 'express';

export class OauthBackendUtils {
  static async getUserMe(accessToken: string): Promise<APIUser> {
    try {
      const user = (await OauthBackendUtils.getRESTClient(accessToken).get(
        Routes.oauth2CurrentAuthorization()
      )) as RESTGetAPIOAuth2CurrentAuthorizationResult;

      return user.user;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async getUserGuilds(accessToken: string): Promise<APIGuild[]> {
    try {
      const guilds = (await OauthBackendUtils.getRESTClient(accessToken).get(
        Routes.userGuilds()
      )) as APIGuild[];

      return guilds;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async getGuild(
    guildId: string,
    accessToken: string
  ): Promise<APIGuild> {
    try {
      const guilds = await OauthBackendUtils.getUserGuilds(accessToken);
      const guild = guilds.find(elem => elem.id === guildId);
      if (guild) {
        return guild;
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static checkUserPermissions(guild: APIGuild): boolean {
    const permissions = BigInt(guild.permissions);
    console.log('User permissions: ', permissions);
    if (
      (permissions & PermissionFlagsBits.ManageGuild) ===
      PermissionFlagsBits.ManageGuild
    ) {
      return true;
    }

    return false;
  }

  static async checkUserGuildPrivileges(
    req: Request,
    guildId: string
  ): Promise<boolean> {
    const jwtPayload = OauthBackendUtils.getUserFromCookie(req);
    const guild = await OauthBackendUtils.getGuild(
      guildId,
      jwtPayload.accessToken
    );
    if (!guild) {
      return false;
    }

    if (!OauthBackendUtils.checkUserPermissions(guild)) {
      console.log('User is not permitted');
      return false;
    } else {
      console.log('User is permitted');
    }

    return true;
  }

  /**
   * Check if the user authenticated by the request-cookie is authorized.
   * @param req Request
   * @returns { Promise<UserJWT> } The authentication-information for the user, if valid.
   */
  static async checkAuth(req: Request): Promise<void> {
    const payload = OauthBackendUtils.getUserFromCookie(req);
    const userFromDb = await UserDbService.getInstance().getUser(payload?.id);
    if (!payload.accessToken || !userFromDb) {
      throw new Error(AppConfig.AUTH_ERROR_NAME);
    }
    // ToDo: Check expiration date for token
  }

  static getUserFromCookie(req: Request): UserJWT {
    const token = req.cookies[process.env.OAUTH2_COOKIE_NAME];
    if (!token) {
      throw new Error(AppConfig.AUTH_ERROR_NAME);
    }
    return jwt.verify(token, process.env.JWT_SECRET) as UserJWT;
  }

  private static getRESTClient(accessToken: string): REST {
    return new REST({ version: '10', authPrefix: 'Bearer' }).setToken(
      accessToken
    );
  }
}
