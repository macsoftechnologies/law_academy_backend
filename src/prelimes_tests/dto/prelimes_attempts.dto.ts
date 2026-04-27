export class StartAttemptDto {
  userId: string;
  testId: string;
}

export class SaveAnswerDto {
  questionId: string;
  selectedAnswer: number; // null = skipped
}