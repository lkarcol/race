import Phaser from "phaser";
import { checkpoints } from "../../shared/questions";
import { avatarUrl } from "../lib/avatars";

const clusterOffsets = [
  [-23, -18],
  [22, -14],
  [0, -52],
  [-45, 13],
  [43, 12],
  [0, 30],
  [-30, -46],
  [30, -45],
];
export class RaceScene extends Phaser.Scene {
  constructor(snapshot, onPlayerClick) {
    super("race");
    this.snapshot = snapshot;
    this.onPlayerClick = onPlayerClick;
    this.pins = new Map();
    this.destroyed = false;
    this.displayMonsterProgress = snapshot().monster;
  }
  create() {
    this.monster = this.add.container(50, 340).setDepth(2);
    const g = this.add.graphics();
    g.fillStyle(0x4e445c, 0.09).fillEllipse(0, 17, 107, 38);
    g.fillStyle(0x4c4056, 0.12).fillEllipse(-7, 0, 92, 68);
    g.fillStyle(0x423849, 1);
    g.fillCircle(-12, -8, 22)
      .fillCircle(11, -14, 23)
      .fillCircle(26, 0, 16)
      .fillCircle(-26, 2, 15)
      .fillEllipse(0, 3, 74, 42);
    g.fillTriangle(-35, 2, -49, 22, -12, 15)
      .fillTriangle(26, 10, 48, 25, 11, 16)
      .fillTriangle(-13, 17, -20, 31, 8, 17);
    g.fillStyle(0xeae2b6, 1)
      .fillEllipse(-12, -4, 10, 7)
      .fillEllipse(11, -4, 10, 7);
    g.fillStyle(0x423849, 1).fillCircle(-10, -4, 2).fillCircle(9, -4, 2);
    g.lineStyle(2, 0xeae2b6, 1).lineBetween(-4, 10, 4, 10);
    this.monster.add(g);
    this.monsterLabel = this.add
      .text(0, 40, "UNEMPLOYMENT", {
        fontFamily: "Arial, sans-serif",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#574b61",
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.monster.add(this.monsterLabel);
    this.events.once("shutdown", () => {
      this.destroyed = true;
    });
  }
  createPin(player) {
    const container = this.add.container(0, 0).setDepth(10);
    const g = this.add.graphics();
    const leader = player.id === this.snapshot().leader;
    const color = leader ? 0xeaa65d : 0xffffff;
    g.fillStyle(0x38483a, 0.15).fillEllipse(0, 13, 27, 8);
    g.fillStyle(color).fillTriangle(-8, 3, 8, 3, 0, 16);
    g.lineStyle(1.5, leader ? 0x926037 : 0x697b60)
      .lineBetween(-8, 3, 0, 16)
      .lineBetween(0, 16, 8, 3);
    g.fillStyle(color).fillCircle(0, -13, 21);
    g.lineStyle(1.7, leader ? 0x926037 : 0x697b60).strokeCircle(0, -13, 21);
    container.add(g);
    const image = new Image();
    image.onload = () => {
      if (this.destroyed || !container.active) return;
      const key = `avatar-${player.id}-${Date.now()}`;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 76;
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(38, 38, 38, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(image, 0, 0, 76, 76);
      this.textures.addCanvas(key, canvas);
      const face = this.add.image(0, -13, key).setDisplaySize(35, 35);
      container.add(face);
    };
    image.src = avatarUrl(player.avatar);
    container.setSize(45, 57).setInteractive({ useHandCursor: true });
    container.on("pointerdown", () => this.onPlayerClick?.(player.id));
    const name = this.add
      .text(0, -43, player.name.split(" ")[0], {
        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#344b3b",
        backgroundColor: "#faf9ef",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5);
    container.add(name);
    container.x = checkpoints[Math.min(player.progress, 4)].x;
    container.y = checkpoints[Math.min(player.progress, 4)].y;
    const pin = { container, progress: -1, avatar: player.avatar };
    this.pins.set(player.id, pin);
    return pin;
  }
  update(time, delta) {
    const state = this.snapshot();
    const grouped = new Map();
    for (const player of state.players) {
      if (player.status === "caught" || player.status === "out") {
        this.pins.get(player.id)?.container.setVisible(false);
        continue;
      }
      const group = grouped.get(player.progress) || 0;
      grouped.set(player.progress, group + 1);
      let pin = this.pins.get(player.id) || this.createPin(player);
      if (pin.avatar !== player.avatar) {
        pin.container.destroy();
        this.pins.delete(player.id);
        pin = this.createPin(player);
      }
      pin.container.setVisible(true);
      const checkpoint = checkpoints[Math.min(player.progress, 4)];
      const offset = clusterOffsets[group % clusterOffsets.length];
      const extra = Math.floor(group / clusterOffsets.length) * 17;
      const targetX =
        checkpoint.x + offset[0] + (player.status === "finished" ? 31 : 0);
      const targetY = checkpoint.y + offset[1] - 12 - extra;
      const lerp = Math.min(1, delta / 170);
      pin.container.x = Phaser.Math.Linear(pin.container.x, targetX, lerp);
      pin.container.y = Phaser.Math.Linear(pin.container.y, targetY, lerp);
      pin.container.setDepth(10 + targetY / 1000);
      pin.container.alpha = player.connected === false ? 0.45 : 1;
    }
    for (const [id, pin] of this.pins)
      if (!state.players.some((p) => p.id === id)) {
        pin.container.destroy();
        this.pins.delete(id);
      }
    // Smooth the synchronized progress at render rate before mapping it to the route.
    this.displayMonsterProgress = Phaser.Math.Linear(
      this.displayMonsterProgress,
      state.monster,
      1 - Math.exp(-delta / 120),
    );
    const progress = this.displayMonsterProgress;
    const value = Math.max(0, Math.min(4, progress));
    const step = Math.min(3, Math.floor(value));
    const a = checkpoints[step],
      b = checkpoints[step + 1];
    const x =
      progress < 0
        ? Phaser.Math.Linear(
            65,
            checkpoints[0].x,
            Phaser.Math.Clamp((progress + 0.65) / 0.65, 0, 1),
          )
        : Phaser.Math.Linear(a.x, b.x, value - step);
    const y =
      progress < 0
        ? Phaser.Math.Linear(
            350,
            checkpoints[0].y,
            Phaser.Math.Clamp((progress + 0.65) / 0.65, 0, 1),
          )
        : Phaser.Math.Linear(a.y, b.y, value - step);
    this.monster.x = x - 12;
    this.monster.y = y + 18;
    const growth = 0.9 + Math.min(0.45, Math.max(0, progress) * 0.12);
    this.monster.scaleX = growth;
    this.monster.scaleY = growth + Math.sin(time / 460) * 0.035;
    this.monster.setVisible(state.phase !== "finished");
  }
}
