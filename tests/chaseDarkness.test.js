import test from "node:test";
import assert from "node:assert/strict";
import { DARKEN_LEAD, chaseDarkness } from "../src/lib/chaseDarkness.js";

test("a far lead keeps the player screen bright", () => {
  assert.equal(chaseDarkness(2, -0.65), 0);
  assert.equal(chaseDarkness(3, 1), 0);
});

test("darkness eases in as the monster closes the gap", () => {
  const start = chaseDarkness(0, -0.65);
  const closer = chaseDarkness(0, -0.2);
  const imminent = chaseDarkness(0, -0.05);
  assert.ok(start > 0 && start < 0.4);
  assert.ok(closer > start);
  assert.ok(imminent > closer && imminent < 1);
  assert.equal(chaseDarkness(0, -DARKEN_LEAD), 0);
});

test("the screen is fully dark once the monster reaches the player", () => {
  assert.equal(chaseDarkness(0, 0), 1);
  assert.equal(chaseDarkness(1, 1.2), 1);
});
