import test from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "../server/GameEngine.js";

function fixture(rules = {}) {
  let time = 100000;
  const engine = new GameEngine(() => time, rules);
  return {
    engine,
    advance(ms) {
      time += ms;
      engine.tick();
    },
  };
}
function finish(engine, id) {
  for (let i = 0; i < 5; i++)
    assert.equal(engine.answer(id, i, 1).correct, true);
}

test("validates and sanitizes player names and rejects late joins", () => {
  const { engine } = fixture();
  assert.throws(() => engine.addPlayer("empty", "   "));
  assert.equal(engine.addPlayer("p", " <Alex> ").name, "Alex");
  engine.start();
  assert.throws(() => engine.addPlayer("late", "Nina"));
});
test("a race requires a player and answers require a running race", () => {
  const { engine } = fixture();
  assert.equal(engine.start(), false);
  engine.addPlayer("p", "Alex");
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  engine.start();
  assert.equal(engine.answer("p", 0, 1).correct, true);
  assert.equal(engine.players.get("p").progress, 1);
});
test("stale, skipped, duplicate and malformed answers cannot advance a player", () => {
  const { engine } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  for (const [question, answer] of [
    [1, 1],
    [0, -1],
    [0, 3],
    [0, "1"],
    ["0", 1],
    [null, 1],
  ])
    assert.equal(engine.answer("p", question, answer).accepted, false);
  engine.answer("p", 0, 1);
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  assert.equal(engine.players.get("p").progress, 1);
});
test("wrong answers impose a full three-second lockout and permit a retry", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  assert.equal(engine.answer("p", 0, 0).correct, false);
  assert.equal(engine.players.get("p").progress, 0);
  advance(2999);
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  advance(1);
  assert.equal(engine.answer("p", 0, 1).correct, true);
  assert.equal(engine.players.get("p").score, 805);
});
test("pausing freezes the race, scoring clock and remaining penalty", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  engine.answer("p", 0, 0);
  advance(1000);
  engine.togglePause();
  advance(20000);
  assert.equal(engine.elapsed, 1);
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  engine.togglePause();
  advance(1999);
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  advance(1);
  assert.equal(engine.answer("p", 0, 1).correct, true);
  assert.equal(engine.players.get("p").score, 805);
});
test("the shadow respects its grace period then eliminates trailing players", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  advance(12000);
  assert.equal(engine.monster, -0.65);
  assert.equal(engine.players.get("p").status, "active");
  advance(20000);
  assert.equal(engine.players.get("p").status, "caught");
  assert.equal(engine.phase, "finished");
});
test("a catch at the current time resolves before a late answer", () => {
  let time = 100000;
  const engine = new GameEngine(() => time);
  engine.addPlayer("p", "Alex");
  engine.start();
  time += 40000;
  assert.equal(engine.answer("p", 0, 1).accepted, false);
  assert.equal(engine.players.get("p").status, "caught");
});
test("first three finishers claim seats in arrival order; fourth cannot finish", () => {
  const { engine } = fixture();
  ["a", "b", "c", "d"].forEach((id) => engine.addPlayer(id, id));
  engine.start();
  finish(engine, "b");
  assert.equal(engine.phase, "racing");
  finish(engine, "a");
  finish(engine, "c");
  assert.equal(engine.phase, "finished");
  assert.equal(engine.players.get("b").rank, 1);
  assert.equal(engine.players.get("a").rank, 2);
  assert.equal(engine.players.get("c").rank, 3);
  assert.equal(engine.players.get("d").status, "out");
  assert.equal(engine.answer("d", 0, 1).accepted, false);
});
test("a smaller class ends cleanly when all remaining players finish", () => {
  const { engine } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  finish(engine, "p");
  assert.equal(engine.phase, "finished");
  assert.equal(engine.players.get("p").status, "finished");
});
test("race timeout eliminates active players even if a custom monster is slow", () => {
  const { engine, advance } = fixture({ monsterSpeed: 0, acceleration: 0 });
  engine.addPlayer("p", "Alex");
  engine.start();
  advance(150000);
  assert.equal(engine.phase, "finished");
  assert.equal(engine.players.get("p").status, "caught");
});
test("reset retains identity and clears scores, status, penalties and race timing", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex", "seed:3");
  engine.start();
  engine.answer("p", 0, 1);
  engine.answer("p", 1, 0);
  advance(1000);
  engine.reset();
  const p = engine.players.get("p");
  assert.equal(p.avatar, "seed:3");
  assert.equal(p.name, "Alex");
  assert.equal(p.progress, 0);
  assert.equal(p.score, 0);
  assert.equal(p.stunUntil, 0);
  assert.equal(p.status, "active");
  assert.equal(engine.elapsed, 0);
  assert.equal(engine.phase, "lobby");
});
test("faster correct answers score higher and capacity is enforced", () => {
  const { engine, advance } = fixture({ maxPlayers: 2 });
  engine.addPlayer("a", "Alex");
  engine.addPlayer("b", "Sofia");
  assert.throws(() => engine.addPlayer("c", "Nina"));
  engine.start();
  engine.answer("a", 0, 1);
  advance(1000);
  engine.answer("b", 0, 1);
  assert.ok(engine.players.get("a").score > engine.players.get("b").score);
});

test("monster speed accepts bounded hundredth-step numeric multipliers", () => {
  const { engine } = fixture();
  assert.equal(engine.monsterSpeed, 1);
  for (const invalid of [0, 0.25, 2.25, -1, 1.001, NaN, Infinity, "2", null]) {
    assert.equal(engine.setMonsterSpeed(invalid), false);
    assert.equal(engine.monsterSpeed, 1);
  }
  for (const speed of [0.5, 0.51, 0.75, 1, 1.25, 1.37, 1.5, 1.75, 1.99, 2]) {
    assert.equal(engine.setMonsterSpeed(speed), true);
    assert.equal(engine.monsterSpeed, speed);
  }
});

test("slow and fast speeds scale chase distance while preserving the grace period", () => {
  const runs = [0.5, 1, 2].map((speed) => {
    const run = fixture();
    run.engine.addPlayer("p", "Alex");
    run.engine.setMonsterSpeed(speed);
    run.engine.start();
    run.advance(12000);
    assert.equal(run.engine.monster, -0.65);
    run.advance(5000);
    return run.engine.monster + 0.65;
  });
  assert.ok(Math.abs(runs[0] * 2 - runs[1]) < 1e-10);
  assert.ok(Math.abs(runs[1] * 2 - runs[2]) < 1e-10);
});

test("live speed changes preserve position and ease into the requested pace", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  advance(17000);
  const before = engine.monster;
  engine.setMonsterSpeed(2);
  assert.equal(engine.monster, before);
  assert.equal(engine.monsterCurrentSpeed, 1);
  advance(1000);
  const fastDistance = engine.monster - before;
  const normalDistance = 0.032 + 11 * 0.0001;
  assert.ok(fastDistance > normalDistance && fastDistance < 2 * normalDistance);
  assert.ok(engine.monsterCurrentSpeed > 1.9 && engine.monsterCurrentSpeed < 2);
  const beforeSlow = engine.monster;
  const previousSpeed = engine.monsterCurrentSpeed;
  engine.setMonsterSpeed(0.5);
  assert.equal(engine.monster, beforeSlow);
  assert.equal(engine.monsterCurrentSpeed, previousSpeed);
  advance(1000);
  assert.ok(engine.monster > beforeSlow);
  assert.ok(
    engine.monsterCurrentSpeed > 0.5 && engine.monsterCurrentSpeed < 0.6,
  );
});

test("speed changes while paused freeze position and persist into the next race", () => {
  const { engine, advance } = fixture();
  engine.addPlayer("p", "Alex");
  engine.start();
  advance(17000);
  engine.togglePause();
  const before = engine.monster;
  engine.setMonsterSpeed(0.5);
  advance(10000);
  assert.equal(engine.monster, before);
  assert.equal(engine.elapsed, 17);
  engine.togglePause();
  advance(1000);
  assert.ok(engine.monster > before);
  engine.reset();
  assert.equal(engine.monsterSpeed, 0.5);
  assert.equal(engine.monster, -0.65);
});

test("speed changes resolve pending movement at the previous speed", () => {
  let time = 100000;
  const engine = new GameEngine(() => time);
  engine.addPlayer("p", "Alex");
  engine.start();
  time += 17000;
  engine.setMonsterSpeed(2);
  assert.ok(
    Math.abs(engine.monster - (-0.65 + 5 * 0.032 + 25 * 0.0001)) < 1e-10,
  );
});
