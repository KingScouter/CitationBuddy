import { Quiz } from './quiz';

export class QuizService {
  static instance: QuizService;

  static getInstance(): QuizService {
    if (!this.instance) {
      this.instance = new QuizService();
    }

    return this.instance;
  }

  private readonly openQuizes = new Map<string, Quiz>();

  startQuiz(guildId: string): Quiz {
    const quiz = new Quiz(guildId);
    this.openQuizes.set(guildId, quiz);
    return quiz;
  }

  getQuiz(guildId: string): Quiz | null {
    return this.openQuizes.get(guildId) ?? null;
  }
}
