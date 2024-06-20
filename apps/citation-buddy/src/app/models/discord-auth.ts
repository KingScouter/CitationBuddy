export interface DiscordAuth {
  tokenType: string;
  accessToken: string;
  expirationDate: number;
  state: string;
}
