document.addEventListener("DOMContentLoaded", () => {
const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const endBtn = document.getElementById("endBtn");
const hitSound = document.getElementById("hitSound");

let cells = [];
let score = 0;
let currentMole = null;
let timeLeft = 30;
let gameTimer;
let moleTimer;
let isPaused = false;

// --- 建立九個格子 ---
for(let i=0; i<9; i++){
  const cell = document.createElement("div");
  cell.classList.add("cell");

  const mole = document.createElement("div");
  mole.classList.add("mole");
  mole.textContent = "🐹";
  cell.appendChild(mole);

  grid.appendChild(cell);
  cells.push({cell, mole});
}

// --- 開始遊戲 ---
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
endBtn.addEventListener("click", endGame);

function startGame() {
  score = 0;
  scoreDisplay.textContent = "分數: 0";
  timeLeft = 30;
  timerDisplay.textContent = `時間: ${timeLeft}s`;
  startBtn.disabled = true;
  isPaused = false;
  nextMole();
  gameTimer = setInterval(() => {
    if(!isPaused){
      timeLeft--;
      timerDisplay.textContent = `時間: ${timeLeft}s`;
      if(timeLeft <= 0){
        endGame();
      }
    }
  }, 1000);
}

function togglePause(){
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "繼續遊戲" : "暫停遊戲";
  // 隱藏地鼠或暫停動畫
  if(isPaused && currentMole){
    currentMole.classList.remove("up");
  } else if(!isPaused && currentMole){
    currentMole.classList.add("up");
  }
}

// --- 顯示下一隻地鼠 ---
function nextMole(){
  if(isPaused) return; // 暫停時不生成
  if(currentMole){
    currentMole.classList.remove("up");
    currentMole.removeEventListener("click", hitMole);
  }
  const index = Math.floor(Math.random() * cells.length);
  currentMole = cells[index].mole;
  currentMole.classList.add("up");
  currentMole.addEventListener("click", hitMole);

  const nextTime = Math.random() * 1000 + 500;
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
  pauseBtn.textContent = "暫停遊戲";
  isPaused = false;
}
});
