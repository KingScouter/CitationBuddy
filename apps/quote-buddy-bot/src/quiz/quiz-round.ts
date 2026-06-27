import { ParsedQuote } from '../models/parsed-quote';
import { QuizGuess, QuizOption, QuizRoundResult } from './models';

interface QuizGuessData {
  displayName: string;
  answer: string;
}

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
  private readonly _message: ParsedQuote;
  private readonly _quickRound: boolean;

  private readonly guesses = new Map<string, QuizGuessData>();

  messageId: string | null = null;

  get message(): ParsedQuote {
    return this._message;
  }

  get correct(): string {
    return this._correct;
  }

  get quickRound(): boolean {
    return this._quickRound;
  }

  constructor(
    options: QuizOption[],
    message: ParsedQuote,
    maxNumGuesses: number,
    quickRound = false
  ) {
    this.options = options;
    this._message = message;
    this._correct = message.person;
    this.messageContent = message.toAnonymString();
    this.maxNumGuesses = maxNumGuesses;
    this._quickRound = quickRound;
  }

  addGuess(user: string, displayName: string, choice: string): void {
    if (this.guesses.has(user)) {
      return;
    }

    this.guesses.set(user, {
      displayName,
      answer: this.getChoiceById(choice),
    });
  }

  getNumGuesses(): number {
    return this.guesses.size;
  }

  resolveRound(): QuizRoundResult {
    const correctUsers: string[] = [];
    const wrongUsers: QuizGuess[] = [];

    for (const [username, guess] of this.guesses.entries()) {
      if (guess.answer === this._correct) {
        correctUsers.push(username);
      } else {
        wrongUsers.push({ user: username, answer: guess.answer });
      }
    }
    return {
      correctAnswer: this._correct,
      correctUsers,
      wrongUsers,
    };
  }

  getMessage(isFinished = false): string {
    return this._quickRound ?
        this.getQuickRoundMessage(isFinished)
      : this.getQuizMessage(isFinished);
  }

  private getQuickRoundMessage(isFinished = false): string {
    const guesses = Array.from(this.guesses.values()).map(
      elem => elem.displayName
    );
    const numGuesses = this.getNumGuesses();
    const roundStatus = `***Fortschritt***: ${numGuesses} Tipps abgegeben\nStimmen: ${guesses.join(', ')}\n`;

    const linkContent = isFinished ? `||${this._message.getLink()}||\n` : '';

    const msg = `***Zitat:***
${this.messageContent}
${roundStatus}
${linkContent}
***Wer hat's gesagt?***
`;

    return msg;
  }

  private getQuizMessage(isFinished = false): string {
    const numGuesses = this.getNumGuesses();
    const roundStatus = `***Fortschritt***: ${numGuesses} / ${this.maxNumGuesses}\n\n${this.printProgressBar(numGuesses / this.maxNumGuesses)}\n`;

    const linkContent = isFinished ? `||${this._message.getLink()}||\n` : '';

    const msg = `***Zitat:***
${this.messageContent}
${roundStatus}
${linkContent}
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
