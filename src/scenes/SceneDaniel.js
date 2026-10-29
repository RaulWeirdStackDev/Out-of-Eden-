import Phaser from "phaser";
import { getMoveLeft, getMoveRight } from "../utils/controls.js";
import { setCurrentScene } from "../utils/gameState.js";

const WIDTH = 500;
const HEIGHT = 500;
const DURATION = 60;
const HITS_TO_WIN = 10;

export class SceneDaniel extends Phaser.Scene {
  constructor() {
    super("scene-daniel");
  }

  preload() {
    this.load.image("daniel-bg", "bgDaniel.png");
    this.load.image("daniel-lion", "lion.png");
    this.load.image("daniel-character", "daniel.png");
    this.load.image("daniel-salt", "salt.png");
  }

  create() {
    // Reset every run: Phaser reuses scene instances.
    this.hits = 0;
    this.elapsed = 0;
    this.finished = false;
    this.direction = Phaser.Math.Between(0, 1) ? 1 : -1;
    this.directionTimer = Phaser.Math.Between(450, 1400);
    this.lastShot = -1000;

    this.add.image(WIDTH / 2, HEIGHT / 2, "daniel-bg").setDisplaySize(WIDTH, HEIGHT);

    this.lion = this.physics.add.image(WIDTH / 2, 72, "daniel-lion");
    this.lion.setDisplaySize(105, 105);
    this.lion.body.setAllowGravity(false);
    this.lion.setImmovable(true);
    this.lion.setCollideWorldBounds(true);
    this.lion.body.setSize(this.lion.width * 0.7, this.lion.height * 0.7);

    this.daniel = this.physics.add.image(WIDTH / 2, HEIGHT - 75, "daniel-character");
    this.daniel.setDisplaySize(85, 110);
    this.daniel.body.setAllowGravity(false);
    this.daniel.setImmovable(true);
    this.daniel.setCollideWorldBounds(true);
    this.daniel.body.setSize(this.daniel.width * 0.65, this.daniel.height * 0.8);

    this.saltGroup = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(this.saltGroup, this.daniel, this.hitDaniel, undefined, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on("keydown-SPACE", this.shoot, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard.off("keydown-SPACE", this.shoot, this);
      this.mobileShootButton?.remove();
    });

    this.scoreText = this.add.text(12, 10, `Salt hits: 0/${HITS_TO_WIN}`, {
      fontFamily: "Arial", fontSize: "20px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 4,
    }).setDepth(10);
    this.timeText = this.add.text(12, 36, `Time: ${DURATION}`, {
      fontFamily: "Arial", fontSize: "20px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 4,
    }).setDepth(10);

    // DOM button alongside the existing mobile controls; no HTML edit required.
    const controls = document.getElementById("mobileControls");
    if (controls) {
      this.mobileShootButton = document.createElement("button");
      this.mobileShootButton.type = "button";
      this.mobileShootButton.id = "danielShootBtn";
      this.mobileShootButton.textContent = "🧂 Salt";
      this.mobileShootButton.setAttribute("aria-label", "Drop salt");
      this.mobileShootButton.style.cssText = "touch-action:manipulation;cursor:pointer;padding:10px 14px;font-size:18px;";
      this.mobileShootButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        this.shoot();
      });
      controls.appendChild(this.mobileShootButton);
    }

    setCurrentScene("scene-daniel");
  }

  shoot() {
    if (this.finished || !this.scene.isActive()) return;
    const now = this.time.now;
    if (now - this.lastShot < 350) return;
    this.lastShot = now;

    const salt = this.saltGroup.create(this.lion.x, this.lion.y + 52, "daniel-salt");
    salt.setDisplaySize(26, 42);
    salt.body.setAllowGravity(false);
    salt.setVelocityY(340);
  }

  hitDaniel(daniel, salt) {
    if (this.finished || !salt.active) return;
    salt.destroy();
    this.hits++;
    const reaction = this.add.text(
  this.daniel.x,
  this.daniel.y - 65,
  "😈",
  { fontSize: "32px" }
).setOrigin(0.5);

this.tweens.add({
  targets: reaction,
  y: reaction.y - 35,
  alpha: 0,
  duration: 700,
  onComplete: () => reaction.destroy()
});
    this.scoreText.setText(`Salt hits: ${this.hits}/${HITS_TO_WIN}`);
    if (this.hits >= HITS_TO_WIN) this.finish(true);
  }

  update(_time, delta) {
    if (this.finished) return;

    const dt = delta / 1000;
    this.elapsed += dt;
    const remaining = Math.max(0, Math.ceil(DURATION - this.elapsed));
    this.timeText.setText(`Time: ${remaining}`);
    if (this.elapsed >= DURATION) {
      this.finish(false);
      return;
    }

    const left = this.cursors.left.isDown || getMoveLeft();
    const right = this.cursors.right.isDown || getMoveRight();
    this.lion.setVelocityX(left === right ? 0 : left ? -270 : 270);

    // Random changes, not intelligent dodging.
    this.directionTimer -= delta;
    if (this.directionTimer <= 0) {
      this.direction = Math.random() < 0.5 ? -1 : 1;
      this.directionTimer = Phaser.Math.Between(400, 1500);
    }
    const progress = Math.min(this.elapsed / DURATION, 1);
    const danielSpeed = 80 + progress * 180;
    const halfWidth = this.daniel.displayWidth / 2;
    if (this.daniel.x <= halfWidth) this.direction = 1;
    if (this.daniel.x >= WIDTH - halfWidth) this.direction = -1;
    this.daniel.setVelocityX(this.direction * danielSpeed);

    for (const salt of this.saltGroup.getChildren()) {
      if (salt.y > HEIGHT + 50) salt.destroy();
    }
  }

  finish(won) {
    if (this.finished) return;
    this.finished = true;
    this.lion.setVelocityX(0);
    this.daniel.setVelocityX(0);
    this.saltGroup.clear(true, true);
    this.scene.pause();

    const canvas = document.getElementById("gameCanvas");
    const controls = document.getElementById("mobileControls");
    const footer = document.getElementById("footerRes");
    const endDiv = document.getElementById("endGameDiv");
    const message = document.getElementById("gameWinLoseSpan");
    const score = document.getElementById("gameEndScoreSpan");

    if (canvas) canvas.style.display = "none";
    if (controls) controls.style.display = "none";
    if (footer) footer.style.display = "none";
    if (message) message.textContent = won
      ? "🧂 The Lion's had the great meal he deserved!"
      : "😭 Daniel promoted animal cruelty by starving the lion!";
    if (score) score.textContent = String(this.hits);

    // Show the correct ending illustration instead of the Ark image.
    const resultImage = endDiv?.querySelector("img");
    if (resultImage) {
      resultImage.src = won ? "/DanielVictory.png" : "/DanielDefeat.png";
      resultImage.alt = won
        ? "A happy lion after seasoning Daniel"
        : "Daniel escapes while the lion looks devastated";
      resultImage.style.display = "block";
    }

    if (endDiv) endDiv.style.display = "flex";
  }
}
