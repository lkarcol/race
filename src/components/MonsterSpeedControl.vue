<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import { MONSTER_SPEED } from "../../shared/settings";

const props = defineProps({
  modelValue: { type: Number, default: MONSTER_SPEED.default },
  disabled: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const draft = ref(props.modelValue);
let pendingValue = null;
let sendTimer;
let lastSentAt = -Infinity;
watch(
  () => props.modelValue,
  (value) => {
    // Ignore older server acknowledgements while the host is dragging ahead.
    if (pendingValue !== null && Math.abs(value - pendingValue) > 1e-8) return;
    pendingValue = null;
    draft.value = value;
  },
);
function commit() {
  clearTimeout(sendTimer);
  if (props.disabled) return;
  lastSentAt = Date.now();
  emit("update:modelValue", draft.value);
}
function changeSpeed(event) {
  draft.value = Number(event.target.value);
  pendingValue = draft.value;
  const delay = 100 - (Date.now() - lastSentAt);
  if (delay <= 0) commit();
  else {
    clearTimeout(sendTimer);
    sendTimer = setTimeout(commit, delay);
  }
}
function reset() {
  draft.value = MONSTER_SPEED.default;
  pendingValue = draft.value;
  commit();
}
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      clearTimeout(sendTimer);
      pendingValue = null;
      draft.value = props.modelValue;
    }
  },
);
onBeforeUnmount(() => clearTimeout(sendTimer));
</script>

<template>
  <div class="monster-speed-control">
    <div class="monster-speed-heading">
      <label for="monster-speed">Monster speed</label>
      <output for="monster-speed" aria-live="polite"
        >{{ draft.toFixed(2) }}×</output
      >
      <button
        type="button"
        :disabled="disabled || draft === MONSTER_SPEED.default"
        @click="reset"
      >
        Reset to 1×
      </button>
    </div>
    <div class="monster-speed-slider">
      <span>Slow</span>
      <input
        id="monster-speed"
        type="range"
        :min="MONSTER_SPEED.min"
        :max="MONSTER_SPEED.max"
        :step="MONSTER_SPEED.step"
        :value="draft"
        :disabled="disabled"
        :aria-valuetext="`${draft} times normal speed`"
        aria-describedby="monster-speed-help"
        @input="changeSpeed"
        @change="commit"
      />
      <span>Fast</span>
    </div>
    <p id="monster-speed-help">
      0.5×–2× · Adjust live. The monster gradually settles into its new pace.
    </p>
  </div>
</template>
