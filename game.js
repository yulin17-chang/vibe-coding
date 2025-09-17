document.addEventListener("DOMContentLoaded", () => {
const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const endBtn = document.getElementById("endBtn");
const hitSound = document.getElementById("hitSound");
const bombSound = document.getElementById("bombSound");

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
  grid.appendChild(cell);
  cells.push(cell);
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
endBtn.addEventListener("click", endGame);

function startGame() {
  score = 0;
  scoreDisplay.textContent = "分數: 0";
  timeLeft = 30;
  timerDisplay.textContent = `時間: ${timeLeft}s`;
  isPaused = false;

  startBtn.style.display = "none"; // 隱藏開始按鈕

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
  if(isPaused && currentMole){
    currentMole.classList.remove("up");
  } else if(!isPaused && currentMole){
    currentMole.classList.add("up");
  }
}

function nextMole(){
  if(isPaused) return;

  // 清掉前一隻
  if(currentMole){
    currentMole.remove();
    currentMole = null;
  }

  // 隨機挑一格
  const index = Math.floor(Math.random() * cells.length);
  const mole = document.createElement("div");
  mole.classList.add("mole", "up");

  // 隨機決定種類
  const type = pickMoleType();
  mole.classList.add(type.className);
  mole.textContent = type.icon;

  mole.addEventListener("click", () => hitMole(type));

  cells[index].appendChild(mole);
  currentMole = mole;

  // 設定出現時間
  const stayTime = type.stay;
  moleTimer = setTimeout(nextMole, stayTime);
}

function pickMoleType(){
  const random = Math.random();
  if(random < 0.6) return {className: "normal", icon:"🐹", score:1, stay:1000};
  if(random < 0.8) return {className: "gold", icon:"🐹", score:3, stay:1200};
  if(random < 0.95) return {className: "fast", icon:"🐹", score:2, stay:600};
  return {className: "bomb", icon:"💣", score:-3, stay:1200};
}

function hitMole(type){
  score += type.score;
  scoreDisplay.textContent = `分數: ${score}`;
  if(type.score > 0){
    hitSound.currentTime = 0;
    hitSound.play();
  } else {
    bombSound.currentTime = 0;
    bombSound.play();
  }
  if(currentMole){
    currentMole.remove();
    currentMole = null;
  }
}

function endGame(){
  clearInterval(gameTimer);
  clearTimeout(moleTimer);
  if(currentMole) currentMole.remove();

  alert(`遊戲結束！你的分數: ${score}`);

  startBtn.style.display = "inline-block"; // 結束後顯示開始按鈕
  pauseBtn.textContent = "暫停遊戲";
  isPaused = false;
}
});
