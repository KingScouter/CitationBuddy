import { BaseDbService } from '../base-db.service';
import { GuildQuizScores } from './models';

export class QuizScoreDbService {
  private static instance: QuizScoreDbService;

  private readonly dbName = 'quizScoreDb';
  private readonly db: BaseDbService<GuildQuizScores>;

  static getInstance(): QuizScoreDbService {
    if (!this.instance) {
      this.instance = new QuizScoreDbService();
    }

    return this.instance;
  }

  protected constructor() {
    this.db = new BaseDbService<GuildQuizScores>(this.dbName);
  }

  static async getGuild(guildId: string): Promise<GuildQuizScores> {
    let config = await this.getInstance().db.get(guildId);
    if (!config) {
      config = new GuildQuizScores(guildId);
    } else {
      config = Object.assign(new GuildQuizScores(config.guildId), config);
    }

    return config;
  }

  static async setConfig(config: GuildQuizScores): Promise<void> {
    await this.getInstance().db.set(config.guildId, config);
  }
}
