import Phaser from "phaser";
import { getMoveLeft, getMoveRight } from "../utils/controls.js";
import { setCurrentScene } from "../utils/gameState.js";

const WIDTH = 500;
const HEIGHT = 500;
const SURVIVE_SECONDS = 55;
// Goliath moves forward in visible steps, rather than staying at the bottom.
const ADVANCE_STEPS = [
  { progress: 0.25, y: 385 },
  { progress: 0.5, y: 330 },
  { progress: 0.75, y: 275 },
];

export class SceneGoliath extends Phaser.Scene {
  constructor() {
    super("scene-goliath");
  }

  preload() {
    this.load.image("bgGoliath", "bg_goliath.webp");
    this.load.image("piedra", "piedra.webp");
    this.load.image("goliath", "goliath.webp");
  }

  create() {
    setCurrentScene("scene-goliath");
    this.finished = false;
    this.elapsed = 0;
    this.spawnElapsed = 0;
    this.nextAdvanceStep = 0;
    this.add
      .image(0, 0, "bgGoliath")
      .setOrigin(0)
      .setDisplaySize(WIDTH, HEIGHT);
    this.goliat = this.physics.add.image(WIDTH / 2, HEIGHT - 65, "goliath");

    // Tamaño visual: antes 75 x 100
    this.goliat.setDisplaySize(90, 120);

    // Mantener la hitbox proporcional
    this.goliat.body.setSize(
      this.goliat.width * 0.65,
      this.goliat.height * 0.75,
    );
    this.goliat.setCollideWorldBounds(true);
    this.goliat.body.setAllowGravity(false);
    this.cursor = this.input.keyboard.createCursorKeys();
    this.piedras = this.physics.add.group({ allowGravity: false });
    this.physics.add.overlap(
      this.goliat,
      this.piedras,
      this.derrota,
      undefined,
      this,
    );
    this.progressText = this.add
      .text(12, 12, "Approaching David: 0%", {
        fontSize: "19px",
        color: "#fff",
        backgroundColor: "#222a",
        padding: { x: 8, y: 6 },
      })
      .setDepth(2);
  }

  update(_time, delta) {
    if (this.finished) return;
    const dt = Math.min(delta, 100) / 1000;
    this.elapsed += dt;
    const progress = Math.min(1, this.elapsed / SURVIVE_SECONDS);
    this.progressText.setText(
      `Approaching David: ${Math.floor(progress * 100)}%`,
    );
    if (progress >= 1) return this.victoria();

    // Every 25%, Goliath advances up the field with a short, visible walk.
    if (
      this.nextAdvanceStep < ADVANCE_STEPS.length &&
      progress >= ADVANCE_STEPS[this.nextAdvanceStep].progress
    ) {
      const step = ADVANCE_STEPS[this.nextAdvanceStep++];
      this.tweens.add({
        targets: this.goliat,
        y: step.y,
        duration: 850,
        ease: "Sine.easeInOut",
      });
    }

    const direction =
      Number(this.cursor.right.isDown || getMoveRight()) -
      Number(this.cursor.left.isDown || getMoveLeft());
    this.goliat.setVelocityX(direction * 300);
    this.goliat.setVelocityY(0);

    // Difficulty increases smoothly as Goliath approaches David.
    const interval = 1800 - progress * 650;
    this.spawnElapsed += dt * 1000;
    while (this.spawnElapsed >= interval) {
      this.spawnElapsed -= interval;
      this.spawnPiedra(30 + progress * 190);
    }
    this.piedras.children.iterate((stone) => {
      if (stone && stone.active && stone.y > HEIGHT + 35) stone.destroy();
    });
  }

  spawnPiedra(speed) {
    const stone = this.piedras.create(
      Phaser.Math.Between(25, WIDTH - 25),
      -25,
      "piedra",
    );
    stone.setDisplaySize(30, 30);
    stone.body.setAllowGravity(false);
    stone.setVelocityY(speed);
  }

  derrota() {
    this.finish("🥶 David got Goliath! So unfair!.", "goliathDefeat.webp");
  }

  victoria() {
    this.finish(
      "💪 That little rascal of David got what he deserved",
      "goliathVictory.webp",
    );
  }

  finish(message, imageFile) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    this.scene.pause();
    document.getElementById("gameWinLoseSpan").textContent = message;
    // Reuse the existing end-screen illustration without changing the HTML.
    const endScreen = document.getElementById("endGameDiv");
    const resultImage = endScreen?.querySelector("img");
    if (resultImage) {
      resultImage.src = `/${imageFile}`;
      resultImage.alt =
        imageFile === "goliathVictory.webp"
          ? "Goliath triumphs over a frightened David"
          : "David celebrates while Goliath lies defeated";
      resultImage.style.display = "block";
    }
    document.getElementById("gameEndScoreSpan").textContent =
      `${Math.floor(Math.min(this.elapsed, SURVIVE_SECONDS))}s`;
    // Victory advances to Daniel; defeat retains the usual Play Again flow.
    const won = imageFile === "goliathVictory.webp";
    const playAgainButton = [...endScreen.querySelectorAll("button")]
      .find((button) => /play again/i.test(button.textContent));
    if (playAgainButton) playAgainButton.style.display = won ? "none" : "";

    let continueButton = document.getElementById("continueToDanielBtn");
    if (!continueButton) {
      continueButton = document.createElement("button");
      continueButton.id = "continueToDanielBtn";
      continueButton.textContent = "Continue to Daniel 🦁";
      continueButton.style.cssText =
        "display:block;margin:12px auto;padding:12px 20px;background:#ff4500;color:white;border:0;border-radius:8px;font-weight:bold;cursor:pointer";
      endScreen.appendChild(continueButton);
    }
    continueButton.style.display = won ? "block" : "none";
    continueButton.onclick = () => {
      endScreen.style.display = "none";
      document.getElementById("gameCanvas").style.display = "block";
      document.getElementById("mobileControls").style.display = "flex";
      document.getElementById("footerRes").style.display = "flex";
      this.scene.stop("scene-goliath");
      this.scene.start("scene-daniel");
      setCurrentScene("scene-daniel");
    };
    document.getElementById("endGameDiv").style.display = "flex";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("mobileControls").style.display = "none";
    document.getElementById("footerRes").style.display = "none";
  }
}
