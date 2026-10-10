import test from "node:test";
import assert from "node:assert/strict";
import { advanceMonsterMotion } from "../shared/monsterMotion.js";

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
    chaseSeconds: 8,
  });
  let speed = 1;
  let distance = 0;
  for (let i = 0; i < 100; i++) {
    const next = advanceMonsterMotion({
      speed,
      target: 2,
      seconds: 0.01,
      chaseSeconds: 8 + i * 0.01,
    });
    speed = next.speed;
    distance += next.distance;
  }
  assert.ok(Math.abs(speed - oneTick.speed) < 1e-12);
  assert.ok(Math.abs(distance - oneTick.distance) < 1e-12);
});

test("no elapsed time leaves the current speed and position unchanged", () => {
  assert.deepEqual(
    advanceMonsterMotion({ speed: 1.37, target: 2, seconds: 0 }),
    { speed: 1.37, distance: 0 },
  );
});
