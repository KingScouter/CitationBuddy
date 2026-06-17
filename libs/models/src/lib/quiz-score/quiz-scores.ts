import { UserScore } from './user-score';

export type QuizScores = Record<string, UserScore>;

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
