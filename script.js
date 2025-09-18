const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const timeDisplay = document.getElementById("time");
const gameBtn = document.getElementById("gameBtn");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalTime = document.getElementById("finalTime");
const centerGameOver = document.getElementById("centerGameOver");

const bgMusic = document.getElementById("bg-music");
const hitSound = document.getElementById("hit-sound");
const bombSound = document.getElementById("bomb-sound");

let score = 0, lives = 3, time = 0;
let spawnInterval, timerInterval;
let isGameOver = false;
let isPaused = false;
let isPlaying = false; // 🔹 新增遊戲狀態
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

// 數字補零
function formatNum(num) {
  return String(num).padStart(3, "0");
}

// 更新介面
function updateUI() {
  scoreDisplay.textContent = "⭐分數：" + formatNum(score);
  livesDisplay.textContent = "❤️生命：" + formatNum(lives);
  timeDisplay.textContent = "⏳時間：" + formatNum(time) + " 秒";
}

// 開始遊戲
function startGame() {
  gameBtn.textContent = "暫停遊戲";
  gameOverScreen.style.display = "none";
  centerGameOver.style.display = "none";

  score = 0; lives = 3; time = 0;
  updateUI();
  isGameOver = false; isPaused = false; isPlaying = true;

  bgMusic.currentTime = 0;
  bgMusic.play();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      time++;
      updateUI();
    }
  }, 1000);

  spawnInterval = setInterval(() => {
    if (!isPaused) spawnFallingObject();
  }, 1000);
}

// === 暫停 / 繼續 ===
function togglePause() {
  if (!isPlaying) {
    startGame();
    return;
  }
  if (isGameOver) return;

  if (isPaused) {
    // 繼續遊戲
    isPaused = false;
    gameBtn.textContent = "暫停遊戲";
    centerGameOver.style.display = "none"; // 隱藏 STOP
    bgMusic.play();

    // 重新啟動掉落物產生
    spawnInterval = setInterval(() => {
      if (!isPaused) spawnFallingObject();
    }, 1000);

  } else {
    // 暫停遊戲
    isPaused = true;
    gameBtn.textContent = "繼續遊戲";
    bgMusic.pause();

    // 移除所有掉落物
    document.querySelectorAll(".falling").forEach(obj => obj.remove());
    clearInterval(spawnInterval);

    // 顯示 STOP
    centerGameOver.textContent = "STOP";
    centerGameOver.style.display = "block";
  }
}

gameBtn.addEventListener("click", togglePause);

// 產生掉落物
function spawnFallingObject() {
  const obj = document.createElement("div");
  obj.classList.add("falling");
  let type = getRandomType();
  obj.textContent = type.symbol;
  obj.dataset.type = type.type;
  obj.style.left = Math.floor(Math.random() * (gameContainer.clientWidth - 40)) + "px";
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
    updateUI();
    effectText = "-1 ❤️"; color = "red";
    bombSound.currentTime = 0; bombSound.play();
    if (lives <= 0) endGame();
  } else if (type === "star") {
    score += 1;
    updateUI();
    effectText = "+1"; color = "green";
    hitSound.currentTime = 0; hitSound.play();
  } else if (type === "gem") {
    score += 3;
    updateUI();
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

// === 結束遊戲 ===
function endGame() {
  isGameOver = true;
  isPlaying = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  bgMusic.pause(); bgMusic.currentTime = 0;

  // 移除所有掉落物
  document.querySelectorAll(".falling").forEach(obj => obj.remove());

  // 顯示 GAME OVER
  centerGameOver.textContent = "GAME OVER";
  centerGameOver.style.display = "block";
  gameBtn.textContent = "開始遊戲";

  // 更新結果
  gameOverScreen.style.display = "block";
  finalScore.textContent = `⭐您的分數：${formatNum(score)}`;
  finalTime.textContent = `⏳存活時間：${formatNum(time)} 秒`;
}
