import { QuizGuess, QuizOption, QuizRoundResult } from './models';

export class QuizRound {
  private static progressBarStart = '[';
  private static progressBarMiddle = '=';
  private static progressBarEmpty = ' ';
  private static progressBarEnd = ']';
  private static progressBarNumBars = 20;

  private readonly options: QuizOption[];
  private readonly _correct: string;
  private readonly messageContent: string;
  private readonly maxNumGuesses: number;

  private readonly guesses = new Map<string, string>();

  messageId: string | null = null;

  get correct(): string {
    return this._correct;
  }

  constructor(
    options: QuizOption[],
    correct: string,
    messageContent: string,
    maxNumGuesses: number
  ) {
    this.options = options;
    this._correct = correct;
    this.messageContent = messageContent;
    this.maxNumGuesses = maxNumGuesses;
  }

  addGuess(user: string, choice: string): void {
    if (this.guesses.has(user)) {
      return;
    }

    this.guesses.set(user, this.getChoiceById(choice));
  }

  getNumGuesses(): number {
    return this.guesses.size;
  }

  resolveRound(): QuizRoundResult {
    const correctUsers: string[] = [];
    const wrongUsers: QuizGuess[] = [];

    for (const [username, guess] of this.guesses.entries()) {
      if (guess === this._correct) {
        correctUsers.push(username);
      } else {
        wrongUsers.push({ user: username, answer: guess });
      }
    }
    return {
      correctAnswer: this._correct,
      correctUsers,
      wrongUsers,
    };
  }

  getMessage(): string {
    const numGuesses = this.getNumGuesses();
    const roundStatus = `***Fortschritt***: ${numGuesses} / ${this.maxNumGuesses}\n\n${this.printProgressBar(numGuesses / this.maxNumGuesses)}\n`;

    const msg = `***Zitat:***
${this.messageContent}
${roundStatus}
***Wer hat's gesagt?***
`;

    return msg;
  }

  private getChoiceById(id: string): string {
    return this.options.find(elem => elem.id === id)?.label ?? '';
  }

  /**
   * Print a simple progress bar
   * @param state State of the progress bar (0 - 1)
   * @returns Progress bar string
   */
  private printProgressBar(state: number): string {
    let barsPercentage = 0;
    if (state >= 1) {
      barsPercentage = QuizRound.progressBarNumBars;
    } else if (barsPercentage > 0) {
      barsPercentage = Math.max(
        Math.floor(QuizRound.progressBarNumBars * state),
        1
      );
    }

    let msg = '`' + QuizRound.progressBarStart;
    let idx = 0;
    for (; idx < barsPercentage; idx++) {
      msg += QuizRound.progressBarMiddle;
    }
    for (; idx < QuizRound.progressBarNumBars; idx++) {
      msg += QuizRound.progressBarEmpty;
    }
    msg += QuizRound.progressBarEnd + '`';

    return msg;
  }
}
