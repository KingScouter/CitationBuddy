import { Express } from 'express';
import { DiscordBackendEndpoints } from '@cite/models';
import { getMe, getOauth, postLogout } from './oauth-handlers';
import { getGuild, getGuilds } from './guild-handlers';
import {
  putGuildConfig,
  getGuildConfig,
  getFullGuildConfig,
} from './guild-config-handlers';
import {
  getMessageConfig,
  getMessages,
  putMessageConfig,
} from './message-handlers';

export default function (app: Express): void {
  const guildIdSuffix = '/:guildId';

  app.get(DiscordBackendEndpoints.Oauth, getOauth);
  app.post(DiscordBackendEndpoints.Logout, postLogout);
  app.get(DiscordBackendEndpoints.Me, getMe);

  app.get(DiscordBackendEndpoints.Guilds + guildIdSuffix, getGuild);
  app.get(DiscordBackendEndpoints.Guilds, getGuilds);

  app.put(DiscordBackendEndpoints.GuildConfig, putGuildConfig);
  app.get(DiscordBackendEndpoints.GuildConfig + guildIdSuffix, getGuildConfig);

  app.get(DiscordBackendEndpoints.Messages + guildIdSuffix, getMessages);

  app.get(
    DiscordBackendEndpoints.MessageConfig + guildIdSuffix,
    getMessageConfig
  );
  app.put(DiscordBackendEndpoints.MessageConfig, putMessageConfig);

  app.get(
    DiscordBackendEndpoints.FullGuildConfig + guildIdSuffix,
    getFullGuildConfig
  );
}
