// main.js — Tetris (with Up = rotate, Space = hard drop)
// Put this file in your repo as main.js and load from index.html.

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

const scoreElem = document.getElementById('score');
const levelElem = document.getElementById('level');
const linesElem = document.getElementById('lines');
const highElem = document.getElementById('highscore');

const COLS = 10;
const ROWS = 20;
const BLOCK = 20;
context.scale(BLOCK, BLOCK);
nextCtx.scale(20/ (nextCanvas.width/4), 20/ (nextCanvas.height/4));

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case 'I': return [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]];
    case 'J': return [[2,0,0],[2,2,2],[0,0,0]];
    case 'L': return [[0,0,3],[3,3,3],[0,0,0]];
    case 'O': return [[4,4],[4,4]];
    case 'S': return [[0,5,5],[5,5,0],[0,0,0]];
    case 'T': return [[0,6,0],[6,6,6],[0,0,0]];
    case 'Z': return [[7,7,0],[0,7,7],[0,0,0]];
  }
}

const colors = [null,'#00f0f0','#0000f0','#f0a000','#f0f000','#00f000','#a000f0','#f00000'];

function drawMatrix(matrix, offset) {
  matrix.forEach((row,y) => {
    row.forEach((value,x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = 'rgba(0,0,0,0.2)';
        context.lineWidth = 0.04;
        context.strokeRect(x + offset.x + 0.02, y + offset.y + 0.02, 0.96, 0.96);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0,0,canvas.width / BLOCK, canvas.height / BLOCK);
  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
  drawGrid();
}

function drawNext(matrix) {
  nextCtx.fillStyle = '#000';
  nextCtx.fillRect(0,0,nextCanvas.width/20, nextCanvas.height/20);
  const w = matrix[0].length;
  const h = matrix.length;
  const offset = { x: Math.floor((4 - w)/2), y: Math.floor((4 - h)/2) };
  matrix.forEach((row,y) => {
    row.forEach((val,x) => {
      if (val !== 0) {
        nextCtx.fillStyle = colors[val];
        nextCtx.fillRect(x + offset.x, y + offset.y, 1, 1);
        nextCtx.strokeStyle = 'rgba(0,0,0,0.2)';
        nextCtx.lineWidth = 0.06;
        nextCtx.strokeRect(x + offset.x + 0.02, y + offset.y + 0.02, 0.96, 0.96);
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix; const o = player.pos;
  for (let y=0;y<m.length;++y) for (let x=0;x<m[y].length;++x) {
    if (m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0) return true;
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row,y) => {
    row.forEach((value,x) => {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}

function sweep() {
  let rowCount = 0;
  outer: for (let y = arena.length -1; y >= 0; --y) {
    for (let x=0;x<arena[y].length;++x) if (arena[y][x] === 0) continue outer;
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    ++y;
    rowCount++;
  }
  if (rowCount > 0) {
    const points = [0,40,100,300,1200];
    player.score += (points[rowCount] || 0) * (player.level + 1);
    player.lines += rowCount;
    const newLevel = Math.floor(player.lines / 10);
    if (newLevel > player.level) {
      player.level = newLevel;
      dropInterval = Math.max(100, 1000 - player.level * 75);
    }
    updateScore();
  }
}

function rotate(matrix, dir) {
  for (let y=0;y<matrix.length;++y) for (let x=0;x<y;++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
  if (dir > 0) matrix.forEach(row => row.reverse()); else matrix.reverse();
}

function pickRandomPiece() { const pieces = 'ILJOTSZ'; return createPiece(pieces[Math.floor(Math.random()*pieces.length)]); }

let nextPiece = pickRandomPiece();

function spawnPlayer() {
  player.matrix = nextPiece;
  nextPiece = pickRandomPiece();
  player.pos.y = 0;
  player.pos.x = Math.floor(COLS/2) - Math.floor(player.matrix[0].length/2);
  if (collide(arena, player)) {
    // game over -> reset arena and stats
    arena.forEach(row => row.fill(0));
    player.score = 0; player.lines = 0; player.level = 0;
    dropInterval = 1000;
    gameOver = true;
    updateScore();
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    sweep();
    spawnPlayer();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) { rotate(player.matrix, -dir); player.pos.x = pos; return; }
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let paused = false;
let gameOver = false;

function update(time = 0) {
  if (paused) { lastTime = time; requestAnimationFrame(update); return; }
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  drawNext(nextPiece);
  requestAnimationFrame(update);
}

const arena = createMatrix(COLS, ROWS);
const player = { pos: {x:0,y:0}, matrix: null, score:0, level:0, lines:0 };

function updateScore() {
  scoreElem.textContent = player.score;
  levelElem.textContent = player.level;
  linesElem.textContent = player.lines;
  const hs = Math.max(player.score, Number(localStorage.getItem('tetrisHigh') || 0));
  localStorage.setItem('tetrisHigh', hs);
  highElem.textContent = hs;
}

function resetGame() {
  for (let y=0;y<ROWS;++y) arena[y].fill(0);
  player.score = 0; player.level = 0; player.lines = 0;
  dropInterval = 1000;
  nextPiece = pickRandomPiece();
  spawnPlayer();
  gameOver = false;
  paused = false;
  updateScore();
}

// Input handling: ← → move, ↑ rotate, ↓ soft drop, Space hard drop, P pause
document.addEventListener('keydown', event => {
  // prevent default for Arrow keys and Space to avoid page scroll
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault();

  if (event.code === 'ArrowLeft') playerMove(-1);
  else if (event.code === 'ArrowRight') playerMove(1);
  else if (event.code === 'ArrowDown') playerDrop(); // soft drop
  else if (event.code === 'ArrowUp') playerRotate(1); // <-- rotate on Up
  else if (event.code === 'Space') {
    // hard drop
    if (!gameOver) {
      while (!collide(arena, player)) player.pos.y++;
      player.pos.y--;
      merge(arena, player);
      sweep();
      spawnPlayer();
      dropCounter = 0;
    }
  } else if (event.code === 'KeyP') {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
  } else if (event.code === 'Enter') {
    if (gameOver) resetGame();
  }

  // If gameOver, Enter resets. We keep Space as hard drop while playing.
});

// Buttons
document.getElementById('startBtn').addEventListener('click', () => resetGame());
document.getElementById('pauseBtn').addEventListener('click', () => {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
});

// initial
nextPiece = pickRandomPiece();
spawnPlayer();
updateScore();
update();

function drawGrid() {
  context.strokeStyle = 'rgba(255,255,255,0.03)';
  context.lineWidth = 0.02;
  for (let x=0;x<COLS;++x) for (let y=0;y<ROWS;++y) context.strokeRect(x,y,1,1);
}
