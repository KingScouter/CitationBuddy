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
    return this.db.get(guildId);
  }

  async setConfig(config: ServerConfig): Promise<void> {
    await this.db.set(config.guildId, config);
  }
}
