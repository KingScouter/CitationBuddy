import { ServerConfig } from '@cite/models';
import { BaseDbService } from '../bot/base-db.service';

export class ConfigService {
  private static instance: ConfigService;

  private readonly dbName = 'serverConfigDb';
  private readonly db: BaseDbService<ServerConfig>;

  static getInstance(): ConfigService {
    if (!this.instance) {
      this.instance = new ConfigService();
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
