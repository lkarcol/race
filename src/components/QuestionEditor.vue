<script setup>
import { computed, inject, ref, watch } from "vue";
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  QrCode,
} from "lucide-vue-next";
import { checkpoints } from "../../shared/questions";
import { QUIZ_LIMITS } from "../../shared/quizConfig";
import QuestionForm from "./QuestionForm.vue";

const { game, mode, phase, connected, hostGame, tab, modal } =
  inject("interview-app");
const draft = ref(null);
const baseline = ref("");
const selectedId = ref("");
const imageBusy = ref(false);
const locked = computed(
  () =>
    phase.value !== "lobby" ||
    !connected.value ||
    game.quizSaving.value ||
    imageBusy.value,
);
const dirty = computed(
  () => draft.value && JSON.stringify(draft.value) !== baseline.value,
);
const activeQuestion = computed({
  get: () => draft.value?.questions.find((q) => q.id === selectedId.value),
  set: (value) => {
    const i = draft.value.questions.findIndex((q) => q.id === selectedId.value);
    if (i >= 0) draft.value.questions[i] = value;
  },
});
watch(
  game.hostQuiz,
  (value) => {
    if (!value) return;
    draft.value = JSON.parse(JSON.stringify(value));
    baseline.value = JSON.stringify(value);
    if (!draft.value.questions.some((q) => q.id === selectedId.value))
      selectedId.value = draft.value.questions[0]?.id || "";
  },
  { immediate: true },
);
function addQuestion(checkpointIndex) {
  if (locked.value || draft.value.questions.length >= QUIZ_LIMITS.questions)
    return;
  const question = {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    checkpointIndex,
    title: "Custom question",
    category: "Interview practice",
    mapLabel: "Interview practice",
    prompt: "",
    options: [{ label: "" }, { label: "" }],
    correctIndex: 0,
    explanation: "",
    image: "",
    imageAlt: "",
    illustration: "",
    type: "text",
  };
  draft.value.questions.push(question);
  selectedId.value = question.id;
}
function removeQuestion() {
  draft.value.questions = draft.value.questions.filter(
    (q) => q.id !== selectedId.value,
  );
  selectedId.value = draft.value.questions[0]?.id || "";
}
function moveQuestion(direction) {
  const list = draft.value.questions;
  const i = list.findIndex((q) => q.id === selectedId.value);
  const group = list
    .map((q, index) => ({ q, index }))
    .filter(
      ({ q }) => q.checkpointIndex === activeQuestion.value.checkpointIndex,
    );
  const position = group.findIndex(({ index }) => index === i);
  const target = group[position + direction]?.index;
  if (target !== undefined) [list[i], list[target]] = [list[target], list[i]];
}
function restoreDefaults() {
  draft.value = JSON.parse(JSON.stringify(game.defaultQuiz.value));
  selectedId.value = draft.value.questions[0].id;
}
async function createEditableRoom() {
  await hostGame();
  if (mode.value === "host" && connected.value) {
    tab.value = "editor";
    modal.value = null;
  }
}
</script>

<template>
  <section class="quiz-editor">
    <div class="section-intro">
      <span class="eyebrow">MAKE THE RACE YOUR OWN</span>
      <h2>Your questions. Your route to SSE.</h2>
      <p>
        Add questions to any place. Players clear each place’s questions in
        order before moving on.
      </p>
    </div>
    <div v-if="mode !== 'host'" class="editor-empty">
      <QrCode :size="32" />
      <h3>Start with a room.</h3>
      <p>
        Create a room to edit the quiz. Your saved quiz is reused when you host
        from this browser.
      </p>
      <button class="button button-dark" @click="createEditableRoom">
        Create room & edit quiz
      </button>
    </div>
    <div v-else-if="!draft" class="editor-empty"><p>Loading your quiz…</p></div>
    <template v-else>
      <p v-if="phase !== 'lobby'" class="editor-notice">
        The quiz is locked during a race. Reset the race from Race overview to
        edit questions and timeout.
      </p>
      <div class="editor-settings">
        <div>
          <strong>Wrong-answer timeout</strong>
          <p>Seconds before a player can try again. Set 0 for no lockout.</p>
        </div>
        <label
          ><input
            type="number"
            v-model.number="draft.wrongAnswerSeconds"
            min="0"
            :max="QUIZ_LIMITS.timeoutMax"
            step="1"
            :disabled="locked"
            aria-label="Wrong-answer timeout in seconds"
          /><span>seconds</span></label
        >
      </div>
      <div class="editor-layout">
        <aside class="editor-places" aria-label="Questions by map place">
          <section
            v-for="(place, i) in checkpoints"
            :key="place.name"
            class="editor-place"
          >
            <h3>
              <span>{{ i + 1 }}</span
              >{{ place.short
              }}<small>{{
                draft.questions.filter((q) => q.checkpointIndex === i).length
              }}</small>
            </h3>
            <button
              v-for="q in draft.questions.filter(
                (q) => q.checkpointIndex === i,
              )"
              :key="q.id"
              class="editor-question-link"
              :class="{ selected: selectedId === q.id }"
              :aria-pressed="selectedId === q.id"
              @click="selectedId = q.id"
            >
              {{ q.title || "Untitled question" }}
            </button>
            <button
              class="editor-add-question"
              :disabled="
                locked || draft.questions.length >= QUIZ_LIMITS.questions
              "
              @click="addQuestion(i)"
            >
              <Plus :size="14" /> Add question at {{ place.short }}
            </button>
          </section>
        </aside>
        <div class="editor-detail">
          <template v-if="activeQuestion">
            <div class="editor-detail-toolbar">
              <span class="eyebrow">EDIT QUESTION</span>
              <div>
                <button
                  class="icon-button"
                  aria-label="Move question earlier at this place"
                  :disabled="locked"
                  @click="moveQuestion(-1)"
                >
                  <ArrowUp :size="17" />
                </button>
                <button
                  class="icon-button"
                  aria-label="Move question later at this place"
                  :disabled="locked"
                  @click="moveQuestion(1)"
                >
                  <ArrowDown :size="17" />
                </button>
                <button
                  class="icon-button"
                  aria-label="Delete selected question"
                  :disabled="locked"
                  @click="removeQuestion"
                >
                  <Trash2 :size="17" />
                </button>
              </div>
            </div>
            <QuestionForm
              :key="activeQuestion.id"
              v-model="activeQuestion"
              v-model:image-busy="imageBusy"
              :disabled="locked"
            />
          </template>
          <p v-else class="editor-empty">
            Add a question at any map place to begin.
          </p>
        </div>
      </div>
      <div class="editor-save-bar">
        <div>
          <strong
            >{{ draft.questions.length }} /
            {{ QUIZ_LIMITS.questions }} questions</strong
          ><small
            >{{
              dirty
                ? "You have unapplied changes."
                : "Quiz applied to this room."
            }}
            Saved quizzes stay in this browser for future rooms.</small
          >
        </div>
        <button
          class="button button-outline"
          :disabled="locked || !game.defaultQuiz.value"
          @click="restoreDefaults"
        >
          <RotateCcw :size="15" /> Load original quiz
        </button>
        <button
          class="button button-dark"
          :disabled="locked || !dirty"
          @click="game.configureQuiz(draft)"
        >
          <Save :size="16" />
          {{ game.quizSaving.value ? "Applying…" : "Apply quiz & timeout" }}
        </button>
      </div>
      <p v-if="game.quizError.value" class="field-error" role="alert">
        {{ game.quizError.value }}
      </p>
      <p
        v-else-if="game.quizSaved.value && !dirty"
        class="editor-success"
        role="status"
      >
        Saved. Players will use this quiz and timeout in the next race.
      </p>
    </template>
  </section>
</template>
