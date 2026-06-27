import { QuizOption, QuizRoundResult } from './models';
import { QuizRound } from './quiz-round';
import { ParsedQuote } from '../models/parsed-quote';
import { QuizScores, UserScore, printScores } from '@cite/models';

export interface QuizUser {
  username: string;
  displayName: string;
}

export class Quiz {
  private readonly _guildId: string;
  private readonly users = new Map<string, QuizUser>();
  private readonly _scores = new Map<string, number>();

  private readonly _doneMessages: string[] = [];

  private _currRound: QuizRound | null = null;

  joinMessageId = '';

  get doneMessages(): string[] {
    return this._doneMessages;
  }

  get currRound(): QuizRound | null {
    return this._currRound;
  }

  /**
   * Get list of all players of the quiz
   */
  get players(): QuizUser[] {
    return Array.from(this.users.values());
  }

  /**
   * Get list of the displaynames of all players of the quiz
   */
  get playerDisplayNames(): string[] {
    return this.players.map(elem => elem.displayName);
  }

  get guildId(): string {
    return this._guildId;
  }

  get scores(): [string, number][] {
    return [...this._scores.entries()].sort(
      (elemA, elemB) => elemB[1] - elemA[1]
    );
  }

  constructor(guildId: string) {
    this._guildId = guildId;
  }

  /**
   * Add a new user to the active quiz.
   * @param user Username to add
   * @param displayName Displayname of the user
   * @returns True if the user was added sucessfully, otherwise false if the user is already
   *          playing the quiz.
   */
  addUser(username: string, displayName: string): boolean {
    if (this.users.has(username)) {
      return false;
    }
    this.users.set(username, { username, displayName });
    this._scores.set(username, 0);

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
    message: ParsedQuote,
    quickRound: boolean
  ): QuizRound | null {
    if (this._currRound) {
      return null;
    }

    const quizRound = new QuizRound(
      options,
      message,
      this.users.size,
      quickRound
    );
    this._currRound = quizRound;
    this._doneMessages.push(message.id);
    return quizRound;
  }

  addGuess(user: string, answer: string): boolean {
    if (!this._currRound) {
      return false;
    }

    const userData = this.users.get(user);
    if (!userData) {
      return false;
    }

    this._currRound.addGuess(user, userData.displayName, answer);

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

    return this._currRound.getNumGuesses() === this.users.size;
  }

  getJoinMessage(): string {
    let msg = 'Quiz wird gestartet. Wer will teilnehmen?\n\n';

    if (this.users.size === 0) {
      msg += 'Noch niemand!';
    } else {
      msg += `**Teilnehmer:** ${this.playerDisplayNames.join(', ')}`;
    }

    return msg;
  }

  getScoreMessage(): string {
    const scores: QuizScores = {};
    this.scores.forEach(elem => {
      const userScore: UserScore = {
        displayName: this.getUserDisplayname(elem[0]),
        score: elem[1],
      };
      scores[elem[0]] = userScore;
    });

    return printScores(scores);
  }

  /**
   * Get the display name for a given username.
   * @param username Unique username
   * @returns {string} The display name of the user, or username if not found.
   */
  getUserDisplayname(username: string): string {
    const user = this.users.get(username);
    return user?.displayName ?? username;
  }

  /**
   * Get a registered user for a player of the quiz
   * @param username Username of the user
   * @returns {QuizUser} The user
   */
  getUser(username: string): QuizUser {
    const user = this.users.get(username);
    if (user) {
      return user;
    }

    return {
      displayName: username,
      username,
    };
  }
}
