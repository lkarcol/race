import { MONSTER_SPEED } from "./settings.js";

/** Exact integration of a speed that eases toward its target, independent of tick rate. */
export function advanceMonsterMotion({
  speed,
  target,
  seconds,
  chaseSeconds = 0,
  baseSpeed = 0.032,
  acceleration = 0.0001,
}) {
  if (seconds <= 0) return { speed, distance: 0 };
  const tau = MONSTER_SPEED.smoothingSeconds;
  const decay = Math.exp(-seconds / tau);
  const easedTime = -tau * Math.expm1(-seconds / tau);
  const easedTimeMoment = tau * (easedTime - seconds * decay);
  const velocity = baseSpeed + 2 * acceleration * chaseSeconds;
  const difference = speed - target;
  return {
    speed: target + difference * decay,
    distance:
      target * (velocity * seconds + acceleration * seconds * seconds) +
      difference * (velocity * easedTime + 2 * acceleration * easedTimeMoment),
  };
}
