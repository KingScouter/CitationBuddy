export interface UserScore {
  displayName: string;
  score: number;
}

export type QuizScores = Record<string, UserScore>;

export class GuildQuizScores {
  readonly guildId: string;
  readonly quizScores: QuizScores = {};
  readonly guessScores: QuizScores = {};

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

/**
 * Print a scoreboard
 * @param scores Scores to print
 * @returns Scoreboard string
 */
export function printScores(scores: QuizScores): string {
  if (Object.keys(scores).length === 0) {
    return 'Noch keine Ergebnisse vorhanden!';
  }

  const sortedScores = Object.values(scores).sort(
    (elemA, elemB) => elemB.score - elemA.score
  );
  const highScore = Math.max(...sortedScores.map(elem => elem.score));
  const lowScore = Math.min(...sortedScores.map(elem => elem.score));

  const msg = sortedScores
    .map(elem => {
      let val = `${elem.displayName}: ${elem.score}`;
      if (elem.score === highScore) {
        val = ':crown: ' + val;
      } else if (elem.score === lowScore) {
        val = ':anger: ' + val;
      }

      return val;
    })
    .join('\n');

  return msg;
}
