import test from "node:test";
import assert from "node:assert/strict";
import { InterviewRoom } from "../server/InterviewRoom.js";

// Exercise the real room message handlers and Schema state without network access.
function roomFixture() {
  const handlers = new Map();
  const room = {
    hostId: "host-session",
    setState(state) {
      this.state = state;
    },
    setPatchRate() {},
    setSimulationInterval() {},
    onMessage(type, handler) {
      handlers.set(type, handler);
    },
    isHost: InterviewRoom.prototype.isHost,
    sync: InterviewRoom.prototype.sync,
  };
  InterviewRoom.prototype.onCreate.call(room);
  return {
    room,
    send: (id, payload) =>
      handlers.get("monster-speed")({ sessionId: id }, payload),
    message: (type, client, payload) => handlers.get(type)(client, payload),
  };
}

test("only the host can change synchronized monster speed", () => {
  const { room, send } = roomFixture();
  send("player-session", { multiplier: 2 });
  assert.equal(room.engine.monsterSpeed, 1);
  assert.equal(room.state.monsterSpeed, 1);
  send("host-session", { multiplier: 1.75 });
  assert.equal(room.engine.monsterSpeed, 1.75);
  assert.equal(room.state.monsterSpeed, 1.75);
});

test("chase snapshots expose actual eased speed and base speed for player countdowns", () => {
  const { room, send } = roomFixture();
  let now = 0;
  room.engine.now = () => now;
  room.engine.addPlayer("p", "Player");
  room.engine.start();
  send("host-session", { multiplier: 2 });
  now = 100;
  room.engine.tick();
  room.sync();
  assert.equal(room.state.monsterSpeed, 2);
  assert.equal(room.state.monsterCurrentSpeed, room.engine.monsterCurrentSpeed);
  assert.ok(
    room.state.monsterCurrentSpeed > 1 && room.state.monsterCurrentSpeed < 2,
  );
  assert.equal(room.state.monsterBaseSpeed, room.engine.rules.monsterSpeed);
  room.engine.togglePause();
  const position = room.state.monster;
  now = 5000;
  room.engine.tick();
  room.sync();
  assert.equal(room.state.monster, position);
  assert.equal(room.state.paused, true);
});

test("only the host can read answer keys or configure a quiz; public state hides them", () => {
  const { room, message } = roomFixture();
  const sent = [];
  const player = { sessionId: "player", send: (...args) => sent.push(args) };
  const host = {
    sessionId: "host-session",
    send: (...args) => sent.push(args),
  };
  message("get-quiz-config", player);
  message("configure-quiz", player, { wrongAnswerSeconds: 60 });
  assert.equal(sent.length, 0);
  assert.equal(room.engine.rules.stunMs, 3000);
  message("get-quiz-config", host);
  const config = structuredClone(sent[0][1].config);
  assert.equal(config.questions[0].correctIndex, 3);
  config.wrongAnswerSeconds = 8;
  config.questions.push({ ...config.questions[0], id: "second-at-uniza" });
  message("configure-quiz", host, config);
  assert.equal(room.state.wrongAnswerSeconds, 8);
  const publicQuiz = JSON.parse(room.state.quizJson);
  assert.equal(publicQuiz.length, 5);
  assert.equal(publicQuiz[1].id, "second-at-uniza");
  assert.ok(
    publicQuiz.every((q) => !("correctIndex" in q) && !("explanation" in q)),
  );
  assert.equal(sent.at(-1)[1].saved, true);
  room.engine.addPlayer("p", "Player");
  room.engine.start();
  message("configure-quiz", host, { ...config, wrongAnswerSeconds: 9 });
  assert.equal(sent.at(-1)[0], "quiz-config-error");
  assert.equal(room.engine.rules.stunMs, 8000);
});

test("a malformed quiz fails atomically and host creation accepts a saved quiz", () => {
  const { room, message } = roomFixture();
  const sent = [];
  const before = room.state.quizJson;
  message(
    "configure-quiz",
    { sessionId: "host-session", send: (...args) => sent.push(args) },
    { questions: [] },
  );
  assert.equal(sent[0][0], "quiz-config-error");
  assert.equal(room.state.quizJson, before);
  const saved = structuredClone(room.engine.quiz);
  saved.wrongAnswerSeconds = 12;
  const restored = {
    setState(state) {
      this.state = state;
    },
    setPatchRate() {},
    setSimulationInterval() {},
    onMessage() {},
    sync: InterviewRoom.prototype.sync,
  };
  InterviewRoom.prototype.onCreate.call(restored, { quizConfig: saved });
  restored.sync();
  assert.equal(restored.state.wrongAnswerSeconds, 12);
});

test("malformed host speed messages cannot change the synchronized setting", () => {
  const { room, send } = roomFixture();
  for (const payload of [
    null,
    {},
    { multiplier: "2" },
    { multiplier: 9 },
    { multiplier: NaN },
  ]) {
    send("host-session", payload);
    assert.equal(room.state.monsterSpeed, 1);
  }
});
