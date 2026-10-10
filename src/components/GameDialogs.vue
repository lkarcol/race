<script setup>
import { inject } from "vue";
import {
  ArrowRight,
  ArrowLeft,
  Trophy,
  QrCode,
  Copy,
  Check,
  X,
  RotateCcw,
  Flag,
  Zap,
  ExternalLink,
} from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import OutfitArt from "./OutfitArt.vue";
import { checkpoints, questions } from "../../shared/questions";
const {
  game,
  players,
  code,
  active,
  screen,
  modal,
  selectedCheckpoint,
  copied,
  qr,
  avatar,
  joinUrl,
  focusedQuestion,
  playerDetail,
  copyInvite,
  backToJoin,
} = inject("interview-app");
</script>

<template>
  <Teleport to="body"
    ><div v-if="modal" class="modal-backdrop" @click.self="modal = null">
      <section
        class="modal"
        :class="{ 'wide-modal': modal === 'question' || modal === 'guide' }"
        role="dialog"
        aria-modal="true"
        :aria-label="
          modal === 'room'
            ? 'Invite players'
            : modal === 'question'
              ? focusedQuestion.category
              : 'Game details'
        "
      >
        <button
          class="icon-button modal-close"
          autofocus
          aria-label="Close dialog"
          @click="modal = null"
        >
          <X :size="21" />
        </button>
        <template v-if="modal === 'room'"
          ><span class="eyebrow">GOOD THINGS START TOGETHER</span>
          <h2>Your class. Your starting line.</h2>
          <p>
            Scan the QR code or enter the room code<br />on this game’s join
            screen.
          </p>
          <img
            v-if="qr"
            class="invite-qr"
            :src="qr"
            alt="Scan to join the game"
          />
          <div class="invite-code">
            {{ code.slice(0, 3) }} {{ code.slice(3) }}
          </div>
          <span class="invite-caption"
            >{{ players.length }} / 40 PLAYERS HAVE JOINED</span
          ><button class="button button-dark modal-action" @click="copyInvite">
            <Check v-if="copied" :size="17" /><Copy v-else :size="17" />{{
              copied ? "Link copied!" : "Copy invite link"
            }}</button
          ><a class="invite-url" :href="joinUrl" target="_blank" rel="noopener"
            >Open player join screen <ExternalLink :size="13" /></a
          ><span class="local-network-note"
            >Players must be able to reach this address.<br />For phones, open
            the host using your computer’s LAN IP.</span
          ></template
        >
        <template v-else-if="modal === 'question'"
          ><span class="eyebrow"
            >CHECKPOINT {{ selectedCheckpoint + 1 }} ·
            {{ checkpoints[selectedCheckpoint].name }}</span
          >
          <h2>{{ focusedQuestion.title }}</h2>
          <p>{{ focusedQuestion.prompt }}</p>
          <div
            :class="[
              'question-modal-options',
              { 'text-options': focusedQuestion.type === 'text' },
            ]"
          >
            <div
              v-for="(option, i) in focusedQuestion.options"
              :key="option.label"
            >
              <OutfitArt
                v-if="option.illustration"
                :kind="option.illustration"
              /><span class="option-letter">{{ ["A", "B", "C"][i] }}</span
              ><strong>{{ option.label }}</strong
              ><small v-if="option.detail">{{ option.detail }}</small>
            </div>
          </div>
          <div class="question-modal-nav">
            <button
              class="button button-outline"
              :disabled="selectedCheckpoint === 0"
              @click="selectedCheckpoint--"
            >
              <ArrowLeft :size="15" /> Previous</button
            ><span>{{ selectedCheckpoint + 1 }} / 5</span
            ><button
              class="button button-dark"
              :disabled="selectedCheckpoint === 4"
              @click="selectedCheckpoint++"
            >
              Next <ArrowRight :size="15" />
            </button></div
        ></template>
        <template v-else-if="modal === 'player' && playerDetail"
          ><Avatar
            :value="playerDetail.avatar"
            :name="playerDetail.name"
            :size="80"
          /><span class="eyebrow modal-player-eyebrow">JOB SEEKER PROFILE</span>
          <h2>{{ playerDetail.name }}</h2>
          <span
            class="profile-status"
            :class="{ 'is-caught': playerDetail.status === 'caught' }"
            >{{
              playerDetail.status === "caught"
                ? "Caught by Unemployment"
                : playerDetail.status === "finished"
                  ? "Interview secured"
                  : playerDetail.status === "out"
                    ? "All seats filled"
                    : "Still in the running"
            }}</span
          >
          <div class="personal-results">
            <div>
              <strong>{{ playerDetail.score.toLocaleString() }}</strong
              ><span>POINTS</span>
            </div>
            <div>
              <strong>{{ playerDetail.progress }} / 5</strong
              ><span>PASSED</span>
            </div>
          </div>
          <p v-if="playerDetail.status === 'active'">
            Currently at
            {{ checkpoints[Math.min(playerDetail.progress, 4)].name }}.
          </p></template
        >
        <template v-else-if="modal === 'guide'"
          ><span class="eyebrow">A QUICK HEAD START</span>
          <h2>Five questions. Three opportunities.</h2>
          <div class="quick-guide">
            <p>
              <QrCode :size="23" /><span
                ><strong>Host a room & invite your class.</strong>Players join
                with the QR code or six-digit code. Choose a name and an avatar,
                then wait for the host.</span
              >
            </p>
            <p>
              <Zap :size="23" /><span
                ><strong>Make every answer count.</strong>Right answers move you
                ahead. Wrong answers lock you out for 3 seconds. Unemployment
                starts chasing after 12 seconds.</span
              >
            </p>
            <p>
              <Trophy :size="23" /><span
                ><strong>Be one of the first three at SSE.</strong>Pass all five
                checkpoints to earn a virtual interview. If the shadow reaches
                your checkpoint, you’re caught!</span
              >
            </p>
          </div>
          <button class="button button-dark modal-action" @click="modal = null">
            Let’s do this <ArrowRight :size="17" /></button
        ></template>
        <template v-else-if="modal === 'reset'"
          ><RotateCcw :size="35" />
          <h2>Back to the starting line?</h2>
          <p>
            This clears the current race and everyone’s scores. Players stay in
            the lobby, ready for a new run.
          </p>
          <button
            class="button button-dark modal-action"
            @click="
              game.reset();
              modal = null;
            "
          >
            Reset this race</button
          ><button
            class="button button-plain modal-action"
            @click="modal = null"
          >
            Keep racing
          </button></template
        >
        <template v-else-if="modal === 'leave'"
          ><Flag :size="35" />
          <h2>Step out of the race?</h2>
          <p>
            You’ll leave this room. If the race has started, you can join again
            when the host resets it.
          </p>
          <button
            class="button button-dark modal-action"
            @click="
              backToJoin();
              modal = null;
            "
          >
            Leave game</button
          ><button
            class="button button-plain modal-action"
            @click="modal = null"
          >
            Stay in the race
          </button></template
        >
      </section>
    </div></Teleport
  >
</template>
