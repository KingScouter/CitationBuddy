interface QuizGuess {
  user: string;
  answer: string;
}

export interface QuizChoice {
  label: string;
  id: string;
}

export interface QuizRoundResult {
  correctAnswer: string;
  correctUsers: string[];
  wrongUsers: QuizGuess[];
}

export class QuizRound {
  private readonly options: QuizChoice[];
  private readonly correct: string;

  private readonly guesses = new Map<string, string>();

  constructor(options: QuizChoice[], correct: string) {
    this.options = options;
    this.correct = correct;
  }

  addGuess(user: string, choice: string): void {
    this.guesses.set(user, this.getChoiceById(choice));
  }

  getChoiceById(id: string): string {
    return this.options.find(elem => elem.id === id)?.label ?? '';
  }

  resolveRound(): QuizRoundResult | null {
    const correctUsers: string[] = [];
    const wrongUsers: QuizGuess[] = [];

    for (const [username, guess] of this.guesses.entries()) {
      if (guess === this.correct) {
        correctUsers.push(username);
      } else {
        wrongUsers.push({ user: username, answer: guess });
      }
    }
    return {
      correctAnswer: this.getChoiceById(this.correct),
      correctUsers,
      wrongUsers,
    };
  }
}

export class Quiz {
  private readonly id: string;

  private readonly users: string[] = [];

  private readonly scores = new Map<string, number>();

  private currRound: QuizRound | null = null;

  constructor(id: string) {
    this.id = id;
  }

  addUser(user: string) {
    this.users.push(user);
    this.scores.set(user, 0);
  }

  addSuccess(user: string): void {
    let score = this.scores.get(user);
    if (!score) {
      score = 0;
    }

    this.scores.set(user, ++score);
  }

  startRound(choices: QuizChoice[], answer: string): QuizRound {
    const quizRound = new QuizRound(choices, answer);
    this.currRound = quizRound;
    return quizRound;
  }

  addGuess(user: string, answer: string): void {
    if (!this.currRound) {
      return;
    }

    this.currRound.addGuess(user, answer);
  }

  resolveRound(): QuizRoundResult | null {
    const round = this.currRound;
    if (!round) {
      return null;
    }

    const result = round.resolveRound();
    this.currRound = null;
    return result;
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

  startQuiz(id: string): Quiz {
    const quiz = new Quiz(id);
    this.openQuizes.set(id, quiz);
    return quiz;
  }

  getQuiz(id: string): Quiz | null {
    return this.openQuizes.get(id) ?? null;
  }
}
