// --- 遊戲數據 ---
const INGREDIENTS = ["🍎 蘋果", "🍊 柳橙", "🍌 香蕉", "🍓 草莓", "🥭 芒果", "🥝 奇異果"];
const TOTAL_ORDERS = 5; // 總共幾筆訂單
const TIME_LIMIT = 10; // 每筆訂單倒數秒數（可調難度）

let currentOrder = [];
let playerSelection = [];
let orderIndex = 0;
let fails = 0;
let score = 0;
let timer;
let startTime;

// --- DOM ---
const orderDiv = document.getElementById("order");
const ingredientsDiv = document.getElementById("ingredients");
const statusDiv = document.getElementById("status");
const timerDiv = document.getElementById("timer");
const scoreDiv = document.getElementById("score");
const submitBtn = document.getElementById("submitBtn");

// --- 初始化 ---
function init() {
  startTime = Date.now();
  orderIndex = 0;
  fails = 0;
  score = 0;
  nextOrder();
}

// --- 產生訂單 ---
function generateOrder() {
  const numItems = Math.floor(Math.random() * 3) + 3; // 3～5 種原料
  let order = [];
  while (order.length < numItems) {
    let item = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
    if (!order.includes(item)) order.push(item);
  }
  return order;
}

// --- 顯示新訂單 ---
function nextOrder() {
  if (fails >= 3) {
    endGame("遊戲結束！你失敗了三次 😵");
    return;
  }
  if (orderIndex >= TOTAL_ORDERS) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    endGame(`恭喜完成所有訂單！🎉 分數：${score}，用時：${totalTime} 秒`);
    return;
  }

  currentOrder = generateOrder();
  playerSelection = [];

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
      statusDiv.textContent = `時間到！這筆訂單失敗了 😢 (失敗次數: ${fails})`;
      orderIndex++;
      setTimeout(nextOrder, 1500);
    }
  }, 1000);
}

// --- 顯示原料按鈕 ---
function renderIngredients() {
  ingredientsDiv.innerHTML = "";
  INGREDIENTS.forEach(ing => {
    const btn = document.createElement("button");
    btn.textContent = ing;
    btn.onclick = () => {
      playerSelection.push(ing);
      statusDiv.textContent = `目前選擇：${playerSelection.join(" + ")}`;
    };
    ingredientsDiv.appendChild(btn);
  });
}

// --- 送出檢查 ---
submitBtn.onclick = () => {
  if (arraysEqual(currentOrder, playerSelection)) {
    score++;
    statusDiv.textContent = "✅ 完美完成訂單！";
  } else {
    fails++;
    statusDiv.textContent = `❌ 配方錯誤！失敗次數: ${fails}`;
  }
  clearInterval(timer);
  orderIndex++;
  setTimeout(nextOrder, 1500);
};

// --- 工具函式 ---
function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  let s1 = [...arr1].sort().join(",");
  let s2 = [...arr2].sort().join(",");
  return s1 === s2;
}

// --- 結束 ---
function endGame(msg) {
  clearInterval(timer);
  orderDiv.innerHTML = "";
  ingredientsDiv.innerHTML = "";
  submitBtn.disabled = true;
  timerDiv.textContent = "";
  statusDiv.textContent = msg;
  scoreDiv.textContent = `最終分數：${score}/${TOTAL_ORDERS}`;
}

// --- 開始 ---
init();
