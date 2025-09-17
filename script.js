const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalTime = document.getElementById("finalTime");

const bgMusic = document.getElementById("bg-music");
const hitSound = document.getElementById("hit-sound");
const bombSound = document.getElementById("bomb-sound");

let score = 0, lives = 3, time = 0;
let spawnInterval, timerInterval;
let isGameOver = false;
let isPaused = false;
let playerX = 180;
let moveLeft = false, moveRight = false;

// 玩家持續移動
function updatePlayer() {
  if (!isGameOver && !isPaused) {
    if (moveLeft && playerX > 0) playerX -= 5;
    if (moveRight && playerX < 350) playerX += 5;
    player.style.left = playerX + "px";
  }
  requestAnimationFrame(updatePlayer);
}
updatePlayer();

// 鍵盤控制
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
  if (e.key.toLowerCase() === "p") togglePause();
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

// 開始遊戲
function startGame() {
  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  gameOverScreen.style.display = "none";

  score = 0; lives = 3; time = 0;
  scoreDisplay.textContent = "⭐分數：" + score;
  livesDisplay.textContent = "❤️生命：" + lives;
  timeDisplay.textContent = "⏳時間：" + time + " 秒";
  isGameOver = false; isPaused = false;

  bgMusic.currentTime = 0;
  bgMusic.play();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      time++;
      timeDisplay.textContent = "⏳時間：" + time + " 秒";
    }
  }, 1000);

  spawnInterval = setInterval(() => {
    if (!isPaused) spawnFallingObject();
  }, 1000);
}
startBtn.addEventListener("click", startGame);

// 暫停 / 繼續
function togglePause() {
  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = "暫停";
    bgMusic.play();
  } else {
    isPaused = true;
    pauseBtn.textContent = "繼續";
    bgMusic.pause();
  }
}
pauseBtn.addEventListener("click", togglePause);

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

  obj.addEventListener("animationend", () => obj.remove());

  let checkCollision = setInterval(() => {
    if (isGameOver || isPaused) return;
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

// 掉落物種類
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
  let effectText = "", color = "white";

  if (type === "bomb") {
    lives--;
    livesDisplay.textContent = "❤️生命：" + lives;
    effectText = "-1 ❤️"; color = "red";
    bombSound.currentTime = 0; bombSound.play();
    if (lives <= 0) endGame();
  } else if (type === "star") {
    score += 1;
    scoreDisplay.textContent = "⭐分數：" + score;
    effectText = "+1"; color = "green";
    hitSound.currentTime = 0; hitSound.play();
  } else if (type === "gem") {
    score += 3;
    scoreDisplay.textContent = "⭐分數：" + score;
    effectText = "+3"; color = "blue";
    hitSound.currentTime = 0; hitSound.play();
  }

  showFloatText(effectText, color);
  obj.remove();
}

// 飄字效果
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
  bgMusic.pause(); bgMusic.currentTime = 0;

  pauseBtn.style.display = "none";
  gameOverScreen.style.display = "block";
  finalScore.textContent = `⭐您的分數：${score}`;
  finalTime.textContent = `⏳存活時間：${time} 秒`;
}
