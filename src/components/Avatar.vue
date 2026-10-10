<script setup>
import { avatarUrl } from "../lib/avatars";
defineProps({
  value: { type: String, default: "seed:0" },
  name: { type: String, default: "" },
  size: { type: Number, default: 40 },
});
</script>
<template>
  <img
    class="avatar"
    :src="avatarUrl(value)"
    :alt="name ? `${name}'s avatar` : 'Character avatar'"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>
