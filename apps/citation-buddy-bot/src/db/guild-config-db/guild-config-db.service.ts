import { ServerConfig } from '@cite/models';
import { BaseDbService } from '../bot/base-db.service';

export class GuildConfigDbService {
  private static instance: GuildConfigDbService;

  private readonly dbName = 'guildConfigDb';
  private readonly db: BaseDbService<ServerConfig>;

  static getInstance(): GuildConfigDbService {
    if (!this.instance) {
      this.instance = new GuildConfigDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<ServerConfig>(this.dbName);
  }

  async getConfig(guildId: string): Promise<ServerConfig> {
    let config = await this.db.get(guildId);
    if (!config) {
      config = {
        guildId,
        citeChannelId: null,
        messageConfigs: [],
        additionalContexts: [],
      };
    }

    return config;
  }

  async setConfig(config: ServerConfig): Promise<void> {
    await this.db.set(config.guildId, config);
  }
}
