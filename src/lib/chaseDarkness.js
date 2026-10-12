/** Checkpoints of lead before the player screen starts dimming. */
export const DARKEN_LEAD = 1;

/** 0 when the monster is far, 1 when it has reached the player. */
export function chaseDarkness(progress, monster) {
  const lead = Number(progress) - Number(monster);
  if (!Number.isFinite(lead) || lead <= 0) return 1;
  const proximity = 1 - lead / DARKEN_LEAD;
  if (proximity <= 0) return 0;
  return proximity * proximity;
}
