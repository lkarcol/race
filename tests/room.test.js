import test from "node:test";
import assert from "node:assert/strict";
import { InterviewRoom } from "../server/InterviewRoom.js";

// Exercise the real room message handlers and Schema state without network access.
function roomFixture() {
  const handlers = new Map();
  const room = {
    hostId: "host-session",
    setState(state) {
      this.state = state;
    },
    setPatchRate() {},
    setSimulationInterval() {},
    onMessage(type, handler) {
      handlers.set(type, handler);
    },
    isHost: InterviewRoom.prototype.isHost,
    sync: InterviewRoom.prototype.sync,
  };
  InterviewRoom.prototype.onCreate.call(room);
  return {
    room,
    send: (id, payload) =>
      handlers.get("monster-speed")({ sessionId: id }, payload),
  };
}

test("only the host can change synchronized monster speed", () => {
  const { room, send } = roomFixture();
  send("player-session", { multiplier: 2 });
  assert.equal(room.engine.monsterSpeed, 1);
  assert.equal(room.state.monsterSpeed, 1);
  send("host-session", { multiplier: 1.75 });
  assert.equal(room.engine.monsterSpeed, 1.75);
  assert.equal(room.state.monsterSpeed, 1.75);
});

test("malformed host speed messages cannot change the synchronized setting", () => {
  const { room, send } = roomFixture();
  for (const payload of [
    null,
    {},
    { multiplier: "2" },
    { multiplier: 9 },
    { multiplier: NaN },
  ]) {
    send("host-session", payload);
    assert.equal(room.state.monsterSpeed, 1);
  }
});
