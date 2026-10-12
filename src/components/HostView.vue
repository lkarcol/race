<script setup>
import { computed, inject } from "vue";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  Trophy,
  Timer,
  MapPin,
  QrCode,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  GraduationCap,
  MessageCircle,
  Lightbulb,
  Ghost,
  Flag,
  Sparkles,
  ShieldCheck,
  CircleHelp,
  Zap,
  BookOpen,
} from "lucide-vue-next";
import Avatar from "./Avatar.vue";
import RaceMap from "./RaceMap.vue";
import MonsterSpeedControl from "./MonsterSpeedControl.vue";
import QuestionEditor from "./QuestionEditor.vue";
import { checkpoints } from "../../shared/questions";
import { formatTime } from "../lib/format";
const {
  game,
  mode,
  phase,
  players,
  elapsed,
  monster,
  monsterSpeed,
  paused,
  code,
  connected,
  ranked,
  winners,
  active,
  screen,
  tab,
  modal,
  selectedPlayer,
  muted,
  copied,
  qr,
  avatar,
  iconList,
  podiumOrder,
  hostGame,
  copyInvite,
  viewQuestion,
  inspectPlayer,
  fullScreen,
  questions,
  wrongAnswerSeconds,
} = inject("interview-app");
const monsterSpeedModel = computed({
  get: () => monsterSpeed.value,
  set: (value) => game.setMonsterSpeed(value),
});
</script>

<template>
  <main class="host-main">
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">
          <span class="orange-dot" /> HOW TO SURVIVE A JOB INTERVIEW
        </div>
        <h1>
          Outrun unemployment.<br />Land your
          <span class="underline-word"
            >interview<svg viewBox="0 0 220 13" aria-hidden="true">
              <path d="M3 8Q89-2 215 5M14 12Q119 2 203 9" /></svg></span
          ><span class="orange-text">.</span>
        </h1>
        <p>
          {{ questions.length }} questions. 3 interview spots. One chance to
          stand out.
        </p>
      </div>
      <div class="hero-cards">
        <button
          class="room-code-card"
          @click="mode === 'host' && connected ? (modal = 'room') : hostGame()"
        >
          <div>
            <span class="eyebrow">{{
              mode === "demo" ? "DEMO ROOM" : "YOUR ROOM CODE"
            }}</span
            ><strong
              >{{ code.slice(0, 3) }} <span>{{ code.slice(3) }}</span></strong
            ><span class="room-hint"
              >{{
                mode === "demo"
                  ? "Create a room to invite your class"
                  : "Scan, join & get ready to run"
              }}
              <ArrowUpRight :size="13"
            /></span>
          </div>
          <div class="qr-small">
            <img
              v-if="qr && mode !== 'demo'"
              :src="qr"
              alt="Scan to join this room"
            /><QrCode v-else :size="56" :stroke-width="1.5" />
          </div>
        </button>
        <div class="seats-card">
          <span class="seats-doodle"><Sparkles :size="20" /></span
          ><strong>3<span> seats.</span></strong
          ><span>MAKE ONE YOURS.</span>
        </div>
      </div>
    </section>

    <div class="view-toolbar">
      <div class="tabs" role="tablist" aria-label="Host dashboard sections">
        <button
          v-for="item in [
            { id: 'race', label: 'Race overview', icon: Flag },
            { id: 'editor', label: 'Quiz editor', icon: BookOpen },
            { id: 'guide', label: 'How to play', icon: CircleHelp },
          ]"
          :key="item.id"
          role="tab"
          :aria-selected="tab === item.id"
          :class="{ selected: tab === item.id }"
          @click="tab = item.id"
        >
          <component :is="item.icon" :size="16" />{{ item.label }}
        </button>
      </div>
      <div class="view-tools">
        <span class="host-tag">HOST VIEW</span
        ><button
          class="icon-button"
          :aria-label="muted ? 'Enable game sounds' : 'Mute game sounds'"
          :aria-pressed="!muted"
          @click="muted = !muted"
        >
          <VolumeX v-if="muted" :size="18" /><Volume2
            v-else
            :size="18"
          /></button
        ><button
          class="icon-button fullscreen-button"
          aria-label="Toggle full screen"
          @click="fullScreen"
        >
          <Maximize2 :size="17" />
        </button>
      </div>
    </div>

    <template v-if="tab === 'race'">
      <section v-if="phase === 'finished'" class="results-panel">
        <div class="results-spark"><Trophy :size="34" /></div>
        <div class="eyebrow">THE FINISH LINE LOOKS GOOD ON YOU</div>
        <h2>
          {{
            winners.length
              ? "From job seekers to interview ready."
              : "Every setback is a new starting line."
          }}
        </h2>
        <p v-if="winners.length">
          Congratulations {{ winners.map((p) => p.name).join(", ") }}! You
          survived and landed an interview at SSE!
        </p>
        <p v-else>
          Unemployment caught the field this time. Take what you learned into
          your next run.
        </p>
        <div class="podium">
          <div
            v-for="p in podiumOrder"
            :key="p.id"
            :class="['podium-player', `place-${p.rank}`]"
          >
            <span class="podium-rank"
              >{{
                p.rank === 1 ? "1st" : p.rank === 2 ? "2nd" : "3rd"
              }}
              PLACE</span
            ><Avatar :value="p.avatar" :name="p.name" :size="64" /><strong>{{
              p.name
            }}</strong
            ><span
              >{{ formatTime(p.finishedAt) }} ·
              {{ p.score.toLocaleString() }} pts</span
            ><span class="interview-ticket"
              ><Check :size="13" /> INTERVIEW SECURED</span
            >
          </div>
        </div>
        <button class="button button-dark" @click="game.reset()">
          <RotateCcw :size="17" />{{
            mode === "demo" ? "Replay demo" : "Prepare next race"
          }}
        </button>
      </section>
      <div v-else class="race-layout">
        <section class="map-card">
          <div class="panel-heading">
            <div>
              <h2>
                The road to your next chapter<span class="orange-text">.</span>
              </h2>
              <p>
                <MapPin :size="13" /> Žilina, Slovakia
                <span class="dot-separator">·</span> UNIZA → SSE
              </p>
            </div>
            <div class="map-live">
              <span class="live-badge" :class="{ demo: mode === 'demo' }"
                ><span />{{
                  mode === "demo"
                    ? "DEMO PREVIEW"
                    : phase === "lobby"
                      ? "LOBBY OPEN"
                      : paused
                        ? "PAUSED"
                        : "LIVE RACE"
                }}</span
              >
              <div class="race-timer">
                <Timer :size="17" /> {{ formatTime(elapsed) }}
              </div>
            </div>
          </div>
          <div class="map-container">
            <RaceMap
              :players="players"
              :monster="monster"
              :phase="phase"
              :leader="ranked[0]?.id"
              @select="inspectPlayer"
            />
            <div class="map-legend">
              <span><i class="legend-dot green" /> Job seekers</span
              ><span><i class="legend-dot purple" /> Unemployment</span>
            </div>
            <span class="map-notice"
              >An illustrated route. A real opportunity.</span
            >
          </div>
          <div class="checkpoint-track">
            <button
              v-for="(checkpoint, i) in checkpoints"
              :key="checkpoint.name"
              :disabled="!questions.some((q) => q.checkpointIndex === i)"
              @click="
                viewQuestion(
                  questions.findIndex((q) => q.checkpointIndex === i),
                )
              "
            >
              <span
                class="checkpoint-icon"
                :class="{ 'checkpoint-finish': i === 4 }"
                ><component :is="iconList[i]" :size="19" /><small>{{
                  i + 1
                }}</small></span
              ><span class="checkpoint-name">{{ checkpoint.short }}</span
              ><span class="checkpoint-topic">{{
                questions.some((q) => q.checkpointIndex === i)
                  ? `${questions.filter((q) => q.checkpointIndex === i).length} question${questions.filter((q) => q.checkpointIndex === i).length === 1 ? "" : "s"}`
                  : i === checkpoints.length - 1
                    ? "Finish line"
                    : "Pass through"
              }}</span>
            </button>
          </div>
          <div class="monster-strip">
            <div class="monster-symbol"><Ghost :size="23" /></div>
            <div>
              <strong>Unemployment doesn’t wait.</strong
              ><span>Answer smart. Move fast. Stay ahead.</span>
            </div>
            <span class="danger-label"
              ><span />{{
                phase === "lobby"
                  ? "WAITING IN THE SHADOWS"
                  : "HOT ON YOUR HEELS"
              }}</span
            >
          </div>
          <MonsterSpeedControl
            v-model="monsterSpeedModel"
            :disabled="mode !== 'demo' && !connected"
          />
        </section>

        <aside class="leaderboard-card">
          <div class="leaderboard-heading">
            <div class="leaderboard-title">
              <h2>The front-runners</h2>
              <Trophy :size="19" />
            </div>
            <p>Only the first 3 get the interview.</p>
          </div>
          <div class="leaderboard-meta">
            <span><Users :size="14" /> {{ players.length }} players</span
            ><span
              ><i class="legend-dot green" /> {{ active }} still running</span
            >
          </div>
          <div v-if="players.length" class="leaderboard-list">
            <button
              v-for="(p, i) in ranked.slice(0, 8)"
              :key="p.id"
              :class="[
                'leaderboard-row',
                {
                  'top-three': i < 3,
                  caught: p.status === 'caught',
                  'selected-player':
                    selectedPlayer === p.id && modal === 'player',
                },
              ]"
              @click="inspectPlayer(p.id)"
            >
              <span class="rank-number"
                >{{ i + 1
                }}<span v-if="i === 0" class="rank-spark">✦</span></span
              ><Avatar :value="p.avatar" :name="p.name" :size="37" /><span
                class="leaderboard-person"
                ><strong>{{ p.name }}</strong
                ><span v-if="p.status === 'caught'" class="caught-text"
                  >Caught by Unemployment</span
                ><span v-else-if="p.status === 'finished'" class="green-text"
                  >Interview secured!</span
                ><span v-else>{{
                  !p.connected
                    ? "Reconnecting…"
                    : `${p.questionIndex} / ${questions.length} answered · ${checkpoints[p.progress].short}`
                }}</span></span
              ><span v-if="p.status !== 'caught'" class="player-score"
                >{{ p.score.toLocaleString() }}<small>pts</small></span
              ><Ghost v-else :size="17" class="caught-ghost" />
            </button>
            <div v-if="players.length > 8" class="more-players">
              + {{ players.length - 8 }} more players on the map
            </div>
          </div>
          <div v-else class="empty-lobby">
            <img v-if="qr" :src="qr" alt="Scan this QR code to join the game" />
            <h3>Your next great hire<br />is on their way.</h3>
            <p>Share the room code and watch<br />your players appear here.</p>
            <button class="button button-outline" @click="copyInvite">
              <Copy :size="15" />{{ copied ? "Copied!" : "Copy invite link" }}
            </button>
          </div>
          <div class="leaderboard-bottom">
            <ShieldCheck :size="17" /><span
              >Speed gets you ahead.<br /><strong
                >Good answers keep you there.</strong
              ></span
            >
          </div>
        </aside>
      </div>
      <div class="race-bottom">
        <div class="race-status">
          <span
            class="status-pulse"
            :class="{ 'is-running': phase === 'racing' && !paused }"
          /><span
            ><strong>{{
              mode === "demo"
                ? "Take it for a test run"
                : phase === "lobby"
                  ? "Your lobby is open"
                  : paused
                    ? "A moment to catch your breath"
                    : phase === "finished"
                      ? "The race is complete"
                      : "The race is on"
            }}</strong
            ><small>{{
              mode === "demo"
                ? "This is a sample race. Host a game to play with your class."
                : phase === "lobby"
                  ? `${players.length} of 40 players joined. Start when everyone is here.`
                  : `${questions.length} questions stand between your players and their next opportunity.`
            }}</small></span
          >
        </div>
        <div class="race-controls">
          <button
            v-if="phase === 'racing' && mode !== 'demo'"
            class="icon-button reset-button"
            title="Reset race"
            aria-label="Reset race"
            @click="modal = 'reset'"
          >
            <RotateCcw :size="17" /></button
          ><button
            class="button button-dark"
            v-if="phase === 'lobby'"
            :disabled="!players.length || !connected"
            @click="game.start()"
          >
            <Play :size="16" fill="currentColor" />Start the race
            <ArrowRight :size="16" /></button
          ><button
            class="button button-dark"
            v-else-if="phase === 'racing'"
            :disabled="mode !== 'demo' && !connected"
            @click="game.togglePause()"
          >
            <Play v-if="paused" :size="15" fill="currentColor" /><Pause
              v-else
              :size="16"
            />{{
              paused
                ? mode === "demo"
                  ? "Play demo"
                  : "Resume race"
                : "Pause race"
            }}
          </button>
        </div>
      </div>
      <section class="tips-row">
        <div class="tip-card">
          <span class="tip-icon peach"><Zap :size="22" /></span>
          <div>
            <h3>Think fast. Answer right.</h3>
            <p>
              Clear each place’s questions to move forward.<br />Wrong answers:
              {{ wrongAnswerSeconds }}-second timeout.
            </p>
          </div>
        </div>
        <div class="tip-card">
          <span class="tip-icon green"><GraduationCap :size="23" /></span>
          <div>
            <h3>A little practice. A real advantage.</h3>
            <p>
              Build the interview skills that take you<br />from the classroom
              to your first career.
            </p>
          </div>
        </div>
        <div class="tip-card last-tip">
          <span class="tip-icon yellow"><Flag :size="22" /></span>
          <div>
            <h3>The finish line is just the start.</h3>
            <p>
              Reach SSE. Secure your spot.<br />Your next chapter starts with
              you.
            </p>
          </div>
        </div>
      </section>
    </template>

    <section v-else-if="tab === 'questions'" class="question-bank">
      <div class="section-intro">
        <span class="eyebrow">FIVE STOPS. FIVE LIFE SKILLS.</span>
        <h2>A little preparation goes a long way.</h2>
        <p>Explore the questions your players will meet on their way to SSE.</p>
      </div>
      <div class="question-grid">
        <button
          v-for="(question, i) in questions"
          :key="question.id"
          class="question-preview-card"
          @click="viewQuestion(i)"
        >
          <span class="question-number">0{{ i + 1 }}</span
          ><component :is="iconList[i]" :size="27" /><span class="eyebrow">{{
            checkpoints[question.checkpointIndex].short
          }}</span>
          <h3>{{ question.category }}</h3>
          <p>{{ question.prompt }}</p>
          <span class="preview-link"
            >Explore question <ArrowUpRight :size="16"
          /></span>
        </button>
      </div>
    </section>
    <section v-else-if="tab === 'guide'" class="guide-panel">
      <div class="section-intro">
        <span class="eyebrow">YOUR GUIDE TO THE FINISH LINE</span>
        <h2>Ready. Set. Get interview ready.</h2>
        <p>
          A classroom game with a little competition and a lot to take away.
        </p>
      </div>
      <div class="guide-steps">
        <article>
          <span>01</span><QrCode :size="30" />
          <h3>Get the class together.</h3>
          <p>
            Host a game, then share the six-digit room code or QR code. Players
            join on their phones, choose a name, and pick a face.
          </p>
        </article>
        <article>
          <span>02</span><MessageCircle :size="30" />
          <h3>Make your best move.</h3>
          <p>
            Answer {{ questions.length }} interview questions in English. Clear
            all questions at a place to advance. A wrong answer means a
            {{ wrongAnswerSeconds }}-second lockout, then another try.
          </p>
        </article>
        <article>
          <span>03</span><Ghost :size="30" />
          <h3>Stay out of the shadows.</h3>
          <p>
            Unemployment starts moving as soon as the race begins. When it
            reaches your checkpoint, your race is over. Your learning keeps
            going.
          </p>
        </article>
        <article>
          <span>04</span><Trophy :size="30" />
          <h3>Make the top three.</h3>
          <p>
            The first three players to answer all
            {{ questions.length }} questions earn a virtual interview at SSE.
            The race also ends when no active players remain or after 150
            seconds.
          </p>
        </article>
      </div>
      <div class="guide-note">
        <Lightbulb :size="21" />
        <p>
          This is an educational simulation, independently created for interview
          practice. Interview spots are in-game rewards. The route is schematic.
        </p>
      </div>
    </section>
    <QuestionEditor v-show="tab === 'editor'" />
    <footer class="site-footer">
      <span>Made for the leap from campus to career.</span
      ><span
        >UNIZA <ArrowRight :size="12" /> SSE
        <span class="footer-dot">✦</span> Žilina, Slovakia</span
      >
    </footer>
  </main>
</template>
