import {
  APIGuild,
  APIUser,
  REST,
  RESTGetAPIOAuth2CurrentAuthorizationResult,
  Routes,
} from 'discord.js';

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
      const guild = guilds.find((elem) => elem.id === guildId);
      if (guild) {
        return guild;
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private static getRESTClient(accessToken: string): REST {
    return new REST({ version: '10', authPrefix: 'Bearer' }).setToken(
      accessToken
    );
  }
}
