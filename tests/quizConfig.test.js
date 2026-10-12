import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeQuizConfig,
  publicQuestions,
  QUIZ_LIMITS,
} from "../shared/quizConfig.js";
import { defaultQuiz } from "../server/defaultQuiz.js";
import { GameEngine } from "../server/GameEngine.js";

test("quiz assignments are ordered by place and preserve order within a place", () => {
  const config = defaultQuiz();
  config.questions[0].checkpointIndex = 3;
  config.questions[3].checkpointIndex = 0;
  config.questions[2].checkpointIndex = 1;
  const quiz = normalizeQuizConfig(config);
  assert.deepEqual(
    quiz.questions.map((q) => q.checkpointIndex),
    [0, 1, 1, 3],
  );
  assert.deepEqual(
    quiz.questions.slice(1, 3).map((q) => q.id),
    ["corporate-lexicon", "behavioral-clues"],
  );
  assert.ok(
    publicQuestions(quiz).every(
      (q) => !("correctIndex" in q) && !("explanation" in q),
    ),
  );
});

test("invalid questions, answers, places, media and timeouts are rejected", () => {
  const mutations = [
    (c) => (c.questions = []),
    (c) =>
      (c.questions = Array.from(
        { length: QUIZ_LIMITS.questions + 1 },
        (_, i) => ({ ...c.questions[0], id: String(i) }),
      )),
    (c) => (c.questions[0].prompt = " "),
    (c) => (c.questions[0].prompt = "x".repeat(2001)),
    (c) => (c.questions[0].options = [{ label: "Only answer" }]),
    (c) => (c.questions[0].options[0].label = ""),
    (c) => (c.questions[0].correctIndex = 4),
    (c) => (c.questions[0].checkpointIndex = -1),
    (c) => (c.questions[0].checkpointIndex = 5),
    (c) => (c.questions[1].id = c.questions[0].id),
    (c) => (c.questions[0].image = "https://example.com/image.png"),
    (c) => (c.questions[0].image = "data:image/svg+xml;base64,AAAA"),
    (c) =>
      (c.questions[0].image = "data:image/jpeg;base64," + "A".repeat(180001)),
    (c) => (c.questions[0].illustration = "unknown"),
    (c) => (c.wrongAnswerSeconds = 61),
    (c) => (c.wrongAnswerSeconds = -1),
    (c) => (c.wrongAnswerSeconds = 1.5),
    (c) => (c.wrongAnswerSeconds = "3"),
  ];
  for (const mutate of mutations) {
    const config = defaultQuiz();
    mutate(config);
    assert.throws(() => normalizeQuizConfig(config));
  }
});

test("uploaded images and six answer choices survive normalization", () => {
  const config = defaultQuiz();
  config.questions[0].image = "data:image/jpeg;base64,/9j/2Q==";
  config.questions[0].options.push({ label: "E" }, { label: "F" });
  config.questions[0].correctIndex = 5;
  const normalized = normalizeQuizConfig(config);
  assert.equal(normalized.questions[0].image, config.questions[0].image);
  assert.equal(normalized.questions[0].correctIndex, 5);
  assert.equal(normalized.questions[0].options.length, 6);
});

test("multiple questions at one place do not move a player until the group is cleared", () => {
  let now = 10000;
  const engine = new GameEngine(() => now, { monsterSpeed: 0 });
  const config = defaultQuiz();
  config.questions = [
    { ...config.questions[0], id: "one", checkpointIndex: 0 },
    { ...config.questions[1], id: "two", checkpointIndex: 0 },
    { ...config.questions[2], id: "three", checkpointIndex: 4 },
  ];
  engine.configureQuiz(config);
  engine.addPlayer("p", "Alex");
  engine.start();
  const p = engine.players.get("p");
  assert.equal(engine.answer("p", 0, 3).correct, true);
  assert.equal(p.questionIndex, 1);
  assert.equal(p.progress, 0);
  assert.equal(engine.answer("p", 0, 3).accepted, false);
  assert.equal(engine.answer("p", 1, 1).correct, true);
  assert.equal(p.progress, 4);
  assert.equal(p.status, "active");
  assert.equal(engine.answer("p", 2, 2).correct, true);
  assert.equal(p.questionIndex, 3);
  assert.equal(p.status, "finished");
  assert.equal(engine.phase, "finished");
  engine.reset();
  assert.equal(p.questionIndex, 0);
  assert.equal(p.progress, 0);
  assert.equal(engine.questions.length, 3);
});

test("custom timeout is enforced, freezes while paused, and survives reset", () => {
  let now = 10000;
  const engine = new GameEngine(() => now, { monsterSpeed: 0 });
  engine.configureQuiz({ ...defaultQuiz(), wrongAnswerSeconds: 7 });
  engine.addPlayer("p", "Alex");
  engine.start();
  const wrong = engine.answer("p", 0, 0);
  assert.equal(wrong.stunUntil, now + 7000);
  assert.match(wrong.explanation, /7-second/);
  now += 2000;
  engine.togglePause();
  now += 20000;
  engine.togglePause();
  now += 4999;
  assert.equal(engine.answer("p", 0, 3).accepted, false);
  now++;
  assert.equal(engine.answer("p", 0, 3).correct, true);
  assert.throws(() => engine.configureQuiz(defaultQuiz()), /Reset/);
  engine.reset();
  assert.equal(engine.rules.stunMs, 7000);
});

test("zero timeout allows an immediate retry without a lockout", () => {
  const engine = new GameEngine(() => 10000);
  engine.configureQuiz({ ...defaultQuiz(), wrongAnswerSeconds: 0 });
  engine.addPlayer("p", "Alex");
  engine.start();
  assert.equal(engine.answer("p", 0, 0).stunUntil, 0);
  assert.equal(engine.answer("p", 0, 3).correct, true);
});
