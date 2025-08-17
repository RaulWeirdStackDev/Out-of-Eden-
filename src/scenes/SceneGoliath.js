import Phaser from "phaser";
import {
  getMoveUp,
  getMoveDown,
  getMoveLeft,
  getMoveRight,
} from "../utils/controls.js";
import { getCurrentScene, setCurrentScene } from "../utils/gameState.js";

export class SceneGoliath extends Phaser.Scene {
  constructor() {
    super("scene-goliath");
    this.goliat = null;
    this.cursor = null;
    this.piedras = null;
    this.spawnTimer = 0;
    this.bg;
  }

  preload() {
    this.load.image("bgGoliath", "bg_goliath.png");
    this.load.image("piedra", "piedra.png");
    this.load.image("goliath", "goliath.png"); // Puedes reemplazarlo con un sprite de Goliat más tarde
  }

  create() {
    setCurrentScene("scene-goliath");

    this.bg = this.add.image(0, 0, "bgGoliath").setOrigin(0, 0);

    this.goliat = this.physics.add.image(250, 480, "goliath").setOrigin(0.5);
    this.goliat.setScale(0.3);
    this.goliat.setCollideWorldBounds(true);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.piedras = this.physics.add.group();
    this.piedras.setScale(0.5);

    this.time.addEvent({
      delay: 1000,
      callback: this.spawnPiedra,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.overlap(
      this.goliat,
      this.piedras,
      this.goliatGolpeado,
      null,
      this
    );
  }

  update() {
    const speed = 2;

    if (this.cursor.left.isDown || getMoveLeft()) {
      this.goliat.x -= speed;
    } else if (this.cursor.right.isDown || getMoveRight()) {
      this.goliat.x += speed;
    }

    if (this.cursor.up.isDown || getMoveUp()) {
      this.goliat.y -= speed;
    } else if (this.cursor.down.isDown || getMoveDown()) {
      this.goliat.y += speed;
    }

    if (this.goliat.y <= 10) {
      this.victoria();
    }
  }

  spawnPiedra() {
    const piedra = this.physics.add.image(
      Phaser.Math.Between(30, 470),
      0,
      "piedra"
    );
    piedra.setVelocityY(100);
    piedra.setScale(0.3); // Ajusta según tu imagen
    this.piedras.add(piedra);

    this.time.delayedCall(7000, () => {
      if (piedra.active) piedra.destroy();
    });
  }

  goliatGolpeado() {
    this.scene.pause();

    const mensaje = "🥶 Goliath was hit by a stone!";
    gameWinLoseSpan.textContent = mensaje;
    gameEndScoreSpan.textContent = "-";

    gameEndDiv.style.display = "flex";
    gameCanvas.style.display = "none";
    mobileControls.style.display = "none";
    footerRes.style.display = "none";
  }

  victoria() {
    this.scene.pause();

    const mensaje = "💪 Goliath reached David! (but at what cost...)";
    gameWinLoseSpan.textContent = mensaje;
    gameEndScoreSpan.textContent = "-";

    gameEndDiv.style.display = "flex";
    gameCanvas.style.display = "none";
    mobileControls.style.display = "none";
    footerRes.style.display = "none";
  }
}
