export const MONSTER_SPEED = Object.freeze({
  min: 0.1,
  max: 2,
  step: 0.01,
  default: 1,
  smoothingSeconds: 0.35,
  base: 0.16,
});

export function isValidMonsterSpeed(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MONSTER_SPEED.min &&
    value <= MONSTER_SPEED.max &&
    Math.abs(
      value / MONSTER_SPEED.step - Math.round(value / MONSTER_SPEED.step),
    ) < 1e-8
  );
}
