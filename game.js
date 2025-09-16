document.addEventListener("DOMContentLoaded", () => {

const INGREDIENTS = ["🍎", "🍊", "🍌", "🍓", "🥭", "🥝"];
const TOTAL_ORDERS = 5;

let TIME_LIMIT = 10;
let currentOrder = [];
let playerSelection = [];
let orderIndex = 0;
let fails = 0;
let score = 0;
let timer;
let startTime;

const difficultyDiv = document.getElementById("difficultySelect");
const gameDiv = document.getElementById("game");
const orderDiv = document.getElementById("order");
const ingredientsDiv = document.getElementById("ingredients");
const cupDiv = document.getElementById("cup");
const juiceDiv = document.getElementById("juice");
const submitBtn = document.getElementById("submitBtn");
const statusDiv = document.getElementById("status");
const timerDiv = document.getElementById("timer");
const scoreDiv = document.getElementById("score");
const sendSound = document.getElementById("sendSound");

// --- 難度選擇 ---
difficultyDiv.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    TIME_LIMIT = parseInt(btn.dataset.time);
    difficultyDiv.style.display = "none";
    gameDiv.style.display = "block";
    init();
  });
});

// --- 初始化 ---
function init() {
  startTime = Date.now();
  orderIndex = 0;
  fails = 0;
  score = 0;
  playerSelection = [];
  juiceDiv.style.height = "0%";
  submitBtn.disabled = false;
  nextOrder();
}

// --- 產生訂單 ---
function generateOrder() {
  const numItems = Math.floor(Math.random() * 3) + 3;
  let order = [];
  while (order.length < numItems) {
    let item = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
    if (!order.includes(item)) order.push(item);
  }
  return order;
}

// --- 顯示訂單 ---
function nextOrder() {
  if (fails >= 3) {
    endGame("遊戲結束！你失敗三次 😵");
    return;
  }
  if (orderIndex >= TOTAL_ORDERS) {
    const totalTime = Date.now() - startTime;
    const min = Math.floor(totalTime/60000);
    const sec = Math.floor((totalTime%60000)/1000);
    endGame(`恭喜您完成 ${score} 筆訂單！\n用時 ${min} 分 ${sec} 秒`);
    return;
  }

  currentOrder = generateOrder();
  playerSelection = [];
  juiceDiv.style.height = "0%";

  orderDiv.innerHTML = `<h3>第 ${orderIndex + 1} 筆訂單</h3>
    <p>需要：${currentOrder.join(" + ")}</p>`;

  renderIngredients();
  startCountdown();
}

// --- 倒數計時 ---
function startCountdown() {
  let timeLeft = TIME_LIMIT;
  timerDiv.textContent = `剩餘時間：${timeLeft}s`;
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `剩餘時間：${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      fails++;
      shakeCup();
      statusDiv.textContent = `時間到！這筆訂單失敗 😢 (失敗次數: ${fails})`;
      orderIndex++;
      setTimeout(nextOrder, 1500);
    }
  }, 1000);
}

// --- 顯示原料拖曳 ---
function renderIngredients() {
  ingredientsDiv.innerHTML = "";
  INGREDIENTS.forEach(ing => {
    const span = document.createElement("span");
    span.textContent = ing;
    span.classList.add("ingredient");
    span.draggable = true;
    span.ondragstart = e => e.dataTransfer.setData("text", ing);
    ingredientsDiv.appendChild(span);
  });
}

// --- 拖曳進杯子 ---
cupDiv.ondragover = e => e.preventDefault();
cupDiv.ondrop = e => {
  const ing = e.dataTransfer.getData("text");
  playerSelection.push(ing);
  updateJuice();
  statusDiv.textContent = `目前選擇：${playerSelection.join(" + ")}`;
};

// --- 更新杯子果汁高度 ---
function updateJuice() {
  const percent = Math.min(100, (playerSelection.length / currentOrder.length) * 100);
  juiceDiv.style.height = percent + "%";
}

// --- 送出檢查 ---
submitBtn.onclick = () => {
  clearInterval(timer);
  sendSound.play();
  if (arraysEqual(currentOrder, playerSelection)) {
    score++;
    flashCup();
    statusDiv.textContent = "✅ 完美完成訂單！";
  } else {
    fails++;
    shakeCup();
    statusDiv.textContent = `❌ 配方錯誤！失敗次數: ${fails}`;
  }
  orderIndex++;
  setTimeout(nextOrder, 1500);
};

// --- 特效 ---
function flashCup() {
  cupDiv.style.transition = "0.2s";
  cupDiv.style.transform = "scale(1.1)";
  setTimeout(() => { cupDiv.style.transform = "scale(1)"; }, 200);
}

function shakeCup() {
  cupDiv.style.transition = "0.05s";
  cupDiv.style.transform = "translateX(-10px)";
  setTimeout(()=>{cupDiv.style.transform = "translateX(10px)";},50);
  setTimeout(()=>{cupDiv.style.transform = "translateX(0px)";},100);
}

// --- 工具函式 ---
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  let s1 = [...arr1].sort().join(",");
  let s2 = [...arr2].sort().join(",");
  return s1 === s2;
}

// --- 結束遊戲 ---
function endGame(msg) {
  clearInterval(timer);
  orderDiv.innerHTML = "";
  ingredientsDiv.innerHTML = "";
  submitBtn.disabled = true;
  timerDiv.textContent = "";
  statusDiv.innerHTML = msg.replace(/\n/g,"<br>");
  scoreDiv.innerHTML = `<button onclick="restartGame()">再次遊玩</button>`;
}

// --- 再次遊玩 ---
window.restartGame = function() {
  difficultyDiv.style.display = "block";
  gameDiv.style.display = "none";
  scoreDiv.innerHTML = "";
  statusDiv.textContent = "";
  juiceDiv.style.height = "0%";
}

});
