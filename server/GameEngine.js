import { answers, explanations } from "./answers.js";
import { MONSTER_SPEED, isValidMonsterSpeed } from "../shared/settings.js";
import { advanceMonsterMotion } from "../shared/monsterMotion.js";

export const RULES = Object.freeze({
  grace: 12,
  monsterSpeed: 0.032,
  acceleration: 0.0001,
  stunMs: 3000,
  maxSeconds: 150,
  seats: 3,
  maxPlayers: 40,
});

/** Pure authoritative race state. The clock is injectable for deterministic tests. */
export class GameEngine {
  constructor(now = () => Date.now(), rules = {}) {
    this.now = now;
    this.rules = { ...RULES, ...rules };
    this.players = new Map();
    this.phase = "lobby";
    this.elapsed = 0;
    this.monster = -0.65;
    this.monsterSpeed = MONSTER_SPEED.default;
    this.monsterCurrentSpeed = this.monsterSpeed;
    this.paused = false;
    this.lastTick = this.now();
    this.finishOrder = 0;
  }
  addPlayer(id, name, avatar = "seed:0") {
    if (this.phase !== "lobby")
      throw new Error("This race has already started. Join the next one!");
    if (this.players.size >= this.rules.maxPlayers)
      throw new Error("This room is full.");
    const cleanName = String(name ?? "")
      .trim()
      .replace(/[\x00-\x1f<>]/g, "")
      .slice(0, 24);
    if (!cleanName) throw new Error("Please enter your name.");
    if (this.players.has(id)) throw new Error("Player already exists.");
    const player = {
      id,
      name: cleanName,
      avatar,
      progress: 0,
      score: 0,
      status: "active",
      stunUntil: 0,
      questionStarted: 0,
      finishedAt: 0,
      rank: 0,
      connected: true,
      attempts: 0,
    };
    this.players.set(id, player);
    return player;
  }
  start() {
    if (this.phase !== "lobby" || !this.players.size) return false;
    this.phase = "racing";
    this.lastTick = this.now();
    for (const player of this.players.values())
      player.questionStarted = this.now();
    return true;
  }
  togglePause() {
    if (this.phase !== "racing") return;
    this.paused = !this.paused;
    if (this.paused) this.pausedAt = this.now();
    else {
      const delta = this.now() - this.pausedAt;
      for (const p of this.players.values()) {
        p.questionStarted += delta;
        if (p.stunUntil) p.stunUntil += delta;
      }
      this.lastTick = this.now();
    }
  }
  setMonsterSpeed(multiplier) {
    if (!isValidMonsterSpeed(multiplier) || this.phase === "finished")
      return false;
    // Resolve elapsed movement at the old speed before applying the new speed.
    this.tick();
    if (this.phase === "finished") return false;
    this.monsterSpeed = multiplier;
    if (this.phase === "lobby" || this.elapsed <= this.rules.grace)
      this.monsterCurrentSpeed = multiplier;
    return true;
  }
  answer(id, questionIndex, optionIndex) {
    this.tick(); // Resolve catches before processing an answer arriving on the same tick.
    const p = this.players.get(id);
    if (!p || this.phase !== "racing" || this.paused || p.status !== "active")
      return { accepted: false, message: "The race is not accepting answers." };
    if (p.stunUntil > this.now())
      return {
        accepted: false,
        message: "Take a breath. Your penalty is still active.",
      };
    if (
      !Number.isInteger(questionIndex) ||
      questionIndex !== p.progress ||
      !Number.isInteger(optionIndex) ||
      optionIndex < 0 ||
      optionIndex > 2
    )
      return { accepted: false, message: "That question has already changed." };
    const correct = optionIndex === answers[questionIndex];
    p.attempts++;
    if (correct) {
      const seconds = (this.now() - p.questionStarted) / 1000;
      p.score += Math.max(
        100,
        1000 - Math.floor(seconds * 15) - (p.attempts - 1) * 150,
      );
      p.progress++;
      p.questionStarted = this.now();
      p.attempts = 0;
      p.stunUntil = 0;
      if (p.progress === 5) {
        p.status = "finished";
        p.finishedAt = this.elapsed;
        p.rank = ++this.finishOrder;
      }
    } else p.stunUntil = this.now() + this.rules.stunMs;
    this.checkEnd();
    return {
      accepted: true,
      correct,
      questionIndex,
      explanation: correct
        ? explanations[questionIndex]
        : "Not quite. You have a 3-second penalty. Consider the professional, respectful choice and try again.",
      stunUntil: p.stunUntil,
    };
  }
  tick() {
    const current = this.now();
    if (this.phase !== "racing" || this.paused) {
      this.lastTick = current;
      return;
    }
    const previousElapsed = this.elapsed;
    this.elapsed += Math.max(0, current - this.lastTick) / 1000;
    this.lastTick = current;
    const from = Math.max(0, previousElapsed - this.rules.grace);
    const to = Math.max(0, this.elapsed - this.rules.grace);
    const motion = advanceMonsterMotion({
      speed: this.monsterCurrentSpeed,
      target: this.monsterSpeed,
      seconds: to - from,
      chaseSeconds: from,
      baseSpeed: this.rules.monsterSpeed,
      acceleration: this.rules.acceleration,
    });
    this.monsterCurrentSpeed = motion.speed;
    this.monster += motion.distance;
    for (const p of this.players.values())
      if (p.status === "active" && this.monster >= p.progress)
        p.status = "caught";
    this.checkEnd();
  }
  checkEnd() {
    if (this.phase !== "racing") return;
    const active = [...this.players.values()].filter(
      (p) => p.status === "active",
    );
    if (
      this.finishOrder >= this.rules.seats ||
      !active.length ||
      this.elapsed >= this.rules.maxSeconds
    ) {
      this.phase = "finished";
      for (const p of active)
        p.status = this.finishOrder >= this.rules.seats ? "out" : "caught";
    }
  }
  reset() {
    this.phase = "lobby";
    this.elapsed = 0;
    this.monster = -0.65;
    this.monsterCurrentSpeed = this.monsterSpeed;
    this.paused = false;
    this.finishOrder = 0;
    this.lastTick = this.now();
    for (const p of this.players.values())
      Object.assign(p, {
        progress: 0,
        score: 0,
        status: "active",
        stunUntil: 0,
        finishedAt: 0,
        rank: 0,
        questionStarted: 0,
        attempts: 0,
      });
  }
}
