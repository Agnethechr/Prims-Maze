// =========================================
// GLOBAL VARIABLES
// =========================================

const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");

const cellSize = 20;
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

let grid = [];
let frontierEdges = [];
let isAutoplay = false;
let speed = 100;

const cellFillColor = "#64dafe78";
const wallColor = "#1d00fcff";

const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

// =========================================
// WEIGHT FUNCTION
// =========================================
function getEdgeWeight() {
  return Math.floor(Math.random() * 100) + 1;
}

// =========================================
// CELL CLASS
// =========================================

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = { top: true, right: true, bottom: true, left: true };
  }

  draw(ctx, size) {
    const x = this.col * size;
    const y = this.row * size;

    if (this.visited) ctx.fillRect(x, y, size, size);

    ctx.beginPath();
    if (this.walls.top) ctx.moveTo(x, y), ctx.lineTo(x + size, y);
    if (this.walls.right) ctx.moveTo(x + size, y), ctx.lineTo(x + size, y + size);
    if (this.walls.bottom) ctx.moveTo(x, y + size), ctx.lineTo(x + size, y + size);
    if (this.walls.left) ctx.moveTo(x, y), ctx.lineTo(x, y + size);
    ctx.stroke();
  }

  getUnvisitedNeighbors(grid, rows, cols) {
    const dirs = [
      { r: -1, c: 0 },
      { r: 0, c: 1 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
    ];

    return dirs
      .map(d => grid[this.row + d.r]?.[this.col + d.c])
      .filter(n => n && !n.visited);
  }

  removeWallBetween(other) {
    const dx = other.col - this.col;
    const dy = other.row - this.row;

    if (dx === 1) this.walls.right = other.walls.left = false;
    if (dx === -1) this.walls.left = other.walls.right = false;
    if (dy === 1) this.walls.bottom = other.walls.top = false;
    if (dy === -1) this.walls.top = other.walls.bottom = false;
  }
}

// =========================================
// GRID
// =========================================

function createGrid() {
  const g = [];
  for (let r = 0; r < rows; r++) {
    g[r] = [];
    for (let c = 0; c < cols; c++) g[r][c] = new Cell(r, c);
  }
  return g;
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = cellFillColor;
  ctx.strokeStyle = wallColor;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) grid[r][c].draw(ctx, cellSize);
}

// =========================================
// PRIM MST MAZE
// =========================================

function startPrims() {
  const start = grid[Math.floor(Math.random() * rows)][Math.floor(Math.random() * cols)];
  start.visited = true;

  start.getUnvisitedNeighbors(grid, rows, cols).forEach(n => {
    frontierEdges.push({ from: start, to: n, weight: getEdgeWeight() });
  });

  isAutoplay = true;
  autoplayPrims();
}

function stepPrims() {
  if (frontierEdges.length === 0) return isAutoplay = false;

  frontierEdges.sort((a, b) => a.weight - b.weight);
  const edge = frontierEdges.shift();

  const { from, to } = edge;
  if (to.visited) return;

  from.removeWallBetween(to);
  to.visited = true;

  to.getUnvisitedNeighbors(grid, rows, cols).forEach(n => {
    frontierEdges.push({ from: to, to: n, weight: getEdgeWeight() });
  });

  drawGrid();
}

function autoplayPrims() {
  if (!isAutoplay) return;
  stepPrims();
  setTimeout(autoplayPrims, 101 - speed);
}

// =========================================
// RESET
// =========================================

function resetMaze() {
  isAutoplay = false;
  frontierEdges = [];
  grid = createGrid();
  drawGrid();
}

// =========================================
// EVENTS
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  grid = createGrid();
  drawGrid();

  startBtn.onclick = startPrims;
  stepBtn.onclick = stepPrims;
  resetBtn.onclick = resetMaze;

  speedRange.oninput = e => speed = parseInt(e.target.value);
});
