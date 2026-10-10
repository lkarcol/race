import { Room, ServerError } from "@colyseus/core";
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";
import { randomInt } from "node:crypto";
import { GameEngine } from "./GameEngine.js";

class PlayerState extends Schema {}
defineTypes(PlayerState, {
  id: "string",
  name: "string",
  avatar: "string",
  progress: "number",
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
    this.paused = false;
    this.roomCode = "";
    this.serverTime = Date.now();
  }
}
defineTypes(RaceState, {
  players: { map: PlayerState },
  phase: "string",
  elapsed: "number",
  monster: "number",
  monsterSpeed: "number",
  paused: "boolean",
  roomCode: "string",
  serverTime: "number",
});

export class InterviewRoom extends Room {
  maxClients = 41;
  onCreate() {
    this.roomId = String(randomInt(100000, 1000000));
    this.engine = new GameEngine();
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
      let avatar = String(options.avatar ?? "seed:0");
      if (
        !/^seed:[0-7]$/.test(avatar) &&
        (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(avatar) ||
          avatar.length > 70000)
      )
        avatar = "seed:0";
      try {
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
      paused: this.engine.paused,
      serverTime: Date.now(),
    });
    for (const [id, player] of this.engine.players) {
      if (!this.state.players.has(id))
        this.state.players.set(id, new PlayerState());
      const target = this.state.players.get(id);
      for (const field of [
        "id",
        "name",
        "avatar",
        "progress",
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
