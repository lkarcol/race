# How to Survive a Job Interview

**The Interview Run** is an English-language, real-time classroom quiz and survival race through a cartoon version of Žilina. Students travel from UNIZA to SSE while a growing shadow, Unemployment, chases them. The first three finishers earn a virtual interview.

## Run locally

Requires Node.js 20.19+ or 22+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. A clearly labelled sample race is ready to explore; click **Play demo** to run it or **Host a game** to create an actual multiplayer lobby. Open the QR invite in another tab or device to join as a player.

To play on phones, open the host using your computer's LAN URL printed by Vite, for example `http://192.168.1.163:5173`. Phones need access to the same network. The generated QR then contains that reachable address. Opening the host on `localhost` creates an invite that is only usable on that computer. Vite proxies all multiplayer traffic to the Colyseus server, so only the web port needs to be reachable during development.

## Play

1. The host creates a six-digit room and shares its code or QR. Up to 40 players join with a name and one of eight illustrated avatars, or a photo cropped and compressed locally to 160 × 160 JPEG.
2. The host starts the race. Each player answers independently. Players clear all questions assigned to a place before moving to the next place with questions. A wrong answer incurs the host’s configured timeout (three seconds by default) and allows a retry. Faster answers earn more points. Arrival order determines the winners.
3. Unemployment begins moving as soon as the race starts, at a constant speed, and catches players when it reaches their position. A host pause freezes the race, answer scoring clock and remaining penalty time.
4. The first three to answer the entire quiz and reach SSE win. The original quiz has four questions along the five-location route. The race also ends when no active players remain or after 150 seconds, including classes with fewer than three players. The host sees the podium and can reset the same lobby for another run.

The original four questions follow the supplied presentation materials: first-impression percentages, “Decoding the Lexicon,” behavioral clues, and the “Physics Bluff” approach to brain teasers. They have four A–D choices. The body-language question uses four matching SVG pose cards; the first-impression and manhole questions include SVG scene illustrations. Correct feedback uses the supplied explanations, including the final answer on the results screen. Players receive public question content; answer keys and explanations are sent only to the host, with individual explanations revealed to players after correct answers.

## Custom quiz editor

Open **Quiz editor** on the host dashboard and create a room. In the lobby, you can:

- Add up to **50 questions** across any of the five map places, including SSE. A place can have several questions or none; empty places are passed through. Questions run in route order, then in their listed order within a place. Use the up/down arrows to reorder questions at a place.
- Edit each title and prompt, add **2–6 answer choices**, mark one correct answer, and optionally provide an explanation.
- Choose a built-in SVG illustration or upload a JPEG, PNG, or WebP image. Uploads are resized locally to fit 800 × 600, compressed, and included in the room’s question content. Add a description for screen readers.
- Set **Wrong-answer timeout** to a whole number from **0 to 60 seconds**. Zero allows an immediate retry; pausing freezes any remaining lockout.

Click **Apply quiz & timeout** to validate and synchronize the setup. Quiz changes are locked during a race; reset to the lobby before editing again. The applied quiz and timeout survive race resets and are saved in this browser’s local storage for future rooms. They are not stored in a server database or synced between browsers. **Load original quiz** loads a draft of the original four questions and three-second timeout; click Apply to use it.

The host can adjust **Monster speed** below the map, from **0.5× to 2×** in precise 0.01× increments, before or during a race. **2×** means twice the base chase speed, held constant for the whole race. Changes apply live while dragging; **Reset to 1×** restores normal speed. During the chase, the monster smoothly eases toward the selected pace over a fraction of a second. The server enforces host permissions and integrates movement independently of tick rate, without position jumps. Map movement and the demo also update smoothly. The setting survives race resets within the same room. The 150-second race limit stays the same.

Players see a live chase bar above their question and answer feedback. The monster moves toward their avatar as the gap closes, with an estimated countdown in seconds at the current pace (including speed easing). Correct answers that advance to another place increase the gap; wrong-answer timeouts leave the chase running. Pausing freezes the indicator, and stale connections show “Updating…” instead of an unreliable countdown.

## Project structure

```text
src/
  App.vue                  Shared application state, navigation and actions
  style.css                Responsive design system and layouts
  components/
    HostView.vue           Moderator dashboard, question bank and podium
    QuestionEditor.vue     Host quiz setup, place assignment and timeout
    QuestionForm.vue       Question, answer, correct choice and image editor
    QuizArt.vue            Built-in question and behavioral SVG illustrations
    JoinView.vue           Mobile-friendly room joining and avatar selection
    PlayerView.vue         Waiting room, quiz, feedback and personal results
    GameDialogs.vue        Invitations, player profiles and question previews
    Avatar.vue             Circular photo / illustrated avatar
    CityMap.vue            Original SVG city illustration
    OutfitArt.vue          Consistent outfit and posture illustrations
    RaceMap.vue            Phaser canvas lifecycle
  composables/useGame.js   Colyseus connection, state and demo controller
  game/RaceScene.js        Animated pins, avatars, monster and map input
  lib/avatars.js           Avatar generation and local photo compression
  lib/format.js            Time formatting and leaderboard ordering
shared/questions.js        Public questions and checkpoint coordinates
shared/quizConfig.js       Shared quiz limits, validation and public projection
server/
  index.js                 Express + Colyseus WebSocket server
  InterviewRoom.js         Room lifecycle, host authorization, Schema sync
  GameEngine.js            Authoritative, independently testable race rules
  answers.js               Server-only answer keys and explanations
  defaultQuiz.js           Original quiz with private grading configuration
tests/
  engine.test.js           Deterministic survival, timing and scoring tests
  quizConfig.test.js        Custom quiz validation, assignments and timeouts
  room.test.js             Host permissions and private/public content tests
  multiplayer.js           Real multi-client networking integration test
```

Vue 3 handles interfaces and reactive state. Phaser 3 renders and animates the game world. Colyseus 0.16 synchronizes Schema state at 10 Hz. Server time, race position, score, penalties, finish order and eliminations are authoritative. The host is authorized by its server-assigned session ID, not a client-supplied action flag. Answer payloads are validated, including stale question indices. Room seats support 30-second reconnection after an unexpected disconnect. Scores and photos are ephemeral, in room memory only. No database or accounts are needed.

## Verify

```sh
npm test
npm run build
# With npm run dev running in another terminal:
npm run test:multiplayer
```

## Production

```sh
npm run build
npm start
```

The Node server serves the built frontend and multiplayer on port 2567 (override with `PORT`). Open `http://localhost:2567` for a local production check. Colyseus accepts the frontend’s `/colyseus` endpoint prefix directly. For public hosting, put the entire server behind an HTTPS reverse proxy with WebSocket upgrades enabled. If deploying the frontend separately, set `VITE_SERVER_URL` to the public `wss://` server endpoint **before building**.

This is a single-process classroom implementation. Public deployment should add origin restrictions, rate limits, monitoring and a managed multi-process Colyseus presence/driver before scaling. There is no permanent room history. The route is schematic and virtual interview rewards do not represent real SSE recruitment. The project is independently created for education and is not affiliated with UNIZA or SSE.

## References

- [Colyseus client SDK](https://0-16-x.docs.colyseus.io/client/)
- [Colyseus Schema](https://0-16-x.docs.colyseus.io/state/schema)
- [Phaser documentation](https://docs.phaser.io/)
- [Vue documentation](https://vuejs.org/guide/introduction.html)
