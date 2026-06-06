export interface UserScore {
  displayName: string;
  score: number;
}

export type QuizScores = Record<string, UserScore>;
export type GuessScores = Record<string, UserScore>;

export class GuildQuizScores {
  readonly guildId: string;
  readonly quizScores: QuizScores = {};
  readonly guessScores: GuessScores = {};

  constructor(guildId: string) {
    this.guildId = guildId;
  }

  addGuessWin(username: string, displayName: string): void {
    const score = this.guessScores[username] ?? {
      displayName: displayName,
      score: 0,
    };
    score.displayName = displayName;
    score.score++;
    this.guessScores[username] = score;
  }

  addQuizWin(username: string, displayName: string): void {
    const score = this.quizScores[username] ?? {
      displayName: displayName,
      score: 0,
    };
    score.displayName = displayName;
    score.score++;
    this.quizScores[username] = score;
  }
}
