<script setup>
import { ref } from "vue";
import { Plus, Trash2, ImagePlus } from "lucide-vue-next";
import { checkpoints } from "../../shared/questions";
import { ILLUSTRATIONS, QUIZ_LIMITS } from "../../shared/quizConfig";
import { resizeQuestionImage } from "../lib/avatars";
import QuizArt from "./QuizArt.vue";

const question = defineModel({ type: Object, required: true });
const imageBusy = defineModel("imageBusy", { type: Boolean, default: false });
defineProps({ disabled: Boolean });
const imageError = ref("");
async function uploadImage(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  const target = question.value;
  imageError.value = "";
  imageBusy.value = true;
  try {
    target.image = await resizeQuestionImage(file);
    target.illustration = "";
  } catch (error) {
    imageError.value = error.message;
  } finally {
    imageBusy.value = false;
  }
}
function removeAnswer(index) {
  question.value.options.splice(index, 1);
  if (question.value.correctIndex === index) question.value.correctIndex = 0;
  else if (question.value.correctIndex > index) question.value.correctIndex--;
}
</script>

<template>
  <fieldset class="question-form" :disabled="disabled || imageBusy">
    <div class="editor-field-row">
      <label
        >Question title
        <input
          v-model="question.title"
          maxlength="120"
          placeholder="A short title"
        />
      </label>
      <label
        >Map place
        <select v-model.number="question.checkpointIndex">
          <option
            v-for="(place, i) in checkpoints"
            :key="place.name"
            :value="i"
          >
            {{ i + 1 }} · {{ place.name }}
          </option>
        </select>
      </label>
    </div>
    <label
      >Question prompt
      <textarea
        v-model="question.prompt"
        maxlength="2000"
        rows="3"
        placeholder="What would you like to ask?"
      />
    </label>
    <div class="editor-answers-heading">
      <strong>Answers</strong><span>Mark one correct answer · 2–6 choices</span>
    </div>
    <div class="editor-answer" v-for="(option, i) in question.options" :key="i">
      <label
        class="correct-answer-radio"
        :title="`Mark answer ${String.fromCharCode(65 + i)} correct`"
      >
        <input
          type="radio"
          :name="`correct-${question.id}`"
          :value="i"
          v-model="question.correctIndex"
          :aria-label="`Answer ${String.fromCharCode(65 + i)} is correct`"
        />
        <span>{{ String.fromCharCode(65 + i) }}</span>
      </label>
      <input
        v-model="option.label"
        :aria-label="`Answer ${String.fromCharCode(65 + i)}`"
        maxlength="500"
        placeholder="Answer text"
      />
      <button
        type="button"
        class="icon-button"
        :disabled="question.options.length <= QUIZ_LIMITS.answersMin"
        :aria-label="`Remove answer ${String.fromCharCode(65 + i)}`"
        @click="removeAnswer(i)"
      >
        <Trash2 :size="16" />
      </button>
    </div>
    <button
      type="button"
      class="button button-outline editor-add-answer"
      :disabled="question.options.length >= QUIZ_LIMITS.answersMax"
      @click="question.options.push({ label: '' })"
    >
      <Plus :size="15" /> Add answer
    </button>
    <label
      >Explanation after a correct answer
      <span class="editor-optional">optional</span>
      <textarea
        v-model="question.explanation"
        maxlength="2000"
        rows="2"
        placeholder="Explain why this answer is right."
      />
    </label>
    <div class="editor-image-fields">
      <label
        >SVG illustration
        <select v-model="question.illustration" @change="question.image = ''">
          <option value="">None</option>
          <option v-for="kind in ILLUSTRATIONS" :key="kind" :value="kind">
            {{ kind.charAt(0).toUpperCase() + kind.slice(1) }}
          </option>
        </select>
      </label>
      <label class="editor-image-upload"
        ><span
          ><ImagePlus :size="17" />
          {{ imageBusy ? "Preparing image…" : "Or upload an image" }}</span
        >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="uploadImage"
        />
        <small>JPEG, PNG or WebP · resized automatically</small>
      </label>
    </div>
    <p v-if="imageError" class="field-error" role="alert">{{ imageError }}</p>
    <div
      class="editor-image-preview"
      v-if="question.image || question.illustration"
    >
      <img
        v-if="question.image"
        :src="question.image"
        :alt="question.imageAlt || 'Question preview'"
      />
      <QuizArt v-else :kind="question.illustration" />
      <button
        type="button"
        class="button button-outline"
        @click="
          question.image = '';
          question.illustration = '';
        "
      >
        Remove image
      </button>
    </div>
    <label v-if="question.image"
      >Image description
      <input
        v-model="question.imageAlt"
        maxlength="200"
        placeholder="Describe the image for screen readers."
      />
    </label>
  </fieldset>
</template>
