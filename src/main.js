import "./style.css";
import Phaser from "phaser";
import { SceneEden } from "./scenes/SceneEden";
import { SceneNoah } from "./scenes/SceneNoah";
import { sizes, speedDown } from "./utils/constants.js";
import { getCurrentScene, setCurrentScene } from "./utils/gameState.js";
import {
  setMoveLeft,
  setMoveRight,
  setMoveUp,
  setMoveDown,
} from "./utils/controls.js";

const gameStartDiv = document.querySelector("#startGameDiv");
const gameStartBtn = document.querySelector("#gameStartButton");
const mobileControls = document.getElementById("mobileControls");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const footerRes = document.querySelector("#footerRes");
const playAgainBtn = document.getElementById("playAgainBtn");
const startNoahBtn = document.getElementById("startNoahBtn");

leftBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    setMoveLeft(true);
  },
  { passive: false }
);

leftBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    setMoveLeft(false);
  },
  { passive: false }
);

rightBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    setMoveRight(true);
  },
  { passive: false }
);

rightBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    setMoveRight(false);
  },
  { passive: false }
);

upBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    setMoveUp(true);
  },
  { passive: false }
);

upBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    setMoveUp(false);
  },
  { passive: false }
);

downBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    setMoveDown(true);
  },
  { passive: false }
);

downBtn.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    setMoveDown(false);
  },
  { passive: false }
);

const gameEndDiv = document.querySelector("#endGameDiv");
const gameWinLoseSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScoreSpan = document.querySelector("#gameEndScoreSpan");

function mostrarControlesHorizontales() {
  upBtn.style.display = "none";
  downBtn.style.display = "none";
  leftBtn.style.display = "inline-block";
  rightBtn.style.display = "inline-block";
}

function mostrarCruceta() {
  upBtn.style.display = "inline-block";
  downBtn.style.display = "inline-block";
  leftBtn.style.display = "inline-block";
  rightBtn.style.display = "inline-block";
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
  scene: [SceneEden, SceneNoah],
};

const game = new Phaser.Game(config);
game.scene.pause("scene-eden");

// Inicializa escena actual
setCurrentScene("scene-eden");

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  gameCanvas.style.display = "block";
  mobileControls.style.display = "flex";
  mostrarControlesHorizontales();
  game.scene.stop("scene-eden");
  game.scene.start("scene-eden");
  setCurrentScene("scene-eden");
});

playAgainBtn.addEventListener("click", () => {
  gameEndDiv.style.display = "none";
  gameCanvas.style.display = "block";
  mobileControls.style.display = "flex";
  footerRes.style.display = "flex";

  if (getCurrentScene() === "scene-noah") {
    game.scene.stop("scene-noah");
    game.scene.start("scene-eden");
    setCurrentScene("scene-eden");
    mostrarControlesHorizontales(); // Aquí para Edén (porque reinicias a Eden)
  } else {
    game.scene.stop("scene-eden");
    game.scene.start("scene-eden");
    setCurrentScene("scene-eden");
    mostrarControlesHorizontales(); // Aquí también para Edén
  }
});


startNoahBtn.addEventListener("click", () => {
  document.getElementById("noahInstructions").style.display = "none";
  gameCanvas.style.display = "block";
  mobileControls.style.display = "flex";
  footerRes.style.display = "flex";
  mostrarCruceta();
  game.scene.stop("scene-eden");
  game.scene.start("scene-noah");
  setCurrentScene("scene-noah");
});
