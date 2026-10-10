import { ref, computed, onMounted, onUnmounted } from "vue";
import { Client } from "colyseus.js";
import { rankPlayers } from "../lib/format";
import { MONSTER_SPEED, isValidMonsterSpeed } from "../../shared/settings";
import { advanceMonsterMotion } from "../../shared/monsterMotion";

const SESSION_KEY = "interview-run-session";
const demoNames = [
  "Alex Morgan",
  "Sofia Kováčová",
  "Daniel Novák",
  "Emma Wilson",
  "Matej Horváth",
  "Nina Urbanová",
  "Oliver King",
  "Lucia Bartošová",
];
function demoPlayers() {
  return demoNames.map((name, i) => ({
    id: `demo-${i}`,
    name,
    avatar: `seed:${i}`,
    progress: [3, 3, 2, 2, 2, 1, 1, 0][i],
    score: [2840, 2610, 1890, 1750, 1640, 920, 810, 0][i],
    status: i === 7 ? "caught" : "active",
    stunUntil: 0,
    rank: 0,
    finishedAt: 0,
    connected: true,
  }));
}
export function useGame() {
  const mode = ref("demo");
  const phase = ref("racing");
  const players = ref(demoPlayers());
  const elapsed = ref(84);
  const monster = ref(0.45);
  const monsterSpeed = ref(MONSTER_SPEED.default);
  const paused = ref(true);
  const code = ref("482916");
  const sessionId = ref("");
  const feedback = ref(null);
  const error = ref("");
  const busy = ref(false);
  const connected = ref(false);
  const serverTime = ref(Date.now());
  let room;
  let demoTick = 0;
  let demoCurrentSpeed = MONSTER_SPEED.default;
  let lastDemoUpdate = performance.now();
  let hostLeft = false;
  let disposed = false;
  const endpoint =
    import.meta.env.VITE_SERVER_URL ||
    `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/colyseus`;
  const client = new Client(endpoint);
  const ranked = computed(() => rankPlayers(players.value));
  const me = computed(() =>
    players.value.find((p) => p.id === sessionId.value),
  );
  const winners = computed(() =>
    ranked.value.filter((p) => p.status === "finished").slice(0, 3),
  );
  const active = computed(
    () => players.value.filter((p) => p.status === "active").length,
  );

  function saveSession(value) {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Storage may be disabled. Live play still works. */
    }
  }
  function applyState(state) {
    players.value = [...state.players.values()].map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      progress: p.progress,
      score: p.score,
      status: p.status,
      stunUntil: p.stunUntil,
      rank: p.rank,
      finishedAt: p.finishedAt,
      connected: p.connected,
    }));
    phase.value = state.phase;
    elapsed.value = state.elapsed;
    monster.value = state.monster;
    monsterSpeed.value = state.monsterSpeed;
    paused.value = state.paused;
    code.value = state.roomCode;
    serverTime.value = state.serverTime;
  }
  function attachRoom(nextRoom, role) {
    room = nextRoom;
    sessionId.value = room.sessionId;
    code.value = room.roomId; // Available at seat reservation, before the first Schema patch.
    mode.value = role;
    connected.value = true;
    error.value = "";
    feedback.value = null;
    saveSession({ token: room.reconnectionToken, role, code: room.roomId });
    room.onStateChange(applyState);
    room.onMessage("feedback", (message) => {
      feedback.value = message;
    });
    room.onMessage("host-left", () => {
      hostLeft = true;
      saveSession(null);
      error.value =
        "The host has closed this room. Join a new room to play again.";
    });
    room.onError((_code, message) => {
      error.value = message || "Connection error. Please try again.";
    });
    room.onLeave(async (closeCode) => {
      if (room !== nextRoom || disposed) return;
      connected.value = false;
      if (closeCode === 4000 || hostLeft) {
        saveSession(null);
        return;
      }
      error.value = "Connection interrupted. Reconnecting…";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const recovered = await client.reconnect(nextRoom.reconnectionToken);
          if (disposed || room !== nextRoom) {
            recovered.leave(false);
            return;
          }
          attachRoom(recovered, role);
          return;
        } catch {
          if (attempt < 2)
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      saveSession(null);
      error.value =
        "Could not reconnect. Return to join and try the next race.";
    });
  }
  async function connect(action, options) {
    busy.value = true;
    error.value = "";
    hostLeft = false;
    try {
      if (room) {
        const previous = room;
        room = null;
        if (previous.connection?.isOpen) await previous.leave();
      }
      saveSession(null);
      const nextRoom =
        action === "host"
          ? await client.create("interview", { role: "host" })
          : await client.joinById(options.code.replace(/\s/g, ""), {
              role: "player",
              name: options.name,
              avatar: options.avatar,
            });
      players.value = [];
      phase.value = "lobby";
      elapsed.value = 0;
      monster.value = -0.65;
      monsterSpeed.value = MONSTER_SPEED.default;
      paused.value = false;
      attachRoom(nextRoom, action);
      return true;
    } catch (e) {
      error.value = e.message?.includes("not found")
        ? "Room not found. Double-check your six-digit code."
        : e.message || "Could not connect to the game server.";
      return false;
    } finally {
      busy.value = false;
    }
  }
  onMounted(async () => {
    let saved;
    try {
      saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
      return;
    }
    if (!saved?.token) return;
    const isJoin =
      location.pathname === "/join" ||
      new URLSearchParams(location.search).has("room");
    if ((saved.role === "player") !== isJoin) return;
    busy.value = true;
    try {
      const recovered = await client.reconnect(saved.token);
      if (disposed) {
        recovered.leave(false);
        return;
      }
      players.value = [];
      phase.value = "lobby";
      elapsed.value = 0;
      attachRoom(recovered, saved.role);
    } catch {
      saveSession(null);
    } finally {
      busy.value = false;
    }
  });
  function start() {
    if (mode.value === "demo") paused.value = false;
    else room?.send("start");
  }
  function togglePause() {
    if (mode.value === "demo") paused.value = !paused.value;
    else room?.send("pause");
  }
  function setMonsterSpeed(multiplier) {
    if (!isValidMonsterSpeed(multiplier) || phase.value === "finished") return;
    if (mode.value === "demo") monsterSpeed.value = multiplier;
    else if (mode.value === "host" && connected.value)
      room?.send("monster-speed", { multiplier });
  }
  function reset() {
    feedback.value = null;
    if (mode.value === "demo") {
      players.value = demoPlayers();
      elapsed.value = 84;
      monster.value = 0.45;
      phase.value = "racing";
      paused.value = true;
      demoTick = 0;
      demoCurrentSpeed = monsterSpeed.value;
    } else room?.send("reset");
  }
  function answer(index) {
    if (me.value && connected.value) {
      feedback.value = null;
      room?.send("answer", {
        questionIndex: me.value.progress,
        optionIndex: index,
      });
    }
  }
  async function leave() {
    saveSession(null);
    if (room) {
      const previous = room;
      room = null;
      if (previous.connection?.isOpen) await previous.leave();
    }
    connected.value = false;
  }
  const timer = setInterval(() => {
    const now = performance.now();
    const seconds = Math.min(0.25, (now - lastDemoUpdate) / 1000);
    lastDemoUpdate = now;
    if (mode.value !== "demo" || paused.value || phase.value !== "racing")
      return;
    elapsed.value += seconds;
    const motion = advanceMonsterMotion({
      speed: demoCurrentSpeed,
      target: monsterSpeed.value,
      seconds,
      acceleration: 0,
    });
    demoCurrentSpeed = motion.speed;
    monster.value += motion.distance;
    const nextTick = Math.floor(elapsed.value - 84);
    if (Math.floor(nextTick / 5) > Math.floor(demoTick / 5)) {
      const next = rankPlayers(players.value).find(
        (p) => p.status === "active",
      );
      if (next) {
        next.progress++;
        next.score += 850;
        if (next.progress >= 5) {
          next.status = "finished";
          next.rank = winners.value.length + 1;
          next.finishedAt = elapsed.value;
        }
      }
    }
    demoTick = nextTick;
    for (const p of players.value)
      if (p.status === "active" && p.progress <= monster.value)
        p.status = "caught";
    if (winners.value.length >= 3 || active.value === 0) {
      phase.value = "finished";
      for (const p of players.value)
        if (p.status === "active") p.status = "out";
    }
  }, 50);
  onUnmounted(() => {
    disposed = true;
    clearInterval(timer);
    // Preserve the reserved seat during a component refresh / hot update.
    room?.leave(false);
  });
  return {
    mode,
    phase,
    players,
    elapsed,
    monster,
    monsterSpeed,
    paused,
    code,
    sessionId,
    feedback,
    error,
    busy,
    connected,
    me,
    ranked,
    winners,
    active,
    serverTime,
    connect,
    start,
    togglePause,
    setMonsterSpeed,
    reset,
    answer,
    leave,
  };
}
