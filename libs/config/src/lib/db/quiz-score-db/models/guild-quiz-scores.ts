export type QuizScores = Record<string, number>;
export type GuessScores = Record<string, number>;

export class GuildQuizScores {
  readonly guildId: string;
  readonly quizScores: QuizScores = {};
  readonly guessScores: GuessScores = {};

  constructor(guildId: string) {
    this.guildId = guildId;
  }

  addGuessWin(username: string): void {
    const score = this.guessScores[username] ?? 0;
    this.guessScores[username] = score + 1;
  }

  addQuizWin(username: string): void {
    const score = this.quizScores[username] ?? 0;
    this.quizScores[username] = score + 1;
  }
}
