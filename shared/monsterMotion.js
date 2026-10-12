import { MONSTER_SPEED } from "./settings.js";

/** Exact integration of a constant chase speed that eases toward a new multiplier. */
export function advanceMonsterMotion({
  speed,
  target,
  seconds,
  baseSpeed = MONSTER_SPEED.base,
}) {
  if (seconds <= 0) return { speed, distance: 0 };
  const tau = MONSTER_SPEED.smoothingSeconds;
  const decay = Math.exp(-seconds / tau);
  const easedTime = -tau * Math.expm1(-seconds / tau);
  const difference = speed - target;
  return {
    speed: target + difference * decay,
    distance: baseSpeed * (target * seconds + difference * easedTime),
  };
}

/** Time to reach a stationary player, including the current speed ramp. */
export function secondsUntilCaught({
  lead,
  speed,
  target,
  baseSpeed = MONSTER_SPEED.base,
}) {
  if (lead <= 0) return 0;
  if (
    ![lead, speed, target, baseSpeed].every(Number.isFinite) ||
    speed <= 0 ||
    target <= 0 ||
    baseSpeed <= 0
  )
    return null;
  let low = 0;
  let high = lead / (baseSpeed * Math.min(speed, target));
  for (let i = 0; i < 36; i++) {
    const mid = (low + high) / 2;
    const { distance } = advanceMonsterMotion({
      speed,
      target,
      baseSpeed,
      seconds: mid,
    });
    if (distance < lead) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
