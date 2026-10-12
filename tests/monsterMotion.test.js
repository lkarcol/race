import test from "node:test";
import assert from "node:assert/strict";
import {
  advanceMonsterMotion,
  secondsUntilCaught,
} from "../shared/monsterMotion.js";
import { MONSTER_SPEED } from "../shared/settings.js";

test("speed ramps gradually without overshooting in either direction", () => {
  const fast = advanceMonsterMotion({ speed: 1, target: 2, seconds: 0.1 });
  assert.ok(fast.speed > 1 && fast.speed < 1.3);
  const slow = advanceMonsterMotion({
    speed: fast.speed,
    target: 0.5,
    seconds: 0.1,
  });
  assert.ok(slow.speed > 0.5 && slow.speed < fast.speed);
  assert.ok(fast.distance > 0 && slow.distance > 0);
  const settled = advanceMonsterMotion({ speed: 1, target: 2, seconds: 2 });
  assert.ok(settled.speed > 1.99 && settled.speed < 2);
});

test("smoothed distance and speed are independent of the simulation tick rate", () => {
  const oneTick = advanceMonsterMotion({
    speed: 1,
    target: 2,
    seconds: 1,
  });
  let speed = 1;
  let distance = 0;
  for (let i = 0; i < 100; i++) {
    const next = advanceMonsterMotion({
      speed,
      target: 2,
      seconds: 0.01,
    });
    speed = next.speed;
    distance += next.distance;
  }
  assert.ok(Math.abs(speed - oneTick.speed) < 1e-12);
  assert.ok(Math.abs(distance - oneTick.distance) < 1e-12);
});

test("a settled multiplier moves at a constant baseSpeed times that multiplier", () => {
  const moved = advanceMonsterMotion({
    speed: 2,
    target: 2,
    seconds: 5,
  });
  assert.equal(moved.speed, 2);
  assert.ok(Math.abs(moved.distance - MONSTER_SPEED.base * 2 * 5) < 1e-12);
});

test("no elapsed time leaves the current speed and position unchanged", () => {
  assert.deepEqual(
    advanceMonsterMotion({ speed: 1.37, target: 2, seconds: 0 }),
    { speed: 1.37, distance: 0 },
  );
});

test("catch countdown follows distance, speed, and forward progress", () => {
  const eta = (lead, speed) =>
    secondsUntilCaught({ lead, speed, target: speed, baseSpeed: 0.2 });
  assert.ok(Math.abs(eta(0.65, 1) - 3.25) < 1e-8);
  assert.ok(Math.abs(eta(0.65, 2) - 1.625) < 1e-8);
  assert.ok(eta(1.65, 1) > eta(0.65, 1));
  assert.equal(eta(0, 1), 0);
  assert.equal(eta(-1, 1), 0);
  assert.equal(eta(1, 0), null);
});

test("catch countdown includes both acceleration and deceleration", () => {
  for (const [speed, target] of [
    [0.5, 2],
    [2, 0.5],
  ]) {
    const input = { lead: 0.65, speed, target, baseSpeed: 0.2 };
    const seconds = secondsUntilCaught(input);
    const motion = advanceMonsterMotion({ ...input, seconds });
    assert.ok(Math.abs(motion.distance - input.lead) < 1e-8);
    // Advancing a snapshot must decrease the countdown by the same real time.
    const step = advanceMonsterMotion({ ...input, seconds: 0.1 });
    const remaining = secondsUntilCaught({
      ...input,
      lead: input.lead - step.distance,
      speed: step.speed,
    });
    assert.ok(Math.abs(remaining - (seconds - 0.1)) < 1e-8);
  }
});
