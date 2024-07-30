import { GuildConfig } from '@cite/models';
import { BaseDbService } from '../base-db.service';

export class GuildConfigDbService {
  private static instance: GuildConfigDbService;

  private readonly dbName = 'guildConfigDb';
  private readonly db: BaseDbService<GuildConfig>;

  static getInstance(): GuildConfigDbService {
    if (!this.instance) {
      this.instance = new GuildConfigDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<GuildConfig>(this.dbName);
  }

  async getConfig(guildId: string): Promise<GuildConfig> {
    let config = await this.db.get(guildId);
    if (!config) {
      config = {
        guildId,
        citeChannelId: null,
        additionalContexts: [],
      };
    }

    return config;
  }

  async setConfig(config: GuildConfig): Promise<void> {
    await this.db.set(config.guildId, config);
  }
}
