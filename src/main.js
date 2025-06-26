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
    this.scene.stop();
    mobileControls.style.display = "none";
    footerRes.style.display= "none";
    if (this.points >= 19) {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent =
        "You Win! Adam and Eve have to leave Eden 😈🔥!";
    } else {
      gameEndScoreSpan.textContent = this.points;
      gameWinLoseSpan.textContent =
        "You Lose! Adam and Eve can stay happily in Eden 😭😪!";
    }
    gameEndDiv.style.display = "flex";
  }
}

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
  scene: [GameScene],
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
  game.scene.stop("scene-game");
  game.scene.start("scene-game");
});

