// Integration test against a running server. No browser or testing framework needed.
import assert from "node:assert/strict";
import { answers } from "../server/answers.js";
import { questions } from "../shared/questions.js";
import { Client } from "colyseus.js";
const endpoint =
  process.argv[2] || process.env.TEST_SERVER_URL || "ws://127.0.0.1:2567";
const client = new Client(endpoint);
const rooms = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(predicate, label) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await pause(30);
  }
  throw new Error(`Timed out: ${label}`);
}
async function sendAnswer(room, questionIndex, optionIndex) {
  const result = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Missing answer feedback")),
      3000,
    );
    const off = room.onMessage("feedback", (message) => {
      clearTimeout(timeout);
      off();
      resolve(message);
    });
  });
  room.send("answer", { questionIndex, optionIndex });
  return result;
}
try {
  const host = await client.create("interview", { role: "host" });
  rooms.push(host);
  await until(() => host.state?.roomCode, "initial room state");
  assert.match(host.roomId, /^\d{6}$/);
  const players = [];
  for (const name of ["Test Alex", "Test Sofia", "Test Daniel", "Test Nina"]) {
    const p = await client.joinById(host.roomId, { name, avatar: "seed:2" });
    players.push(p);
    rooms.push(p);
    p.onMessage("feedback", () => {});
  }
  await until(
    () => host.state.players.size === 4,
    "four joined players synchronized",
  );
  await assert.rejects(client.joinById(host.roomId, { role: "host" }), /host/);
  players[0].send("start");
  await pause(100);
  assert.equal(host.state.phase, "lobby");
  assert.equal((await sendAnswer(players[0], 0, 1)).accepted, false);
  host.send("start");
  await until(() => host.state.phase === "racing", "host starts race");
  await assert.rejects(
    client.joinById(host.roomId, { name: "Late player" }),
    /started/,
  );
  host.send("pause");
  await until(() => host.state.paused, "pause synchronized");
  assert.equal((await sendAnswer(players[0], 0, 1)).accepted, false);
  host.send("pause");
  await until(() => !host.state.paused, "resume synchronized");
  assert.equal((await sendAnswer(players[3], 0, 0)).correct, false);
  assert.equal((await sendAnswer(players[3], 0, 1)).accepted, false);
  for (let p = 0; p < 3; p++)
    for (let q = 0; q < questions.length; q++) {
      assert.equal((await sendAnswer(players[p], q, answers[q])).correct, true);
      await until(
        () => host.state.players.get(players[p].sessionId).progress === q + 1,
        "answer reflected on host",
      );
    }
  await until(
    () => host.state.phase === "finished",
    "third finisher ends game",
  );
  assert.deepEqual(
    players.slice(0, 3).map((p) => host.state.players.get(p.sessionId).rank),
    [1, 2, 3],
  );
  assert.equal(host.state.players.get(players[3].sessionId).status, "out");
  host.send("reset");
  await until(() => host.state.phase === "lobby", "reset to lobby");
  assert.equal(host.state.players.size, 4);
  for (const p of host.state.players.values()) {
    assert.equal(p.progress, 0);
    assert.equal(p.score, 0);
  }
  console.log(
    "PASS: real Colyseus clients joined, synchronized, enforced host permissions and penalties, finished top three, and reset.",
  );
} finally {
  for (const room of rooms.reverse()) await room.leave().catch(() => {});
}
