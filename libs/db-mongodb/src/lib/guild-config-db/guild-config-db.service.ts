import { GuildConfig } from '@cite/models';
import { BaseDbService } from '../base-db.service';
import { Collection, Db, WithId } from 'mongodb';

type IdGuildConfig = WithId<GuildConfig>;

export class GuildConfigDbService extends BaseDbService<GuildConfig> {
  protected readonly collectionName: string = 'guildConfig';
  private static instance: GuildConfigDbService;

  private static get collection(): Collection<GuildConfig> {
    return GuildConfigDbService.getInstance().collection;
  }

  static getInstance(): GuildConfigDbService {
    if (!this.instance) {
      this.instance = new GuildConfigDbService();
    }

    return this.instance;
  }

  static async getConfig(guildId: string): Promise<IdGuildConfig | null> {
    return await this.collection.findOne({
      guildId,
    });
  }

  static generateGuild(guildId: string): GuildConfig {
    return {
      guildId,
      citeChannelId: null,
      additionalContexts: [],
    };
  }

  static async insertConfig(config: GuildConfig): Promise<boolean> {
    const existing = await this.getConfig(config.guildId);
    if (existing) {
      return false;
    }

    await this.collection.insertOne(config);
    return true;
  }

  static async updateConfigById(config: IdGuildConfig): Promise<boolean> {
    const existing = await this.collection.findOne({ _id: config._id });
    if (!existing) {
      return false;
    }
    await this.collection.replaceOne({ _id: existing._id }, config);
    return true;
  }

  static async addOrUpdateConfig(config: GuildConfig): Promise<void> {
    await this.collection.replaceOne({ guildId: config.guildId }, config, {
      upsert: true,
    });
  }
}
