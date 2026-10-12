import { questions } from "../shared/questions.js";
import { answers, explanations } from "./answers.js";
import { normalizeQuizConfig } from "../shared/quizConfig.js";

export function defaultQuiz() {
  return normalizeQuizConfig({
    wrongAnswerSeconds: 3,
    questions: questions.map((q, i) => ({
      ...q,
      checkpointIndex: i,
      correctIndex: answers[i],
      explanation: explanations[i],
    })),
  });
}
