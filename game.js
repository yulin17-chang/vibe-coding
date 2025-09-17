const grid = document.getElementById("game-grid");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const endBtn = document.getElementById("end-btn");

let score = 0;
let timeLeft = 30;
let timer;
let gameInterval;
let gameActive = false;
let paused = false;

// 建立九個洞
for (let i = 0; i < 9; i++) {
  const hole = document.createElement("div");
  hole.classList.add("hole");
  grid.appendChild(hole);
}

function randomMole() {
  if (!gameActive || paused) return;

  const holes = document.querySelectorAll(".hole");
  const hole = holes[Math.floor(Math.random() * holes.length)];

  const mole = document.createElement("div");

  // 隨機決定種類
  const typeChance = Math.random();
  let moleType;
  if (typeChance < 0.6) moleType = "normal";       // 60%
  else if (typeChance < 0.8) moleType = "gold";    // 20%
  else if (typeChance < 0.95) moleType = "fast";   // 15%
  else moleType = "bomb";                          // 5%

  mole.classList.add("mole", moleType);

  // emoji 顯示
  mole.textContent = moleType === "bomb" ? "💣" : "🐹";

  mole.addEventListener("click", () => {
    if (!gameActive) return;
    if (moleType === "normal") score += 1;
    if (moleType === "gold") score += 3;
    if (moleType === "fast") score += 2;
    if (moleType === "bomb") score -= 3;

    scoreDisplay.textContent = score;
    mole.remove();
  });

  hole.appendChild(mole);

  // 存活時間
  let duration = 1000;
  if (moleType === "fast") duration = 500;
  setTimeout(() => mole.remove(), duration);
}

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  gameActive = true;
  paused = false;

  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";
  endBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";

  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);

  gameInterval = setInterval(randomMole, 800);
}

function pauseGame() {
  paused = true;
  pauseBtn.style.display = "none";
  resumeBtn.style.display = "inline-block";
}

function resumeGame() {
  paused = false;
  pauseBtn.style.display = "inline-block";
  resumeBtn.style.display = "none";
}

function endGame() {
  gameActive = false;
  clearInterval(timer);
  clearInterval(gameInterval);

  pauseBtn.style.display = "none";
  resumeBtn.style.display = "none";
  endBtn.style.display = "none";
  startBtn.style.display = "inline-block";

  alert(`遊戲結束！您的分數是 ${score} 分`);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resumeBtn.addEventListener("click", resumeGame);
endBtn.addEventListener("click", endGame);
