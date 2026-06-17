import { GuildQuizScores } from '@cite/models';
import { BaseDbService } from '../base-db.service';
import { Collection, WithId } from 'mongodb';

type IdGuildQuizScores = WithId<GuildQuizScores>;

export class QuizScoreDbService extends BaseDbService<GuildQuizScores> {
  protected readonly collectionName: string = 'quizScores';
  private static instance: QuizScoreDbService;

  private static get collection(): Collection<GuildQuizScores> {
    return QuizScoreDbService.getInstance().collection;
  }

  static getInstance(): QuizScoreDbService {
    if (!this.instance) {
      this.instance = new QuizScoreDbService();
    }

    return this.instance;
  }

  static async getGuildScores(
    guildId: string
  ): Promise<GuildQuizScores | null> {
    const score = await this.collection.findOne({
      guildId,
    });
    if (!score) {
      return null;
    }

    return Object.assign(new GuildQuizScores(score.guildId), score);
  }

  static async insertConfig(config: GuildQuizScores): Promise<boolean> {
    const existing = await this.getGuildScores(config.guildId);
    if (existing) {
      return false;
    }

    await this.collection.insertOne(config);
    return true;
  }

  static async updateConfigById(config: IdGuildQuizScores): Promise<boolean> {
    const existing = await this.collection.findOne({ _id: config._id });
    if (!existing) {
      return false;
    }
    await this.collection.replaceOne({ _id: existing._id }, config);
    return true;
  }

  static async addOrUpdateConfig(config: GuildQuizScores): Promise<void> {
    await this.collection.replaceOne({ guildId: config.guildId }, config, {
      upsert: true,
    });
  }
}
