<script setup>
import { inject } from "vue";
import {
  ArrowRight,
  Users,
  Trophy,
  Timer,
  Play,
  Camera,
  Upload,
  ShieldCheck,
  LoaderCircle,
} from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import OutfitArt from "./OutfitArt.vue";

const {
  code,
  error,
  busy,
  joinCode,
  playerName,
  avatar,
  uploadError,
  joinGame,
  upload,
} = inject("interview-app");
</script>

<template>
  <main class="join-main">
    <div class="join-story">
      <span class="eyebrow"
        ><span class="orange-dot" /> YOUR NEXT CHAPTER STARTS HERE</span
      >
      <h1>
        A little courage.<br />A quick answer.<br /><span class="orange-text"
          >A big opportunity.</span
        >
      </h1>
      <p>
        Race through Žilina. Outsmart Unemployment.<br />Be one of three to land
        an interview at SSE.
      </p>
      <div class="join-art">
        <div class="art-orbit">
          <span>UNIZA</span><ArrowRight :size="23" /><span class="sse-label"
            >SSE</span
          >
        </div>
        <div class="join-characters">
          <OutfitArt kind="hoodie" /><OutfitArt kind="business" /><OutfitArt
            kind="formal"
          />
        </div>
        <span class="art-caption">YOUR FUTURE IS WORTH THE RUN.</span>
      </div>
      <div class="join-facts">
        <span><Users :size="17" /> Play together</span
        ><span><Timer :size="17" /> Think fast</span
        ><span><Trophy :size="17" /> Top 3 survive</span>
      </div>
    </div>
    <form class="join-form" @submit.prevent="joinGame">
      <span class="eyebrow">THE INTERVIEW RUN</span>
      <h2>Let’s get you in.</h2>
      <p>Your class is waiting at the starting line.</p>
      <label for="room-code">Room code</label
      ><input
        id="room-code"
        v-model="joinCode"
        inputmode="numeric"
        pattern="[0-9 ]{6,7}"
        maxlength="7"
        placeholder="000 000"
        autocomplete="off"
        required
        class="room-input"
      /><label for="player-name">What should we call you?</label
      ><input
        id="player-name"
        v-model="playerName"
        maxlength="24"
        placeholder="Your name"
        autocomplete="given-name"
        required
      /><label>Put a face to your future.</label>
      <div class="avatar-picker">
        <button
          v-for="i in 8"
          :key="i"
          type="button"
          :class="{ chosen: avatar === `seed:${i - 1}` }"
          :aria-label="`Choose character ${i}`"
          :aria-pressed="avatar === `seed:${i - 1}`"
          @click="avatar = `seed:${i - 1}`"
        >
          <Avatar :value="`seed:${i - 1}`" :size="42" />
        </button>
      </div>
      <label class="upload-button" for="avatar-upload"
        ><span class="upload-icon"
          ><Avatar
            v-if="avatar.startsWith('data:')"
            :value="avatar"
            :size="38" /><Camera v-else :size="22" /></span
        ><span
          ><strong>{{
            avatar.startsWith("data:")
              ? "Looking good! Change photo"
              : "Or make it really you"
          }}</strong
          ><small>Upload a photo from your gallery or camera</small></span
        ><Upload :size="17" /></label
      ><input
        id="avatar-upload"
        class="visually-hidden"
        type="file"
        accept="image/*"
        @change="upload"
      />
      <p v-if="uploadError" class="field-error" role="alert">
        {{ uploadError }}
      </p>
      <button
        class="button button-dark join-submit"
        type="submit"
        :disabled="busy || !joinCode.trim() || !playerName.trim()"
      >
        <LoaderCircle v-if="busy" :size="18" class="spin" />{{
          busy ? "Finding your starting line…" : "Join the race"
        }}<ArrowRight v-if="!busy" :size="19" /></button
      ><span class="join-fineprint"
        ><ShieldCheck :size="14" /> No account. Just you and your next
        move.</span
      >
    </form>
  </main>
</template>
