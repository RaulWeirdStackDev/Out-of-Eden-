import "./style.css";
import Phaser from "phaser";

const sizes = {
  width: 500,
  height: 500,
};

const speedDown = 300;

const gameStartDiv = document.querySelector("#startGameDiv");
const gameStartBtn = document.querySelector("#gameStartButton");
const mobileControls = document.getElementById("mobileControls");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const footerRes = document.querySelector('#footerRes')
const playAgainBtn = document.getElementById("playAgainBtn");


let moveLeft = false;
let moveRight = false;

let currentScene = "scene-game";

leftBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveLeft = true;
}, { passive: false });

leftBtn.addEventListener("touchend", e => {
  e.preventDefault();
  moveLeft = false;
}, { passive: false });

rightBtn.addEventListener("touchstart", e => {
  e.preventDefault();
  moveRight = true;
}, { passive: false });

rightBtn.addEventListener("touchend", e => {
  e.preventDefault();
  moveRight = false;
}, { passive: false });


const gameEndDiv = document.querySelector("#endGameDiv");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown + 50;
    this.target;
    this.points = 0;
    this.textScore;
    this.textTime;
    this.timedEvent;
    this.remainingTime;
    this.bgMusic;
  }

  preload() {
    this.load.image("bg", "bg.png");
    this.load.image("snake", "snake.png");
    this.load.image("apple", "apple.png");
    this.load.image("devil", "devil.png");

    this.load.audio("bgMusic", "bgMusic.mp3");
  }
  create() {
    this.points = 0;
    this.bgMusic = this.sound.add("bgMusic");
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    this.player = this.physics.add
      .image(0, sizes.height - 20, "snake")
      .setOrigin(0, 0);
    this.player.setScale(1);
    this.player.setImmovable(true);
    this.player.body.allowGravity = false;
    this.player.setCollideWorldBounds(true);
    this.player.setSize(100, 30).setOffset(0, 100);

    this.target = this.physics.add.image(0, 0, "apple").setOrigin(0, 0);
    this.target.setMaxVelocity(0, speedDown);

    this.physics.add.overlap(
      this.target,
      this.player,
      this.targetHit,
      null,
      this
    );

    this.cursor = this.input.keyboard.createCursorKeys();

    this.textScore = this.add.text(sizes.width - 120, 10, "score:0", {
      font: "25px Arial",
      fill: "#000000",
    });

    this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
      font: "25px Arial",
      fill: "#000000",
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);

    this.emitter = this.add.particles(0, 0, "devil", {
      speed: 100,
      gravityY: speedDown - 200,
      scale: 0.07,
      duration: 100,
      emitting: false,
    });
    this.emitter.startFollow(
      this.player,
      this.player.width / 2,
      this.player.height / 2,
      true
    );
  }
  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText(
      `Remaining Time: ${Math.round(this.remainingTime).toString()}`
    );
    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }
    const { left, right } = this.cursor;

    if (left.isDown || moveLeft) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown || moveRight) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }
  }

  getRandomX() {
    return Math.floor(Math.random() * 480);
  }

  targetHit() {
    this.emitter.start();
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText(`Score: ${this.points}`);
  }

gameOver() {
  currentScene = "scene-game"; // 🔄 indicamos la escena actual

  this.scene.stop();

  if (this.points >= 15) {
    this.scene.start("scene-noah"); // Pasar al nivel de Noé
  } else {
    gameEndScoreSpan.textContent = this.points;
    gameWinLoseSpan.textContent =
      "Lose! Adam and Eve can stay happily in Eden 😭😪!";
    gameCanvas.style.display = "none";
    mobileControls.style.display = "none";
    footerRes.style.display = "none";
    gameEndDiv.style.display = "flex";
  }
}


}

//Noah Scene Inicio

class NoahScene extends Phaser.Scene {
  constructor() {
    super("scene-noah");
    this.jugador = null;
    this.cursor = null;
    this.personas = ["👨🏻‍🦳", "👩🏻‍🦳", "👨🏻‍🦱", "👩🏻‍🦱"];
    this.animales = ["🐯", "🦒", "🐵", "🐶", "🐷", "🦁", "🐮"];
    this.seguidores = [];
    this.puntos = 0;
    this.followDelay = 10;
    this.textScore = null;
    this.animalGroup = null;
    this.personGroup = null;
    this.spawnTimer = 0;
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
  }

  update() {
    // Movimiento del jugador
    const speed = 2;
    if (this.cursor.left.isDown) this.jugador.x -= speed;
    else if (this.cursor.right.isDown) this.jugador.x += speed;
    if (this.cursor.up.isDown) this.jugador.y -= speed;
    else if (this.cursor.down.isDown) this.jugador.y += speed;

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
    ? "🎉 ¡Ahora podrás disfrutar del diluvio!🌧"
    : "😡 Noé y su malvada familia te atraparon.";

  const endText = this.add.text(250, 220, message, {
    fontSize: "18px",
    color: "#000",
    backgroundColor: "#fff",
    align: "center",
    padding: { x: 10, y: 10 },
    wordWrap: { width: 460, useAdvancedWrap: true }
  });
  endText.setOrigin(0.5);

  // Mostrar el botón de volver a la escena 1
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

// Noah Scene fin

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: false,
    },
  },
  scene: [GameScene, NoahScene],
};

const game = new Phaser.Game(config);
game.scene.pause("scene-game");

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  gameCanvas.style.display = "block";
  mobileControls.style.display = "flex";
  game.scene.stop("scene-game");
  game.scene.start("scene-game");
});

playAgainBtn.addEventListener("click", () => {
  gameEndDiv.style.display = "none";
  gameCanvas.style.display = "block";
  mobileControls.style.display = "flex";
  footerRes.style.display = "flex";

  if (currentScene === "scene-noah") {
    // Volver a la etapa 1
    game.scene.stop("scene-noah");
    game.scene.start("scene-game");
  } else {
    // Reintentar la etapa 1
    game.scene.stop("scene-game");
    game.scene.start("scene-game");
  }
});

