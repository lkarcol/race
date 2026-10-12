<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { Pause, WifiOff } from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import {
  advanceMonsterMotion,
  secondsUntilCaught,
} from "../../shared/monsterMotion";

const props = defineProps({
  progress: { type: Number, required: true },
  monster: { type: Number, required: true },
  speed: { type: Number, required: true },
  target: { type: Number, required: true },
  baseSpeed: { type: Number, required: true },
  snapshotAt: { type: Number, required: true },
  paused: Boolean,
  connected: Boolean,
  avatar: String,
  name: String,
});
const now = ref(performance.now());
let frame;
// Interpolate between authoritative snapshots. Stop predicting on a stale
// connection rather than displaying a catch that the server hasn't confirmed.
const stale = computed(
  () => !props.connected || now.value - props.snapshotAt > 1000,
);
const motion = computed(() =>
  advanceMonsterMotion({
    speed: props.speed,
    target: props.target,
    baseSpeed: props.baseSpeed,
    seconds:
      props.paused || stale.value
        ? 0
        : Math.min(0.25, Math.max(0, (now.value - props.snapshotAt) / 1000)),
  }),
);
const lead = computed(() =>
  Math.max(0, props.progress - props.monster - motion.value.distance),
);
const seconds = computed(() =>
  secondsUntilCaught({
    lead: lead.value,
    speed: motion.value.speed,
    target: props.target,
    baseSpeed: props.baseSpeed,
  }),
);
// Show the route from the monster's starting point (-0.65) to this player.
// The icon keeps advancing at every checkpoint, even with a large lead.
// Advancing to another place extends the route and pushes the icon back.
const proximity = computed(() =>
  Math.max(0, 1 - Math.min(1, lead.value / (props.progress + 0.65))),
);
const danger = computed(() => seconds.value !== null && seconds.value < 3);
const timeLabel = computed(() =>
  seconds.value === null ? "—" : `≈ ${seconds.value.toFixed(1)} s away`,
);
function animate(timestamp) {
  now.value = timestamp;
  frame = requestAnimationFrame(animate);
}
onMounted(() => {
  frame = requestAnimationFrame(animate);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <section
    class="player-chase-bar"
    :class="{ urgent: danger, frozen: paused || stale }"
    aria-label="Unemployment chase distance"
  >
    <div class="chase-bar-heading">
      <span>UNEMPLOYMENT</span>
      <strong v-if="stale"><WifiOff :size="13" /> Updating…</strong>
      <strong v-else><Pause v-if="paused" :size="13" />{{ timeLabel }}</strong>
    </div>
    <div
      class="chase-bar-track"
      role="progressbar"
      aria-label="Monster proximity"
      :aria-valuenow="Math.round(proximity * 100)"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuetext="
        stale
          ? 'Waiting for a live update'
          : `${timeLabel}${paused ? ', race paused' : ', at the current pace'}`
      "
    >
      <div class="chase-bar-fill" :style="{ width: `${proximity * 100}%` }" />
      <span
        class="chase-monster-marker"
        :style="{ left: `${proximity * 100}%` }"
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" fill="none">
          <path
            d="M5 32c-5-6-2-14 4-15-1-7 5-12 11-9 5-7 14-3 14 4 9 1 12 10 7 16l1 10-8-4-5 6-7-5-8 5-3-6-7 3z"
            fill="currentColor"
          />
          <path
            d="m13 21 7 2m6 0 7-2"
            stroke="#f5eec4"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <path
            d="m19 31 4-2 4 2"
            stroke="#b9a5c7"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span class="chase-player-marker"
        ><Avatar :value="avatar" :name="name" :size="34"
      /></span>
    </div>
    <div class="chase-bar-caption">
      <span>{{
        stale
          ? "Reconnecting to the chase."
          : paused
            ? "Chase paused. Your lead is safe."
            : danger
              ? "Getting close! Answer to move ahead."
              : "Answer correctly to gain more time."
      }}</span>
      <span>YOU</span>
    </div>
  </section>
</template>

<style scoped>
.player-chase-bar {
  margin: -8px 0 24px;
  padding: 15px 17px 12px;
  background: #f2eef4;
  border: 1px solid #ded5e6;
  border-radius: 12px;
  color: #78608a;
}
.chase-bar-heading,
.chase-bar-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.chase-bar-heading > span {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
}
.chase-bar-heading strong {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.chase-bar-track {
  position: relative;
  height: 8px;
  margin: 29px 17px 24px;
  border-radius: 10px;
  background: #ded6e4;
}
.chase-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: #a78abb;
}
.chase-monster-marker,
.chase-player-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
}
.chase-monster-marker {
  width: 40px;
  height: 40px;
  color: #6b4d80;
}
.chase-monster-marker svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 3px 2px #63477722);
}
.chase-player-marker {
  left: 100%;
  width: 40px;
  height: 40px;
  border: 3px solid #faf9f0;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #b4bea4;
}
.chase-bar-caption {
  font-size: 10px;
  line-height: 1.4;
}
.chase-bar-caption > span:last-child {
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 1px;
  padding-right: 5px;
}
.urgent {
  border-color: #d5a98f;
  background: #f8eee5;
  color: #a05d40;
}
.urgent .chase-bar-fill {
  background: #bc8369;
}
.frozen {
  border-style: dashed;
}
@media (max-width: 380px) {
  .player-chase-bar {
    padding: 13px 12px 11px;
  }
  .chase-bar-heading > span {
    font-size: 8px;
    letter-spacing: 0.7px;
  }
  .chase-bar-heading strong {
    font-size: 14px;
  }
}
</style>
