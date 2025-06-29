import Phaser from "phaser";
import { getMoveUp, getMoveDown, getMoveLeft, getMoveRight } from "../utils/controls.js";
import { getCurrentScene, setCurrentScene } from "../utils/gameState.js";

// Referencias a elementos DOM (asegúrate que existen en tu HTML)
const gameCanvas = document.getElementById("gameCanvas");
const mobileControls = document.getElementById("mobileControls");
const gameEndDiv = document.getElementById("endGameDiv");
const gameWinLoseSpan = document.getElementById("gameWinLoseSpan");
const gameEndScoreSpan = document.getElementById("gameEndScoreSpan");
const footerRes = document.getElementById("footerRes");

export class SceneNoah extends Phaser.Scene {
  constructor() {
    super("scene-noah");
    this.jugador = null;
    this.cursor = null;
    this.personas = ["👨🏻‍🦳", "👩🏻‍🦳", "👨🏻‍🦱", "👩🏻‍🦱"];
    this.animales = ["🐯", "🦒", "🐵", "🐶", "🐷", "🦁", "🐮", "🐱"];
    this.seguidores = [];
    this.puntos = 0;
    this.followDelay = 10;
    this.textScore = null;
    this.animalGroup = null;
    this.personGroup = null;
  }

  preload() {
    this.load.image("bgNoah", "bg_noah.png");
  }

  create() {
    this.add.image(0, 0, "bgNoah").setOrigin(0, 0);
    this.jugador = this.add.text(250, 250, Phaser.Utils.Array.GetRandom(this.animales), {
      fontSize: "32px"
    });
    this.jugador.setOrigin(0.5);

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(10, 10, "Animales: 0", {
      fontSize: "20px",
      fill: "#000"
    });

    this.animalGroup = this.add.group();
    this.personGroup = this.add.group();

    this.time.addEvent({
      delay: 2000,
      callback: this.spawnAnimal,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 4000,
      callback: this.spawnPerson,
      callbackScope: this,
      loop: true
    });

    // Actualizar estado de la escena actual
    setCurrentScene("scene-noah");
  }

  update() {
    // Movimiento del jugador
    const speed = 2;
    if (this.cursor.left.isDown || getMoveLeft()) this.jugador.x -= speed;
    else if (this.cursor.right.isDown || getMoveRight()) this.jugador.x += speed;

    if (this.cursor.up.isDown || getMoveUp()) this.jugador.y -= speed;
    else if (this.cursor.down.isDown || getMoveDown()) this.jugador.y += speed;

    // Colisión con bordes
    if (
      this.jugador.x < 0 || this.jugador.x > 500 ||
      this.jugador.y < 0 || this.jugador.y > 500
    ) {
      this.gameOver();
    }

    // Colisión con personas
    this.personGroup.getChildren().forEach(persona => {
      const dist = Phaser.Math.Distance.Between(
        this.jugador.x, this.jugador.y,
        persona.x, persona.y
      );
      if (dist < 20) {
        this.gameOver();
      }
    });

    // Colisión con animales
    this.animalGroup.getChildren().forEach(animal => {
      const dist = Phaser.Math.Distance.Between(
        this.jugador.x, this.jugador.y,
        animal.x, animal.y
      );
      if (dist < 20) {
        this.capturarAnimal(animal);
      }
    });

    // Lógica de seguidores tipo snake
    if (this.seguidores.length > 0) {
      this.seguidores[0].posiciones.unshift({ x: this.jugador.x, y: this.jugador.y });
      if (this.seguidores[0].posiciones.length > this.followDelay) {
        const pos = this.seguidores[0].posiciones.pop();
        this.seguidores[0].sprite.setPosition(pos.x, pos.y);
      }

      for (let i = 1; i < this.seguidores.length; i++) {
        const anterior = this.seguidores[i - 1];
        const actual = this.seguidores[i];
        actual.posiciones.unshift({ x: anterior.sprite.x, y: anterior.sprite.y });
        if (actual.posiciones.length > this.followDelay) {
          const pos = actual.posiciones.pop();
          actual.sprite.setPosition(pos.x, pos.y);
        }
      }
    }
  }

  spawnAnimal() {
    const animal = this.add.text(
      Phaser.Math.Between(30, 470),
      Phaser.Math.Between(30, 470),
      Phaser.Utils.Array.GetRandom(this.animales),
      { fontSize: "32px" }
    );
    this.animalGroup.add(animal);

    this.time.delayedCall(5000, () => {
      if (animal.active) animal.destroy();
    });
  }

  spawnPerson() {
    const person = this.add.text(
      Phaser.Math.Between(30, 470),
      Phaser.Math.Between(30, 470),
      Phaser.Utils.Array.GetRandom(this.personas),
      { fontSize: "32px" }
    );
    this.personGroup.add(person);
  }

  capturarAnimal(animal) {
    animal.destroy();
    this.puntos++;
    this.textScore.setText(`Animales: ${this.puntos}`);

    const nuevoSeguidor = this.add.text(this.jugador.x, this.jugador.y, animal.text, {
      fontSize: "32px"
    });
    this.seguidores.push({
      sprite: nuevoSeguidor,
      posiciones: []
    });

    if (this.puntos >= 10) {
      this.victoria();
    }
  }

  gameOver(win = false) {
    this.scene.pause();

    let message = win
      ? "🎉 Now you can enjoy the Great Flood! 🌧"
      : "😡 Noah and his wicked family forced you to stay in the Ark!";

    const endText = this.add.text(250, 220, message, {
      fontSize: "18px",
      color: "#000",
      backgroundColor: "#fff",
      align: "center",
      padding: { x: 10, y: 10 },
      wordWrap: { width: 460, useAdvancedWrap: true }
    });
    endText.setOrigin(0.5);

    // Mostrar elementos UI finales
    gameEndDiv.style.display = "flex";
    gameCanvas.style.display = "none";
    mobileControls.style.display = "none";
    footerRes.style.display = "none";

    gameWinLoseSpan.textContent = message;
    gameEndScoreSpan.textContent = this.puntos;
  }

  victoria() {
    this.gameOver(true);
  }
}
