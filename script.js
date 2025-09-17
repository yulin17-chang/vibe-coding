const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");

const bgMusic = document.getElementById("bg-music");
const hitSound = document.getElementById("hit-sound");
const bombSound = document.getElementById("bomb-sound");

let score = 0;
let lives = 3;
let time = 0;
let spawnInterval, timerInterval;
let isGameOver = false;
let playerX = 180;

// 控制左右移動
document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  if (e.key === "ArrowLeft" && playerX > 0) {
    playerX -= 20;
  } else if (e.key === "ArrowRight" && playerX < 360) {
    playerX += 20;
  }
  player.style.left = playerX + "px";
});

// 開始遊戲
startBtn.addEventListener("click", () => {
  startBtn.classList.add("hidden");
  score = 0;
  lives = 3;
  time = 0;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
  timeDisplay.textContent = time;
  isGameOver = false;

  bgMusic.currentTime = 0;
  bgMusic.play();

  timerInterval = setInterval(() => {
    time++;
    timeDisplay.textContent = time;
  }, 1000);

  spawnInterval = setInterval(spawnFallingObject, 1000);
});

// 產生掉落物
function spawnFallingObject() {
  const obj = document.createElement("div");
  obj.classList.add("falling");
  let type = getRandomType();
  obj.textContent = type.symbol;
  obj.dataset.type = type.type;
  obj.style.left = Math.floor(Math.random() * 360) + "px";
  obj.style.animationDuration = type.speed + "s";
  gameContainer.appendChild(obj);

  obj.addEventListener("animationend", () => {
    obj.remove();
  });

  // 檢查碰撞
  let checkCollision = setInterval(() => {
    if (isGameOver) {
      clearInterval(checkCollision);
      return;
    }
    let objRect = obj.getBoundingClientRect();
    let playerRect = player.getBoundingClientRect();
    if (
      objRect.bottom >= playerRect.top &&
      objRect.left < playerRect.right &&
      objRect.right > playerRect.left
    ) {
      handleCollision(obj);
      clearInterval(checkCollision);
    }
  }, 50);
}

// 隨機物件
function getRandomType() {
  const items = [
    { type: "star", symbol: "⭐", score: 1, speed: 3 },
    { type: "gem", symbol: "💎", score: 3, speed: 4 },
    { type: "bomb", symbol: "💣", score: -2, speed: 2 }
  ];
  return items[Math.floor(Math.random() * items.length)];
}

// 碰撞處理
function handleCollision(obj) {
  const type = obj.dataset.type;
  let effectText = "";
  let color = "black";

  if (type === "bomb") {
    lives--;
    livesDisplay.textContent = lives;
    effectText = "-1 ❤️";
    color = "red";
    bombSound.currentTime = 0;
    bombSound.play();
    if (lives <= 0) {
      endGame();
    }
  } else if (type === "star") {
    score += 1;
    scoreDisplay.textContent = score;
    effectText = "+1";
    color = "green";
    hitSound.currentTime = 0;
    hitSound.play();
  } else if (type === "gem") {
    score += 3;
    scoreDisplay.textContent = score;
    effectText = "+3";
    color = "blue";
    hitSound.currentTime = 0;
    hitSound.play();
  }

  showFloatText(effectText, color);
  obj.remove();
}

// 飄字提示
function showFloatText(text, color) {
  const float = document.createElement("div");
  float.classList.add("float-text");
  float.style.left = playerX + "px";
  float.style.bottom = "60px";
  float.style.color = color;
  float.textContent = text;
  gameContainer.appendChild(float);

  setTimeout(() => float.remove(), 1000);
}

// 結束遊戲
function endGame() {
  isGameOver = true;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  bgMusic.pause();
  gameOverScreen.classList.remove("hidden");
  finalScore.textContent = `您的分數：${score}，存活時間：${time} 秒`;
}
