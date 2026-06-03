interface QuizGuess {
  user: string;
  answer: string;
}

export interface QuizOption {
  label: string;
  id: string;
}

export interface QuizRoundResult {
  correctAnswer: string;
  correctUsers: string[];
  wrongUsers: QuizGuess[];
}

export class QuizRound {
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
    const roundStatus = `Status: ${this.getNumGuesses()} / ${this.maxNumGuesses}\n`;

    const msg = `Zitat:
${this.messageContent}
${roundStatus}
Wer hat's gesagt?
`;

    return msg;
  }

  private getChoiceById(id: string): string {
    return this.options.find(elem => elem.id === id)?.label ?? '';
  }
}

export class Quiz {
  private readonly _guildId: string;
  private readonly users: string[] = [];
  private readonly scores = new Map<string, number>();

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
    this.scores.set(user, 0);

    return true;
  }

  addSuccess(user: string): void {
    let score = this.scores.get(user);
    if (!score) {
      score = 0;
    }

    this.scores.set(user, ++score);
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
}

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
