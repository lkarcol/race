import { Room, ServerError } from "@colyseus/core";
import { Schema, MapSchema, defineTypes, Encoder } from "@colyseus/schema";
import { randomInt } from "node:crypto";
import { GameEngine } from "./GameEngine.js";
import { normalizeAvatar } from "../shared/avatars.js";
import { defaultQuiz } from "./defaultQuiz.js";

// Photo avatars are JPEG data URLs. The default 8 KB encoder buffer overflows
// as soon as one custom face is synced to the room.
Encoder.BUFFER_SIZE = 4 * 1024 * 1024;

class PlayerState extends Schema {}
defineTypes(PlayerState, {
  id: "string",
  name: "string",
  avatar: "string",
  progress: "number",
  questionIndex: "number",
  score: "number",
  status: "string",
  stunUntil: "number",
  finishedAt: "number",
  rank: "number",
  connected: "boolean",
});
class RaceState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.phase = "lobby";
    this.elapsed = 0;
    this.monster = -0.65;
    this.monsterSpeed = 1;
    this.monsterCurrentSpeed = 1;
    this.monsterBaseSpeed = 0;
    this.paused = false;
    this.pausedAt = 0;
    this.roomCode = "";
    this.serverTime = Date.now();
    this.quizJson = "[]";
    this.quizRevision = 0;
    this.wrongAnswerSeconds = 3;
  }
}
defineTypes(RaceState, {
  players: { map: PlayerState },
  phase: "string",
  elapsed: "number",
  monster: "number",
  monsterSpeed: "number",
  monsterCurrentSpeed: "number",
  monsterBaseSpeed: "number",
  paused: "boolean",
  pausedAt: "number",
  roomCode: "string",
  serverTime: "number",
  quizJson: "string",
  quizRevision: "number",
  wrongAnswerSeconds: "number",
});

export class InterviewRoom extends Room {
  maxClients = 41;
  onCreate(options = {}) {
    this.roomId = String(randomInt(100000, 1000000));
    this.engine = new GameEngine();
    if (options.quizConfig) {
      try {
        this.engine.configureQuiz(options.quizConfig);
      } catch (error) {
        throw new ServerError(400, error.message);
      }
    }
    this.setState(new RaceState());
    this.state.roomCode = this.roomId;
    this.setPatchRate(100);
    this.onMessage("start", (client) => {
      if (this.isHost(client)) {
        this.engine.start();
        this.sync();
      }
    });
    this.onMessage("pause", (client) => {
      if (this.isHost(client)) {
        this.engine.togglePause();
        this.sync();
      }
    });
    this.onMessage("monster-speed", (client, message) => {
      if (!this.isHost(client)) return;
      if (this.engine.setMonsterSpeed(message?.multiplier)) this.sync();
    });
    this.onMessage("get-quiz-config", (client) => {
      if (this.isHost(client))
        client.send("quiz-config", {
          config: this.engine.quiz,
          defaults: defaultQuiz(),
        });
    });
    this.onMessage("configure-quiz", (client, config) => {
      if (!this.isHost(client)) return;
      try {
        this.engine.configureQuiz(config);
        this.sync();
        client.send("quiz-config", {
          config: this.engine.quiz,
          defaults: defaultQuiz(),
          saved: true,
        });
      } catch (error) {
        client.send("quiz-config-error", { message: error.message });
      }
    });
    this.onMessage("reset", (client) => {
      if (!this.isHost(client)) return;
      for (const [id, player] of this.engine.players)
        if (player.departed) this.engine.players.delete(id);
      this.engine.reset();
      this.sync();
    });
    this.onMessage("answer", (client, message) => {
      if (this.isHost(client)) return;
      const feedback = this.engine.answer(
        client.sessionId,
        message?.questionIndex,
        message?.optionIndex,
      );
      client.send("feedback", feedback);
      this.sync();
    });
    this.setSimulationInterval(() => {
      this.engine.tick();
      this.sync();
    }, 100);
  }
  isHost(client) {
    return client.sessionId === this.hostId;
  }
  onJoin(client, options = {}) {
    if (!this.hostId && options.role === "host") this.hostId = client.sessionId;
    else if (options.role === "host")
      throw new ServerError(403, "This room already has a host.");
    else {
      let avatar;
      try {
        avatar = normalizeAvatar(options.avatar);
        this.engine.addPlayer(client.sessionId, options.name, avatar);
      } catch (error) {
        throw new ServerError(400, error.message);
      }
    }
    this.sync();
  }
  async onLeave(client, consented) {
    const player = this.engine.players.get(client.sessionId);
    if (player) player.connected = false;
    this.sync();
    if (!consented) {
      try {
        await this.allowReconnection(client, 30);
        if (player) player.connected = true;
        this.sync();
        return;
      } catch {
        /* Seat expired. */
      }
    }
    if (player) {
      player.departed = true;
      if (this.engine.phase === "lobby")
        this.engine.players.delete(client.sessionId);
      else if (player.status === "active") {
        player.status = "out";
        this.engine.checkEnd();
      }
    }
    if (this.isHost(client)) {
      this.broadcast("host-left");
      this.disconnect();
    }
    this.sync();
  }
  sync() {
    Object.assign(this.state, {
      phase: this.engine.phase,
      elapsed: this.engine.elapsed,
      monster: this.engine.monster,
      monsterSpeed: this.engine.monsterSpeed,
      monsterCurrentSpeed: this.engine.monsterCurrentSpeed,
      monsterBaseSpeed: this.engine.rules.monsterSpeed,
      paused: this.engine.paused,
      pausedAt: this.engine.paused ? this.engine.pausedAt : 0,
      serverTime: Date.now(),
      wrongAnswerSeconds: this.engine.rules.stunMs / 1000,
    });
    if (this.state.quizRevision !== this.engine.quizRevision) {
      this.state.quizJson = JSON.stringify(this.engine.questions);
      this.state.quizRevision = this.engine.quizRevision;
    }
    for (const [id, player] of this.engine.players) {
      if (!this.state.players.has(id))
        this.state.players.set(id, new PlayerState());
      const target = this.state.players.get(id);
      for (const field of [
        "id",
        "name",
        "avatar",
        "progress",
        "questionIndex",
        "score",
        "status",
        "stunUntil",
        "finishedAt",
        "rank",
        "connected",
      ])
        target[field] = player[field];
    }
    for (const id of this.state.players.keys())
      if (!this.engine.players.has(id)) this.state.players.delete(id);
  }
}
