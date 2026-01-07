// =========================================
// GLOBAL VARIABLES
// =========================================

const canvas = document.getElementById("maze");
const context = canvas.getContext("2d");

const cellSize = 20;
const rows = canvas.height / cellSize;
const cols = canvas.width / cellSize;

let mazeGrid = [];
let frontierList = [];
let isAutoplay = false;
let generationSpeed = 100;

const cellFillColor = "#64dafe78";
const wallColor = "#1d00fcff";

const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const speedRange = document.getElementById("speedRange");

// =========================================
// WEIGHT FUNCTION
// =========================================

function getRandomEdgeWeight() {
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

  draw(context, size) {
    const x = this.col * size;
    const y = this.row * size;

    if (this.visited) context.fillRect(x, y, size, size);

    context.beginPath();
    if (this.walls.top) context.moveTo(x, y), context.lineTo(x + size, y);
    if (this.walls.right)
      context.moveTo(x + size, y), context.lineTo(x + size, y + size);
    if (this.walls.bottom)
      context.moveTo(x, y + size), context.lineTo(x + size, y + size);
    if (this.walls.left) context.moveTo(x, y), context.lineTo(x, y + size);
    context.stroke();
  }

  getUnvisitedNeighbors(mazeGrid, rows, cols) {
    const directions = [
      { rowOffset: -1, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 0, colOffset: -1 },
    ];

    return directions
      .map(
        (dir) => mazeGrid[this.row + dir.rowOffset]?.[this.col + dir.colOffset]
      )
      .filter((neighbor) => neighbor && !neighbor.visited);
  }

  removeWallBetween(neighbor) {
    const xDirection = neighbor.col - this.col;
    const yDirection = neighbor.row - this.row;

    if (xDirection === 1) {
      this.walls.right = false;
      neighbor.walls.left = false;
    }
    if (xDirection === -1) {
      this.walls.left = false;
      neighbor.walls.right = false;
    }
    if (yDirection === 1) {
      this.walls.bottom = false;
      neighbor.walls.top = false;
    }
    if (yDirection === -1) {
      this.walls.top = false;
      neighbor.walls.bottom = false;
    }
  }
}

// =========================================
// GRID
// =========================================

function createMazeGrid() {
  const mazeGrid = [];

  for (let row = 0; row < rows; row++) {
    mazeGrid[row] = [];
    for (let col = 0; col < cols; col++) {
      mazeGrid[row][col] = new Cell(row, col);
    }
  }
  return mazeGrid;
}

function drawMaze() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = cellFillColor;
  context.strokeStyle = wallColor;

  for (let row = 0; row < rows; row++)
    for (let col = 0; col < cols; col++)
      mazeGrid[row][col].draw(context, cellSize);
}

// =========================================
// PRIMS MAZE
// =========================================

function startMazeGeneration() {
  const startCell =
    mazeGrid[Math.floor(Math.random() * rows)][
      Math.floor(Math.random() * cols)
    ];

  startCell.visited = true;

  startCell.getUnvisitedNeighbors(mazeGrid, rows, cols).forEach((neighbor) => {
    frontierList.push({
      from: startCell,
      to: neighbor,
      weight: getRandomEdgeWeight(),
    });
  });

  isAutoplay = true;
  runPrimsAutomatically();
}

function generateNextStep() {
  // If frontier list is empty, initialize a random start cell
  if (frontierList.length === 0) {
    const startCell =
      mazeGrid[Math.floor(Math.random() * rows)][
        Math.floor(Math.random() * cols)
      ];
    startCell.visited = true;

    startCell.getUnvisitedNeighbors(mazeGrid, rows, cols).forEach((neighbor) => {
      frontierList.push({
        from: startCell,
        to: neighbor,
        weight: getRandomEdgeWeight(),
      });
    });

    drawMaze();
    return;
  }

  // Sort edges by weight (Prim's logic)
  frontierList.sort((lighterEdge, heavierEdge) => lighterEdge.weight - heavierEdge.weight);

  let edge;
  let to;

  // Loop until we find an unvisited 'to' cell
  while (frontierList.length > 0) {
    edge = frontierList.shift();
    to = edge.to;
    if (!to.visited) break;
  }

  // If all remaining edges lead to visited cells, stop
  if (!to || to.visited) return;

  const from = edge.from;

  // Remove wall and mark the cell as visited
  from.removeWallBetween(to);
  to.visited = true;

  // Add neighbors of the new cell to the frontier
  to.getUnvisitedNeighbors(mazeGrid, rows, cols).forEach((neighbor) => {
    frontierList.push({
      from: to,
      to: neighbor,
      weight: getRandomEdgeWeight(),
    });
  });

  // Draw the updated maze so the new cell is visible
  drawMaze();
}

function runPrimsAutomatically() {
  if (!isAutoplay) return;
  generateNextStep();
  setTimeout(runPrimsAutomatically, 101 - generationSpeed);
}

// =========================================
// RESET
// =========================================

function resetMaze() {
  isAutoplay = false;
  frontierList = [];
  mazeGrid = createMazeGrid();
  drawMaze();
}

// =========================================
// EVENTS
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  mazeGrid = createMazeGrid();
  drawMaze();

  startBtn.onclick = startMazeGeneration;
  stepBtn.onclick = generateNextStep;
  resetBtn.onclick = resetMaze;

  speedRange.oninput = (e) => (generationSpeed = parseInt(e.target.value));
});
