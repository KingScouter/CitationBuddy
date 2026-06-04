import { QuizOption, QuizRoundResult } from './models';
import { QuizRound } from './quiz-round';

export class Quiz {
  private readonly _guildId: string;
  private readonly users: string[] = [];
  private readonly _scores = new Map<string, number>();

  private _currRound: QuizRound | null = null;

  joinMessageId = '';

  get currRound(): QuizRound | null {
    return this._currRound;
  }

  get players(): string[] {
    return this.users;
  }

  get guildId(): string {
    return this._guildId;
  }

  get scores(): [string, number][] {
    return [...this._scores.entries()].sort(
      (elemA, elemB) => elemA[1] - elemB[1]
    );
  }

  constructor(guildId: string) {
    this._guildId = guildId;
  }

  /**
   * Add a new user to the active quiz.
   * @param user Username to add
   * @returns True if the user was added sucessfully, otherwise false if the user is already
   *          playing the quiz.
   */
  addUser(user: string): boolean {
    if (this.users.includes(user)) {
      return false;
    }
    this.users.push(user);
    this._scores.set(user, 0);

    return true;
  }

  addSuccess(user: string): void {
    let score = this._scores.get(user);
    if (!score) {
      score = 0;
    }

    this._scores.set(user, ++score);
  }

  startRound(
    options: QuizOption[],
    answer: string,
    messageContent: string
  ): QuizRound | null {
    if (this._currRound) {
      return null;
    }

    const quizRound = new QuizRound(
      options,
      answer,
      messageContent,
      this.users.length
    );
    this._currRound = quizRound;
    return quizRound;
  }

  addGuess(user: string, answer: string): boolean {
    if (!this._currRound) {
      return false;
    }

    if (!this.users.includes(user)) {
      return false;
    }

    this._currRound.addGuess(user, answer);

    return true;
  }

  resolveRound(): QuizRoundResult | null {
    const round = this._currRound;
    if (!round) {
      return null;
    }

    const result = round.resolveRound();
    for (const name of result.correctUsers) {
      this.addSuccess(name);
    }

    this._currRound = null;
    return result;
  }

  isFinished(): boolean {
    if (!this._currRound) {
      return false;
    }

    return this._currRound.getNumGuesses() === this.users.length;
  }

  getJoinMessage(): string {
    let msg = 'Quiz wird gestartet. Wer will teilnehmen?\n\n';

    if (this.users.length === 0) {
      msg += 'Noch niemand!';
    } else {
      msg += `**Teilnehmer:** ${this.users.join(', ')}`;
    }

    return msg;
  }

  getScoreMessage(): string {
    const msg = this.scores
      .map(([elemName, elemScore], idx) => {
        let val = `${elemName}: ${elemScore}`;
        if (idx === 0) {
          val = ':crown: ' + val;
        } else if (idx === this._scores.size - 1) {
          val = ':anger: ' + val;
        }

        return val;
      })
      .join('\n');

    return msg;
  }
}
