<script setup>
defineProps({ kind: String });
</script>
<template>
  <svg
    class="outfit-art"
    viewBox="0 0 180 190"
    role="img"
    :aria-label="kind + ' illustration'"
  >
    <ellipse cx="90" cy="177" rx="49" ry="7" fill="#344238" opacity=".09" />
    <g
      stroke="#38443c"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <template v-if="['hoodie', 'business', 'formal'].includes(kind)">
        <path
          d="m71 112-5 56h19l5-42 6 42h18l-5-56"
          :fill="kind === 'hoodie' ? '#6c7f94' : '#465450'"
        />
        <path
          d="M64 168h21v9H60q-4-6 4-9Zm32 0h19q10 3 8 9H96Z"
          :fill="kind === 'hoodie' ? '#f9f7ed' : '#493d33'"
        />
        <path
          d="M76 54 59 61 45 101l13 5 14-26-4 40h44l-4-40 14 26 13-5-14-40-17-7"
          :fill="
            kind === 'hoodie'
              ? '#d6a6bd'
              : kind === 'business'
                ? '#e4ebd9'
                : '#384a51'
          "
        />
        <path
          d="m46 101-3 10q1 9 8 6l7-11m64 0 7 11q7 3 8-6l-3-10"
          fill="#e8b894"
        />
        <path d="M81 43v14q9 9 18 0V43" fill="#e8b894" />
        <path
          d="M72 25q0-17 18-17t18 17v14q-2 17-18 17T72 39Z"
          fill="#efc5a4"
        />
        <path
          d="M72 29q-9-24 15-24 26-2 22 23l-8-10q-12 9-26 4v9"
          fill="#5b4231"
        />
        <path d="M80 33h2m16 0h2m-11 1-2 7h4m-7 5q6 4 12-1" fill="none" />
        <template v-if="kind === 'hoodie'">
          <path
            d="m76 54-6 6 13 17h14l13-17-6-6m-20 19v17m12-17v17M79 104h22l4 10H75Z"
            fill="none"
          />
          <circle cx="84" cy="91" r="1" />
          <circle cx="96" cy="91" r="1" />
        </template>
        <template v-else-if="kind === 'business'">
          <path
            d="m80 53 10 9 10-9 6 8-10 10-6-9-6 9-10-10m16 1v55M103 78h-8v8h8"
            fill="none"
          />
          <circle cx="90" cy="80" r=".8" />
          <circle cx="90" cy="94" r=".8" />
          <path d="M68 116h44" stroke-width="4" />
        </template>
        <template v-else>
          <path d="m81 54 9 9 9-9 7 8-16 49-16-49Z" fill="#faf8ee" />
          <path d="m90 64-8-5v10l8-5 8 5V59Z" fill="#3b3c38" />
          <path
            d="m74 60-6 14 13 3-6 10 15 24 15-24-6-10 13-3-6-14"
            fill="none"
          />
        </template>
      </template>
      <template v-else>
        <path
          d="M52 109v48m68-48v48M49 98h77v14H49Zm8-50h62v49H57Z"
          fill="#bdc7bc"
        />
        <path
          :d="
            kind === 'closed'
              ? 'm76 116-9 52h17l9-44 8 44h17l-7-53'
              : 'm73 114-2 54h16l4-42 9 42h17l-12-54'
          "
          fill="#566e7f"
        />
        <path
          d="M67 168h20v9H62q-3-6 5-9Zm33 0h17q10 3 7 9h-24Z"
          fill="#41463c"
        />
        <path
          :d="
            kind === 'closed'
              ? 'm76 59-17 17 7 39h45l6-40-18-15'
              : 'M77 55 63 65l5 50h44l-5-50-10-10'
          "
          fill="#e5a784"
        />
        <path
          :d="
            kind === 'closed' ? 'M79 50v14l17 2 2-14' : 'M81 45v15q9 8 17-1V45'
          "
          fill="#efc5a4"
        />
        <path
          :d="
            kind === 'closed'
              ? 'M71 30q0-17 17-17t18 17v12q-2 16-17 16T71 42Z'
              : 'M72 24q0-17 18-17t18 17v14q-2 17-18 17T72 38Z'
          "
          fill="#efc5a4"
        />
        <path
          :d="
            kind === 'closed'
              ? 'M71 34q-7-25 17-24 22 0 19 23l-10-11-22 6'
              : 'M72 28Q66 4 88 4t21 22l-10-9-22 5'
          "
          fill="#5b4231"
        />
        <path d="M80 33h2m16 0h2m-11 1-2 7h4m-7 5q6 4 12-1" fill="none" />
        <path
          v-if="kind === 'closed'"
          d="M65 77 83 92l22-12 7 9-28 13-24-17m52-10L94 92l-23-9-5 9 28 11 24-18"
          fill="#efc5a4"
        />
        <path
          v-else-if="kind === 'open'"
          d="m64 66-9 28 20 14 6-9-14-10 5-15m34-9 12 29-15 16-8-8 11-13-8-15"
          fill="#efc5a4"
        />
        <path
          v-else
          d="m65 66-13 20-16-17-9 7 24 26 23-25m32-11 16 18 20-24 9 6-26 34-24-22m40-18 7-16 5 2-3 15"
          fill="#efc5a4"
        />
      </template>
    </g>
    <g v-if="kind === 'business' || kind === 'open'" fill="#71896a">
      <path d="m142 31 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
      <path d="m36 53 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" />
    </g>
  </svg>
</template>
