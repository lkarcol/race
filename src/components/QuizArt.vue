<script setup>
import { computed } from "vue";
import OutfitArt from "./OutfitArt.vue";

const props = defineProps({ kind: { type: String, required: true } });
const descriptions = {
  arrival: "A candidate dressed for an interview walks through the office door",
  nervous: "A seated candidate taps one foot up and down",
  uncertain: "A seated candidate frowns and scratches their head",
  overconfident: "A candidate leans back with both legs outstretched",
  expressive: "A seated candidate uses their hands and face while speaking",
  manhole: "A round manhole cover lifted above its circular opening",
};
const description = computed(() => descriptions[props.kind]);
</script>

<template>
  <svg
    class="quiz-art"
    viewBox="0 0 180 190"
    role="img"
    :aria-label="description"
  >
    <ellipse cx="90" cy="177" rx="72" ry="7" fill="#344238" opacity=".09" />
    <g
      stroke="#38443c"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <template v-if="kind === 'arrival'">
        <path d="M102 174V18h59v156" fill="#e4ebd9" />
        <path d="m105 21 41 13v140l-41-8Z" fill="#c4d1b4" />
        <circle cx="135" cy="99" r="3" fill="#e8bd76" />
        <path d="M151 25h6v144h-6" fill="#faf8ee" />
        <path d="M13 174h151" fill="none" />
        <OutfitArt kind="business" x="3" y="23" width="130" height="153" />
      </template>
      <template v-else-if="kind === 'manhole'">
        <path d="m15 136 75-39 75 39-75 41Z" fill="#e4ebd9" />
        <ellipse cx="90" cy="136" rx="47" ry="24" fill="#4d5c53" />
        <ellipse cx="90" cy="136" rx="38" ry="18" fill="#303e38" />
        <path d="M43 83v8a47 24 0 0 0 94 0v-8" fill="#8a9e8f" />
        <ellipse cx="90" cy="83" rx="47" ry="24" fill="#bdcbb7" />
        <ellipse cx="90" cy="83" rx="37" ry="17" fill="none" />
        <path
          d="m65 75 47 15m-39-22 47 15m-59 1 42 13m-38-3 47-20m-36 25 47-20m-67 7 47-20"
          fill="none"
          stroke="#7d907d"
          stroke-width="1.5"
        />
        <path d="M50 112v9m80-9v9" fill="none" stroke-dasharray="3 4" />
        <path
          d="m42 38 5 8 9-1-6 7 2 9-8-4-8 5 1-9-7-6 9-1Z"
          fill="#e8bd76"
          stroke="none"
        />
      </template>
      <template v-else>
        <path
          d="M48 112v58m65-58v58M43 101h78v14H43Zm9-43h59v43H52Z"
          fill="#bdc7bc"
        />
        <template v-if="kind === 'overconfident'">
          <path
            d="m76 105 25 8 43 37-9 10-46-28-22-13m22-14 23 4 45 37-9 11-50-25"
            fill="#566e7f"
          />
          <path
            d="m136 151 10-3 13 11q3 5-3 7l-24-9Zm15-8 9-1 13 12q3 5-3 6l-24-10Z"
            fill="#41463c"
          />
          <path d="m57 61 23-8 26 52-37 11Z" fill="#e5a784" />
          <path
            d="m61 65-18 12 14 25 9-6-10-17 12-5m11-17 20 11 6 26-11 2-7-20-14-6"
            fill="#efc5a4"
          />
        </template>
        <template v-else>
          <path
            :d="
              kind === 'nervous'
                ? 'm74 108-8 49h16l9-34 14 29 15-6-15-39'
                : 'm73 108-4 59h17l5-41 10 41h17l-13-59'
            "
            fill="#566e7f"
          />
          <path
            :d="
              kind === 'nervous'
                ? 'M65 157h17v10H60q-4-6 5-10Zm40-6 15-5 10 8q4 5-2 8l-19 5Z'
                : 'M69 167h17v10H64q-4-6 5-10Zm32 0h17q10 3 7 10h-24Z'
            "
            fill="#41463c"
          />
          <path d="m76 59-14 10 6 43h43l-5-44-10-9" fill="#e5a784" />
          <path
            v-if="kind === 'nervous'"
            d="m64 70-7 25 23 12 5-9-16-10 5-12m31-5 12 23-18 14-6-8 13-11-8-14"
            fill="#efc5a4"
          />
          <path
            v-else-if="kind === 'uncertain'"
            d="m64 70-7 26 22 12 5-9-16-11 6-12m30-8 18-16-10-23-9 4 7 16-13 9m6-29 1-11m4 11 4-10"
            fill="#efc5a4"
          />
          <path
            v-else
            d="m65 68-14 17-18-19-8 7 24 27 24-22m33-11 15 18 19-19 8 7-26 27-23-21m-66-13-4-12m4 12 5-13m102 14 4-12m-4 12-4-13"
            fill="#efc5a4"
          />
        </template>
        <g
          :transform="
            kind === 'overconfident' ? 'translate(-19 1) rotate(-13 90 44)' : ''
          "
        >
          <path d="M81 46v15q9 8 17-1V46" fill="#efc5a4" />
          <path
            d="M72 27q0-17 18-17t18 17v14q-2 17-18 17T72 41Z"
            fill="#efc5a4"
          />
          <path d="M72 31Q66 7 88 7t21 22l-10-9-22 5" fill="#5b4231" />
          <path
            :d="
              kind === 'uncertain' ? 'm79 32 5 3m11 0 5-3' : 'M79 32h5m12 0h5'
            "
            fill="none"
          />
          <circle cx="82" cy="37" r="1" fill="#38443c" stroke="none" />
          <circle cx="98" cy="37" r="1" fill="#38443c" stroke="none" />
          <path d="m90 36-2 7h4" fill="none" />
          <path v-if="kind === 'uncertain'" d="M84 50q6-6 12 0" fill="none" />
          <ellipse
            v-else-if="kind === 'expressive'"
            cx="90"
            cy="49"
            rx="5"
            ry="4"
            fill="#faf8ee"
          />
          <path v-else d="M84 48q6 4 12-1" fill="none" />
        </g>
        <path
          v-if="kind === 'nervous'"
          d="M141 144v24m-4-20 4-4 4 4m-8 16 4 4 4-4m-14 7h17"
          fill="none"
          stroke="#8c7699"
        />
        <path
          v-if="kind === 'uncertain'"
          d="M122 22l5-5m-3 13h8"
          fill="none"
          stroke="#8c7699"
        />
        <path
          v-if="kind === 'expressive'"
          d="m19 57-5-5m144 6 6-5M119 26l6-3m-4 12h8"
          fill="none"
          stroke="#8c7699"
        />
      </template>
    </g>
  </svg>
</template>
