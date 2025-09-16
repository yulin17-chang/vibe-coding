document.addEventListener("DOMContentLoaded", () => {
const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const hitSound = document.getElementById("hitSound");

let cells = [];
let score = 0;
let currentMole = null;
let timeLeft = 30;
let gameTimer;
let moleTimer;

// --- 建立九個格子 ---
for(let i=0; i<9; i++){
  const cell = document.createElement("div");
  cell.classList.add("cell");
  const mole = document.createElement("div");
  mole.classList.add("mole");
  cell.appendChild(mole);
  grid.appendChild(cell);
  cells.push({cell, mole});
}

// --- 開始遊戲 ---
startBtn.addEventListener("click", startGame);

function startGame() {
  score = 0;
  scoreDisplay.textContent = "分數: 0";
  timeLeft = 30;
  timerDisplay.textContent = `時間: ${timeLeft}s`;
  startBtn.disabled = true;
  nextMole();
  gameTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `時間: ${timeLeft}s`;
    if(timeLeft <= 0){
      endGame();
    }
  }, 1000);
}

// --- 顯示下一隻地鼠 ---
function nextMole(){
  if(currentMole){
    currentMole.classList.remove("up");
    currentMole.removeEventListener("click", hitMole);
  }
  const index = Math.floor(Math.random()*cells.length);
  currentMole = cells[index].mole;
  currentMole.classList.add("up");
  currentMole.addEventListener("click", hitMole);
  const nextTime = Math.random()*1000 + 500; // 0.5~1.5秒
  moleTimer = setTimeout(nextMole, nextTime);
}

// --- 點擊地鼠 ---
function hitMole(){
  score++;
  scoreDisplay.textContent = `分數: ${score}`;
  hitSound.currentTime = 0;
  hitSound.play();
  currentMole.classList.remove("up");
  currentMole.removeEventListener("click", hitMole);
  currentMole = null;
}

// --- 結束遊戲 ---
function endGame(){
  clearInterval(gameTimer);
  clearTimeout(moleTimer);
  if(currentMole) currentMole.classList.remove("up");
  alert(`遊戲結束！你的分數: ${score}`);
  startBtn.disabled = false;
}
});
