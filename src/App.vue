<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  provide,
  onMounted,
  onBeforeUnmount,
} from "vue";
import {
  ArrowUpRight,
  QrCode,
  Copy,
  GraduationCap,
  Building2,
  MessageCircle,
  Lightbulb,
  Hand,
  CircleHelp,
  Wifi,
  LoaderCircle,
} from "lucide-vue-next";
import QRCode from "qrcode";
import HostView from "./components/HostView.vue";
import JoinView from "./components/JoinView.vue";
import PlayerView from "./components/PlayerView.vue";
import GameDialogs from "./components/GameDialogs.vue";
import { useGame } from "./composables/useGame";
import { checkpoints, questions } from "../shared/questions";
import { resizePhoto } from "./lib/avatars";

const game = useGame();
const {
  mode,
  phase,
  players,
  elapsed,
  monster,
  monsterSpeed,
  paused,
  code,
  feedback,
  error,
  busy,
  connected,
  me,
  ranked,
  winners,
  active,
  serverTime,
} = game;
const screen = ref(
  location.pathname === "/join" ||
    new URLSearchParams(location.search).has("room")
    ? "join"
    : "host",
);
const tab = ref("race");
const modal = ref(null);
const selectedCheckpoint = ref(0);
const selectedPlayer = ref(null);
const muted = ref(true);
const copied = ref(false);
const qr = ref("");
const joinCode = ref(new URLSearchParams(location.search).get("room") || "");
const playerName = ref("");
const avatar = ref("seed:0");
const uploadError = ref("");
const showFeedback = ref(false);
const submitPending = ref(false);
const chosenOption = ref(-1);
const localTime = ref(Date.now());
const iconList = [GraduationCap, Hand, MessageCircle, Lightbulb, Building2];
const joinUrl = computed(() => `${location.origin}/join?room=${code.value}`);
const currentQuestion = computed(
  () => questions[Math.min(me.value?.progress || 0, 4)],
);
const stunnedSeconds = computed(() =>
  Math.max(
    0,
    Math.ceil(
      ((me.value?.stunUntil || 0) -
        (paused.value
          ? serverTime.value
          : localTime.value + clockOffset.value)) /
        1000,
    ),
  ),
);
const clockOffset = ref(0);
const focusedQuestion = computed(() => questions[selectedCheckpoint.value]);
const playerDetail = computed(() =>
  players.value.find((p) => p.id === selectedPlayer.value),
);
const podiumOrder = computed(() =>
  [winners.value[1], winners.value[0], winners.value[2]].filter(Boolean),
);
let feedbackTimeout;
let pendingTimeout;
let audioContext;
let previouslyFocused;
const clockInterval = setInterval(() => {
  localTime.value = Date.now();
}, 100);
watch(serverTime, (value) => {
  clockOffset.value = value - Date.now();
});
watch(mode, (value) => {
  if (value === "player") {
    screen.value = "player";
    history.replaceState({}, "", `/join?room=${code.value}`);
  } else if (value === "host") screen.value = "host";
});
watch(modal, async (value) => {
  if (value) {
    previouslyFocused = document.activeElement;
    await nextTick();
    document.querySelector(".modal-close")?.focus();
  } else previouslyFocused?.focus();
});
watch([code, mode], async () => {
  if (mode.value !== "demo")
    qr.value = await QRCode.toDataURL(joinUrl.value, {
      margin: 1,
      width: 220,
      color: { dark: "#263c32", light: "#ffffff" },
    });
});
watch(feedback, (value) => {
  if (!value) return;
  submitPending.value = false;
  clearTimeout(pendingTimeout);
  if (value.accepted) {
    showFeedback.value = true;
    clearTimeout(feedbackTimeout);
    if (value.correct) playTone();
  }
});
watch(phase, (value) => {
  if (value === "finished") playTone(true);
});
watch(error, (value) => {
  if (value) {
    submitPending.value = false;
    clearTimeout(pendingTimeout);
  }
});
function playTone(win = false) {
  if (muted.value) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, win ? 1047 : 784].forEach((freq, i) => {
      const o = audioContext.createOscillator();
      const gain = audioContext.createGain();
      o.connect(gain);
      gain.connect(audioContext.destination);
      o.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, audioContext.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + i * 0.12 + 0.22,
      );
      o.start(audioContext.currentTime + i * 0.12);
      o.stop(audioContext.currentTime + i * 0.12 + 0.25);
    });
  } catch {
    /* Sound is optional. */
  }
}
async function hostGame() {
  const success = await game.connect("host");
  if (success) {
    screen.value = "host";
    tab.value = "race";
    modal.value = "room";
  }
}
async function joinGame() {
  const success = await game.connect("player", {
    code: joinCode.value,
    name: playerName.value,
    avatar: avatar.value,
  });
  if (success) {
    screen.value = "player";
    history.replaceState({}, "", `/join?room=${code.value}`);
  }
}
async function upload(event) {
  uploadError.value = "";
  try {
    avatar.value = await resizePhoto(event.target.files?.[0]);
  } catch (e) {
    uploadError.value = e.message;
  }
  event.target.value = "";
}
function submitAnswer(index) {
  if (
    submitPending.value ||
    stunnedSeconds.value ||
    paused.value ||
    !connected.value
  )
    return;
  chosenOption.value = index;
  submitPending.value = true;
  game.answer(index);
  pendingTimeout = setTimeout(() => {
    submitPending.value = false;
    error.value = "Your answer was not confirmed. Please try again.";
  }, 6000);
}
function dismissFeedback() {
  showFeedback.value = false;
  chosenOption.value = -1;
  feedback.value = null;
}
async function copyInvite() {
  try {
    await navigator.clipboard.writeText(joinUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    error.value = "Copy the room code or invitation URL below to share it.";
  }
}
function viewQuestion(index) {
  selectedCheckpoint.value = index;
  modal.value = "question";
}
function inspectPlayer(id) {
  selectedPlayer.value = id;
  modal.value = "player";
}
async function fullScreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    error.value = "Full screen is unavailable in this browser.";
  }
}
function escapeKey(event) {
  if (event.key === "Escape") modal.value = null;
  if (event.key === "Tab" && modal.value) {
    const elements = [
      ...document.querySelectorAll(
        ".modal button:not(:disabled), .modal a[href], .modal input",
      ),
    ];
    const first = elements[0],
      last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
async function backToJoin() {
  await game.leave();
  screen.value = "join";
  error.value = "";
  showFeedback.value = false;
  history.replaceState({}, "", "/join");
}
onMounted(() => document.addEventListener("keydown", escapeKey));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", escapeKey);
  clearInterval(clockInterval);
  clearTimeout(feedbackTimeout);
  clearTimeout(pendingTimeout);
  audioContext?.close();
});
provide("interview-app", {
  game,
  mode,
  phase,
  players,
  elapsed,
  monster,
  monsterSpeed,
  paused,
  code,
  feedback,
  error,
  busy,
  connected,
  me,
  ranked,
  winners,
  active,
  serverTime,
  screen,
  tab,
  modal,
  selectedCheckpoint,
  selectedPlayer,
  muted,
  copied,
  qr,
  joinCode,
  playerName,
  avatar,
  uploadError,
  showFeedback,
  submitPending,
  chosenOption,
  iconList,
  joinUrl,
  currentQuestion,
  stunnedSeconds,
  focusedQuestion,
  playerDetail,
  podiumOrder,
  hostGame,
  joinGame,
  upload,
  submitAnswer,
  dismissFeedback,
  copyInvite,
  viewQuestion,
  inspectPlayer,
  fullScreen,
  backToJoin,
});
</script>

<template>
  <div class="app-shell">
    <header class="site-nav">
      <a class="brand" href="/" aria-label="The Interview Run home"
        ><span class="brand-icon">
          <ArrowUpRight :size="27" :stroke-width="2.4" /> </span
        ><span
          >the interview<span class="brand-run"
            >run<span class="brand-period">.</span></span
          ></span
        ></a
      >
      <span class="nav-context"
        ><span class="tiny-dot" /> FROM CAMPUS TO CAREER</span
      >
      <div class="nav-actions">
        <button
          class="icon-button help-nav"
          aria-label="How to play"
          @click="modal = 'guide'"
        >
          <CircleHelp :size="20" />
        </button>
        <template v-if="screen === 'host'"
          ><a
            v-if="mode === 'host' && connected"
            class="button button-plain join-nav"
            :href="joinUrl"
            target="_blank"
            rel="noopener"
            >Join a game <ArrowUpRight :size="16" /></a
          ><button
            v-if="mode !== 'host' || !connected"
            class="button button-plain join-nav"
            @click="
              screen = 'join';
              error = '';
            "
          >
            Join a game
            <ArrowUpRight :size="16" /></button
          ><button
            class="button button-dark"
            :disabled="busy"
            @click="
              mode === 'host' && connected ? (modal = 'room') : hostGame()
            "
          >
            <LoaderCircle v-if="busy" class="spin" :size="16" />
            <QrCode v-else :size="17" />{{
              mode === "host" && connected ? "Room details" : "Host a game"
            }}
          </button></template
        >
        <button
          v-else-if="screen === 'join' && mode !== 'player'"
          class="button button-plain"
          @click="
            screen = 'host';
            error = '';
            history.replaceState({}, '', '/');
          "
        >
          Host view
          <ArrowUpRight :size="16" />
        </button>
        <span
          v-else
          class="connection-pill"
          :class="{ disconnected: !connected }"
        >
          <Wifi :size="15" />
          {{ connected ? "Connected" : "Disconnected" }}
        </span>
      </div>
    </header>

    <div v-if="error" class="error-banner" role="alert">
      <span>{{ error }}</span
      ><button
        class="icon-button"
        aria-label="Dismiss message"
        @click="error = ''"
      >
        <X :size="18" />
      </button>
    </div>

    <HostView v-if="screen === 'host'" />
    <JoinView v-else-if="screen === 'join'" />
    <PlayerView v-else />
    <GameDialogs />
  </div>
</template>
