import { QuizGuess } from './quiz-guess';

export interface QuizRoundResult {
  correctAnswer: string;
  correctUsers: string[];
  wrongUsers: QuizGuess[];
}
