<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import CityMap from "./CityMap.vue";
const props = defineProps({
  players: Array,
  monster: Number,
  leader: String,
  phase: String,
});
const emit = defineEmits(["select"]);
const canvas = ref(null);
let game;
let disposed = false;
onMounted(async () => {
  const [{ default: Phaser }, { RaceScene }] = await Promise.all([
    import("phaser"),
    import("../game/RaceScene"),
  ]);
  if (disposed) return;
  game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: canvas.value,
    width: 800,
    height: 430,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: new RaceScene(
      () => ({
        players: props.players,
        monster: props.monster,
        leader: props.leader,
        phase: props.phase,
      }),
      (id) => emit("select", id),
    ),
  });
});
onBeforeUnmount(() => {
  disposed = true;
  game?.destroy(true);
});
</script>
<template>
  <div class="map-stage">
    <CityMap />
    <div ref="canvas" class="phaser-layer" aria-label="Live player positions" />
  </div>
</template>
