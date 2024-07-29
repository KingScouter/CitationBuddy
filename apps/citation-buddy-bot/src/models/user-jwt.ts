import { DiscordUser } from '../db/user-db/models/discord-user';

export type UserJWT = Pick<DiscordUser, 'id'> & { accessToken: string };
