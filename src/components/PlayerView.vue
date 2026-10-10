<script setup>
import { inject } from "vue";
import {
  ArrowRight,
  Trophy,
  Timer,
  MapPin,
  Check,
  X,
  Pause,
  Ghost,
  LoaderCircle,
  Zap,
  CheckCircle2,
} from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import OutfitArt from "./OutfitArt.vue";
import { checkpoints } from "../../shared/questions";
import { formatTime } from "../lib/format";
const {
  game,
  phase,
  players,
  elapsed,
  paused,
  code,
  feedback,
  error,
  connected,
  me,
  winners,
  active,
  screen,
  modal,
  avatar,
  showFeedback,
  submitPending,
  chosenOption,
  currentQuestion,
  stunnedSeconds,
  submitAnswer,
  dismissFeedback,
} = inject("interview-app");
</script>

<template>
  <main class="player-main">
    <div class="player-top">
      <span class="room-mini"
        >ROOM {{ code.slice(0, 3) }} {{ code.slice(3) }}</span
      ><button
        class="icon-button"
        aria-label="Leave game"
        @click="modal = 'leave'"
      >
        <X :size="19" />
      </button>
    </div>
    <div v-if="!me" class="player-state">
      <LoaderCircle class="spin" :size="36" />
      <h2>Finding your place…</h2>
    </div>
    <template v-else>
      <div class="player-identity">
        <Avatar :value="me.avatar" :name="me.name" :size="48" />
        <div>
          <span class="eyebrow">{{
            phase === "lobby" ? "MEET YOUR NEXT GREAT HIRE" : "YOU’VE GOT THIS"
          }}</span>
          <h2>{{ me.name }}</h2>
        </div>
        <span class="personal-score"
          >{{ me.score.toLocaleString() }}<small>POINTS</small></span
        >
      </div>
      <div v-if="phase === 'lobby'" class="player-state lobby-state">
        <div class="waiting-art">
          <OutfitArt kind="business" /><span class="waiting-spark">✦</span>
        </div>
        <span class="eyebrow">YOU’RE AT THE STARTING LINE</span>
        <h1>Your future<br />is worth the run.</h1>
        <p>
          The host will start the race soon.<br />Take a breath. You’ve got
          this.
        </p>
        <div class="waiting-pill">
          <span class="status-pulse is-running" /> {{ players.length }} job
          seekers ready to go
        </div>
        <div class="player-rules">
          <span><Check :size="16" /> Right answer? Move forward.</span
          ><span><Timer :size="16" /> Wrong answer? 3-second penalty.</span
          ><span><Ghost :size="16" /> Stay ahead of Unemployment.</span>
        </div>
      </div>
      <div
        v-else-if="phase === 'finished' || me.status !== 'active'"
        class="player-state end-state"
      >
        <div class="end-icon">
          <Trophy v-if="me.status === 'finished'" :size="48" /><Ghost
            v-else
            :size="48"
          />
        </div>
        <span class="eyebrow">{{
          me.status === "finished"
            ? `FINISHED #${me.rank} · INTERVIEW SECURED`
            : me.status === "out"
              ? "ALL THREE SEATS ARE FILLED"
              : "CAUGHT BY UNEMPLOYMENT"
        }}</span>
        <h1>
          {{
            me.status === "finished"
              ? "Your next chapter awaits."
              : "Every run makes you better."
          }}
        </h1>
        <p>
          {{
            me.status === "finished"
              ? "Congratulations! You survived and landed an interview at SSE. Bring this confidence to your real interview."
              : "You may be out of the race, but you’re one step closer to being interview ready. Keep practising!"
          }}
        </p>
        <div class="personal-results">
          <div>
            <strong>{{ me.score.toLocaleString() }}</strong
            ><span>POINTS EARNED</span>
          </div>
          <div>
            <strong>{{ me.progress }} / 5</strong
            ><span>CHECKPOINTS PASSED</span>
          </div>
        </div>
        <div v-if="winners.length" class="mobile-winners">
          <h3>The interview goes to…</h3>
          <div v-for="p in winners" :key="p.id">
            <span>{{ p.rank }}</span
            ><Avatar :value="p.avatar" :size="31" /><strong>{{ p.name }}</strong
            ><CheckCircle2 :size="16" />
          </div>
        </div>
        <p class="waiting-note">
          {{
            phase === "finished"
              ? "Stay here — your host can start another race."
              : "The others are still running. Hang tight for the results!"
          }}
        </p>
      </div>
      <template v-else>
        <div class="player-progress">
          <span
            v-for="i in 5"
            :key="i"
            :class="{
              passed: i <= me.progress,
              current: i === me.progress + 1,
            }"
            ><Check v-if="i <= me.progress" :size="14" /><span v-else>{{
              i
            }}</span></span
          >
        </div>
        <div class="quiz-meta">
          <span><MapPin :size="14" />{{ checkpoints[me.progress].short }}</span
          ><span><Timer :size="15" />{{ formatTime(elapsed) }}</span>
        </div>
        <div v-if="paused" class="pause-notice">
          <Pause :size="17" /> The host paused the race. Take a breath.
        </div>
        <div
          v-if="showFeedback && feedback?.accepted"
          :class="['feedback-panel', { correct: feedback.correct }]"
          role="status"
        >
          <span class="feedback-icon"
            ><CheckCircle2 v-if="feedback.correct" :size="35" /><Timer
              v-else
              :size="35" /></span
          ><span class="eyebrow">{{
            feedback.correct ? "A SMART MOVE" : "TAKE A BREATH"
          }}</span>
          <h2>
            {{
              feedback.correct
                ? "One step closer."
                : "A little pause. A better answer."
            }}
          </h2>
          <p>{{ feedback.explanation }}</p>
          <button
            class="button button-dark"
            :disabled="stunnedSeconds > 0 || paused"
            @click="dismissFeedback"
          >
            {{
              stunnedSeconds
                ? `Try again in ${stunnedSeconds}s`
                : feedback.correct
                  ? "Next checkpoint"
                  : "Try again"
            }}<ArrowRight v-if="!stunnedSeconds" :size="17" />
          </button>
        </div>
        <div v-else class="quiz-screen">
          <span class="eyebrow"
            >QUESTION {{ me.progress + 1 }} OF 5 ·
            {{ currentQuestion.category }}</span
          >
          <h1>{{ currentQuestion.title }}</h1>
          <p class="quiz-prompt">{{ currentQuestion.prompt }}</p>
          <div
            :class="[
              'quiz-options',
              { illustrated: currentQuestion.type !== 'text' },
            ]"
          >
            <button
              v-for="(option, i) in currentQuestion.options"
              :key="`${currentQuestion.id}-${i}`"
              :class="[
                'answer-option',
                { submitting: submitPending && chosenOption === i },
              ]"
              :disabled="
                submitPending || stunnedSeconds > 0 || paused || !connected
              "
              @click="submitAnswer(i)"
            >
              <OutfitArt
                v-if="option.illustration"
                :kind="option.illustration"
              /><span class="option-content"
                ><span class="option-letter">{{ ["A", "B", "C"][i] }}</span
                ><span
                  ><strong>{{ option.label }}</strong
                  ><small v-if="option.detail">{{ option.detail }}</small></span
                ><LoaderCircle
                  v-if="submitPending && chosenOption === i"
                  :size="18"
                  class="spin"
              /></span>
            </button>
          </div>
          <span v-if="stunnedSeconds" class="penalty-message"
            ><Timer :size="15" /> You can answer again in
            {{ stunnedSeconds }}s.</span
          >
          <p v-if="feedback && !feedback.accepted" class="field-error">
            {{ feedback.message }}
          </p>
          <div class="quiz-danger">
            <Ghost :size="19" /><span
              >Unemployment is catching up.<strong
                >Trust yourself. Make your move.</strong
              ></span
            ><Zap :size="18" />
          </div>
        </div>
      </template>
    </template>
    <footer class="player-footer">
      FROM CAMPUS TO CAREER <span>✦</span> UNIZA → SSE
    </footer>
  </main>
</template>
