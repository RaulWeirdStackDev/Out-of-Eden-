import Phaser from "phaser";
import { getMoveLeft, getMoveRight } from "../utils/controls.js";
import { setCurrentScene } from "../utils/gameState.js";

const WIDTH = 500;
const HEIGHT = 500;
const SURVIVE_SECONDS = 70;
// Goliath moves forward in visible steps, rather than staying at the bottom.
const ADVANCE_STEPS = [
  { progress: 0.25, y: 385 },
  { progress: 0.50, y: 330 },
  { progress: 0.75, y: 275 },
];

export class SceneGoliath extends Phaser.Scene {
  constructor() {
    super("scene-goliath");
  }

  preload() {
    this.load.image("bgGoliath", "bg_goliath.png");
    this.load.image("piedra", "piedra.png");
    this.load.image("goliath", "goliath.png");
  }

  create() {
    setCurrentScene("scene-goliath");
    this.finished = false;
    this.elapsed = 0;
    this.spawnElapsed = 0;
    this.nextAdvanceStep = 0;
    this.add.image(0, 0, "bgGoliath").setOrigin(0).setDisplaySize(WIDTH, HEIGHT);
    this.goliat = this.physics.add.image(WIDTH / 2, HEIGHT - 65, "goliath");
    this.goliat.setDisplaySize(75, 100);
    this.goliat.body.setSize(this.goliat.width * 0.65, this.goliat.height * 0.75);
    this.goliat.setCollideWorldBounds(true);
    this.goliat.body.setAllowGravity(false);
    this.cursor = this.input.keyboard.createCursorKeys();
    this.piedras = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.goliat, this.piedras, this.derrota, undefined, this);
    this.progressText = this.add.text(12, 12, "Approaching David: 0%", {
      fontSize: "19px", color: "#fff", backgroundColor: "#222a", padding: { x: 8, y: 6 }
    }).setDepth(2);
  }

  update(_time, delta) {
    if (this.finished) return;
    const dt = Math.min(delta, 100) / 1000;
    this.elapsed += dt;
    const progress = Math.min(1, this.elapsed / SURVIVE_SECONDS);
    this.progressText.setText(`Approaching David: ${Math.floor(progress * 100)}%`);
    if (progress >= 1) return this.victoria();

    // Every 25%, Goliath advances up the field with a short, visible walk.
    if (this.nextAdvanceStep < ADVANCE_STEPS.length &&
        progress >= ADVANCE_STEPS[this.nextAdvanceStep].progress) {
      const step = ADVANCE_STEPS[this.nextAdvanceStep++];
      this.tweens.add({
        targets: this.goliat,
        y: step.y,
        duration: 850,
        ease: "Sine.easeInOut"
      });
    }

    const direction = Number(this.cursor.right.isDown || getMoveRight()) -
      Number(this.cursor.left.isDown || getMoveLeft());
    this.goliat.setVelocityX(direction * 270);
    this.goliat.setVelocityY(0);

    // Difficulty increases smoothly as Goliath approaches David.
    const interval = 950 - progress * 650;
    this.spawnElapsed += dt * 1000;
    while (this.spawnElapsed >= interval) {
      this.spawnElapsed -= interval;
      this.spawnPiedra(150 + progress * 300);
    }
    this.piedras.children.iterate(stone => {
      if (stone && stone.active && stone.y > HEIGHT + 35) stone.destroy();
    });
  }

  spawnPiedra(speed) {
    const stone = this.piedras.create(Phaser.Math.Between(25, WIDTH - 25), -25, "piedra");
    stone.setDisplaySize(35, 35);
    stone.body.setAllowGravity(false);
    stone.setVelocityY(speed);
  }

  derrota() {
    this.finish("🥶 David got Goliath! One stone was enough.");
  }

  victoria() {
    this.finish("💪 Goliath reached David! History needs a rewrite.");
  }

  finish(message) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    this.scene.pause();
    document.getElementById("gameWinLoseSpan").textContent = message;
    document.getElementById("gameEndScoreSpan").textContent = `${Math.floor(Math.min(this.elapsed, SURVIVE_SECONDS))}s`;
    document.getElementById("endGameDiv").style.display = "flex";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("mobileControls").style.display = "none";
    document.getElementById("footerRes").style.display = "none";
  }
}
