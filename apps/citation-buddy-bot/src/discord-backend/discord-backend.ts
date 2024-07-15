import { Express } from 'express';
import { DiscordBackendEndpoints } from './discord-backend-endpoints.enum';
import { getMe, getOauth, postLogout } from './oauth-handlers';
import { getGuild, getGuilds } from './guild-handlers';
import { putServerConfig, getServerConfig } from './server-config-handlers';
import {
  getMessageConfig,
  getMessages,
  putMessageConfig,
} from './message-handlers';

export default function (app: Express): void {
  app.get(DiscordBackendEndpoints.Oauth, getOauth);
  app.post(DiscordBackendEndpoints.Logout, postLogout);
  app.get(DiscordBackendEndpoints.Me, getMe);

  app.get(DiscordBackendEndpoints.Guild, getGuild);
  app.get(DiscordBackendEndpoints.Guilds, getGuilds);

  app.put(DiscordBackendEndpoints.ServerConfig, putServerConfig);
  app.get(DiscordBackendEndpoints.ServerConfig, getServerConfig);

  app.get(DiscordBackendEndpoints.Messages, getMessages);

  app.get(DiscordBackendEndpoints.MessageConfig, getMessageConfig);
  app.put(DiscordBackendEndpoints.MessageConfig, putMessageConfig);
}
