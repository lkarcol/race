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
    district: "First impressions",
    x: 268,
    y: 234,
  },
  {
    name: "Bulvár / Town Center",
    short: "Bulvár",
    district: "Find your voice",
    x: 412,
    y: 312,
  },
  {
    name: "Mariánske Námestie",
    short: "Mariánske",
    district: "Show your strengths",
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
    id: "attire",
    title: "Dress for the opportunity.",
    category: "Dress code selection",
    prompt: "What would you wear to an interview at SSE?",
    type: "outfit",
    options: [
      {
        label: "Keep it casual",
        detail: "A comfy hoodie and trainers",
        illustration: "hoodie",
      },
      {
        label: "Business casual",
        detail: "A neat shirt and tailored trousers",
        illustration: "business",
      },
      {
        label: "Full formal",
        detail: "A tuxedo and bow tie",
        illustration: "formal",
      },
    ],
  },
  {
    id: "posture",
    title: "Let your confidence show.",
    category: "Body language & posture",
    prompt: "Which posture conveys confidence and respect?",
    type: "posture",
    options: [
      {
        label: "Closed off",
        detail: "Slouching with arms crossed",
        illustration: "closed",
      },
      {
        label: "Open and natural",
        detail: "Sit upright, relax, and make eye contact",
        illustration: "open",
      },
      {
        label: "Take over the room",
        detail: "Lean forward and point assertively",
        illustration: "aggressive",
      },
    ],
  },
  {
    id: "intro",
    title: "Make your introduction count.",
    category: "Your elevator pitch",
    prompt:
      "How should you start your intro when asked “Tell me about yourself”?",
    type: "text",
    options: [
      { label: "Share your personal hobbies and childhood stories." },
      {
        label:
          "Give a concise overview of your education, skills, and alignment with SSE.",
      },
      { label: "Explain your salary expectations immediately." },
    ],
  },
  {
    id: "weakness",
    title: "Turn honesty into strength.",
    category: "Handling difficult questions",
    prompt: "What is the best way to explain a professional weakness?",
    type: "text",
    options: [
      { label: "“I have no weaknesses.”" },
      {
        label:
          "Mention a genuine area of improvement and steps you are taking to grow.",
      },
      { label: "Blame past professors or employers." },
    ],
  },
  {
    id: "employer",
    title: "Curiosity opens doors.",
    category: "Questions for the employer",
    prompt:
      "What is an appropriate question to ask the interviewer at the end?",
    type: "text",
    options: [
      { label: "“How soon can I take vacation?”" },
      {
        label: "“What does a typical day look like in this department at SSE?”",
      },
      { label: "“Do you track working hours strictly?”" },
    ],
  },
];
