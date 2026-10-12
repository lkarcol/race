import test from "node:test";
import assert from "node:assert/strict";
import { Encoder, Decoder } from "@colyseus/schema";
import {
  AVATAR_MAX_LENGTH,
  isPhotoAvatar,
  isSeedAvatar,
  normalizeAvatar,
} from "../shared/avatars.js";
import { InterviewRoom } from "../server/InterviewRoom.js";

function jpegDataUrl(chars = 80) {
  return `data:image/jpeg;base64,${"A".repeat(chars)}`;
}

function roomFixture() {
  const room = {
    hostId: "host-session",
    setState(state) {
      this.state = state;
    },
    setPatchRate() {},
    setSimulationInterval() {},
    onMessage() {},
    isHost: InterviewRoom.prototype.isHost,
    sync: InterviewRoom.prototype.sync,
  };
  InterviewRoom.prototype.onCreate.call(room);
  return room;
}

test("seed and jpeg avatars are accepted, invalid photos are rejected", () => {
  assert.equal(isSeedAvatar("seed:3"), true);
  assert.equal(isSeedAvatar("seed:8"), false);
  assert.equal(isPhotoAvatar(jpegDataUrl()), true);
  assert.equal(isPhotoAvatar("data:image/png;base64,AAAA"), false);
  assert.equal(isPhotoAvatar(jpegDataUrl(AVATAR_MAX_LENGTH)), false);
  assert.equal(normalizeAvatar("seed:5"), "seed:5");
  assert.equal(normalizeAvatar(jpegDataUrl(120)), jpegDataUrl(120));
  assert.equal(normalizeAvatar("mystery"), "seed:0");
  assert.throws(
    () => normalizeAvatar("data:image/png;base64,AAAA"),
    /JPEG/,
  );
});

test("a custom photo is stored on the player and synced onto Schema state", () => {
  const room = roomFixture();
  const photo = jpegDataUrl(20000);
  InterviewRoom.prototype.onJoin.call(
    room,
    { sessionId: "p1" },
    { name: "Alex", avatar: photo },
  );
  assert.equal(room.engine.players.get("p1").avatar, photo);
  assert.equal(room.state.players.get("p1").avatar, photo);
});

test("an invalid uploaded photo cannot join as a silent cartoon fallback", () => {
  const room = roomFixture();
  assert.throws(
    () =>
      InterviewRoom.prototype.onJoin.call(
        room,
        { sessionId: "p1" },
        { name: "Alex", avatar: "data:image/png;base64,AAAA" },
      ),
    /JPEG/,
  );
  assert.equal(room.engine.players.has("p1"), false);
});

test("a 20 KB photo avatar survives Colyseus Schema encode and decode", () => {
  const room = roomFixture();
  const photo = jpegDataUrl(20000);
  InterviewRoom.prototype.onJoin.call(
    room,
    { sessionId: "p1" },
    { name: "Alex", avatar: photo },
  );
  const encoded = new Encoder(room.state).encodeAll();
  const cloneRoom = roomFixture();
  new Decoder(cloneRoom.state).decode(encoded);
  assert.equal(cloneRoom.state.players.get("p1").avatar, photo);
});
