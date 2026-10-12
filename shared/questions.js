// Only public question content is shipped to the browser. Answer keys stay on the server.
export const checkpoints = [
  {
    name: "UNIZA Campus",
    short: "UNIZA",
    district: "Where it all begins",
    x: 116,
    y: 330,
  },
  {
    name: "Hliny / Veľký Diel",
    short: "Hliny",
    district: "Decode the workplace",
    x: 268,
    y: 234,
  },
  {
    name: "Bulvár / Town Center",
    short: "Bulvár",
    district: "Read the room",
    x: 412,
    y: 312,
  },
  {
    name: "Mariánske Námestie",
    short: "Mariánske",
    district: "Think on your feet",
    x: 538,
    y: 190,
  },
  {
    name: "SSE Headquarters",
    short: "SSE",
    district: "Your next chapter",
    x: 690,
    y: 111,
  },
];

export const questions = [
  {
    id: "first-impressions",
    title: "First impressions start at the door.",
    category: "First impressions",
    mapLabel: "First impressions",
    prompt:
      "According to the provided materials, what percentage of first impressions during a job interview is determined by how you dress, act, and walk through the door?",
    type: "text",
    illustration: "arrival",
    options: [
      { label: "7%" },
      { label: "38%" },
      { label: "47%" },
      { label: "55%" },
    ],
  },
  {
    id: "corporate-lexicon",
    title: "Decode the corporate lexicon.",
    category: "Decoding the Lexicon",
    mapLabel: "Corporate lexicon",
    prompt:
      'In corporate terminology ("Decoding the Lexicon"), what is the actual meaning of the phrase "Fast-paced environment"?',
    type: "text",
    options: [
      {
        label:
          "Professional boundaries do not exist and managers send late-night texts.",
      },
      {
        label:
          "Complete organizational chaos where yesterday was the deadline.",
      },
      {
        label:
          "Performing the work of three people for a significantly lower salary.",
      },
      {
        label:
          "An employer providing pizza parties instead of health insurance or overtime.",
      },
    ],
  },
  {
    id: "behavioral-clues",
    title: "Read the candidate’s body language.",
    category: "Behavioral clues",
    mapLabel: "Behavioral clues",
    prompt:
      'According to the behavioral clues classification, which candidate action indicates that the applicant is "overconfident"?',
    type: "posture",
    options: [
      { label: "Tapping a foot quickly up and down", illustration: "nervous" },
      {
        label: "Frowning and scratching their head",
        illustration: "uncertain",
      },
      {
        label: "Sitting back in a chair with legs outstretched",
        illustration: "overconfident",
      },
      {
        label: "Using hands and face to express themselves",
        illustration: "expressive",
      },
    ],
  },
  {
    id: "brain-teasers",
    title: "Think your way through a brain teaser.",
    category: "Tricky brain teasers",
    mapLabel: "Brain teasers",
    prompt:
      'How does the presentation script advise candidates to tackle tricky brain teasers such as "Why are manhole covers round?"',
    type: "text",
    illustration: "manhole",
    options: [
      { label: "Decline to answer and redirect to personal achievements." },
      { label: "Admit complete ignorance to show honesty and integrity." },
      {
        label:
          'Use confidence with terms like "geometry" or pivot philosophically.',
      },
      { label: "Calculate precise mathematical dimensions on paper." },
    ],
  },
];
