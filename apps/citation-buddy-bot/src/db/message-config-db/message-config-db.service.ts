import { GuildMessageConfig } from '@cite/models';
import { BaseDbService } from '../base-db.service';
export class MessageConfigDbService {
  private static instance: MessageConfigDbService;

  private readonly dbName = 'messageConfigDb';
  private readonly db: BaseDbService<GuildMessageConfig>;

  static getInstance(): MessageConfigDbService {
    if (!this.instance) {
      this.instance = new MessageConfigDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<GuildMessageConfig>(this.dbName);
  }

  async getConfig(guildId: string): Promise<GuildMessageConfig> {
    let config = await this.db.get(guildId);
    if (!config) {
      config = {
        guildId,
        configs: [],
      };
    }

    return config;
  }

  async setConfig(config: GuildMessageConfig): Promise<void> {
    await this.db.set(config.guildId, config);
  }
}
