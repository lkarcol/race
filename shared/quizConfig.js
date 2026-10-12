import { checkpoints } from "./questions.js";

export const QUIZ_LIMITS = Object.freeze({
  questions: 50,
  answersMin: 2,
  answersMax: 6,
  imageLength: 180000,
  totalLength: 1500000,
  timeoutMax: 60,
});
export const ILLUSTRATIONS = [
  "arrival",
  "manhole",
  "nervous",
  "uncertain",
  "overconfident",
  "expressive",
];

function text(value, max, label, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Error(
      `${label} ${required ? "is required and " : ""}must be at most ${max} characters.`,
    );
  return value.trim();
}
function illustration(value) {
  if (!value) return "";
  if (!ILLUSTRATIONS.includes(value))
    throw new Error("Choose a supported SVG illustration.");
  return value;
}
export function normalizeQuizConfig(config) {
  if (
    !config ||
    !Array.isArray(config.questions) ||
    !config.questions.length ||
    config.questions.length > QUIZ_LIMITS.questions
  )
    throw new Error(`Add between 1 and ${QUIZ_LIMITS.questions} questions.`);
  if (JSON.stringify(config).length > QUIZ_LIMITS.totalLength)
    throw new Error("This quiz is too large. Remove some images.");
  const timeout = config.wrongAnswerSeconds;
  if (
    !Number.isInteger(timeout) ||
    timeout < 0 ||
    timeout > QUIZ_LIMITS.timeoutMax
  )
    throw new Error(
      `Wrong-answer timeout must be a whole number from 0 to ${QUIZ_LIMITS.timeoutMax} seconds.`,
    );
  const ids = new Set();
  const questions = config.questions
    .map((q, index) => {
      if (!q || typeof q !== "object")
        throw new Error(`Question ${index + 1} is invalid.`);
      const id = text(q.id, 80, "Question ID", true);
      if (ids.has(id)) throw new Error("Question IDs must be unique.");
      ids.add(id);
      if (
        !Number.isInteger(q.checkpointIndex) ||
        !checkpoints[q.checkpointIndex]
      )
        throw new Error(`Choose a map place for question ${index + 1}.`);
      if (
        !Array.isArray(q.options) ||
        q.options.length < QUIZ_LIMITS.answersMin ||
        q.options.length > QUIZ_LIMITS.answersMax
      )
        throw new Error(`Question ${index + 1} needs 2–6 answers.`);
      if (!Number.isInteger(q.correctIndex) || !q.options[q.correctIndex])
        throw new Error(`Mark the correct answer for question ${index + 1}.`);
      const image = q.image || "";
      if (
        typeof image !== "string" ||
        image.length > QUIZ_LIMITS.imageLength ||
        (image &&
          !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
            image,
          ))
      )
        throw new Error(
          "Use a JPEG, PNG, or WebP image within the image size limit.",
        );
      const options = q.options.map((option, i) => ({
        label: text(
          option?.label,
          500,
          `Question ${index + 1}, answer ${i + 1}`,
          true,
        ),
        ...(option?.illustration
          ? { illustration: illustration(option.illustration) }
          : {}),
      }));
      return {
        id,
        checkpointIndex: q.checkpointIndex,
        title: text(q.title || "Custom question", 120, "Question title", true),
        category: text(
          q.category || "Interview practice",
          100,
          "Question category",
          true,
        ),
        mapLabel: text(
          q.mapLabel || q.category || "Interview practice",
          100,
          "Map label",
          true,
        ),
        prompt: text(q.prompt, 2000, `Question ${index + 1} prompt`, true),
        type: options.some((o) => o.illustration) ? "posture" : "text",
        illustration: illustration(q.illustration),
        image,
        imageAlt: text(
          q.imageAlt || "Question illustration",
          200,
          "Image description",
        ),
        options,
        correctIndex: q.correctIndex,
        explanation: text(q.explanation || "", 2000, "Explanation"),
      };
    })
    .sort((a, b) => a.checkpointIndex - b.checkpointIndex);
  return { wrongAnswerSeconds: timeout, questions };
}

export function publicQuestions(config) {
  return config.questions.map(
    ({ correctIndex, explanation, ...question }) => question,
  );
}
export function questionPlace(questions, index) {
  return questions[index]?.checkpointIndex ?? checkpoints.length - 1;
}
