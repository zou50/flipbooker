// Primary app
window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
  initializeFrames();
}

let canvas, ctx;

let isDrawing = false;
let lastX = 0, lastY = 0;
let tempStack = [];
let undoStack = [];
let redoStack = [];

let framesContainer;
let frames = [];
let currentFrame;

let isAnimationPlaying = false;
let animationTimer;
let animationDelay = 100;
let currentAnimationFrame = 0;

function loadCanvas() {
  canvas = document.getElementById('main-board');
  ctx = canvas.getContext('2d');

  // Add event listeners
  canvas.addEventListener('mouseenter', onMouseEnter);
  canvas.addEventListener('mouseout', onMouseOut);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
}

function onMouseEnter() {
  console.log("mouse enter");
}

function onMouseOut() {
  console.log("mouse out");
}

function onMouseMove(e) {
  draw(e);
}

function onMouseDown(e) {
  console.log("mouse down");
  drawDown(e);
}

function onMouseUp(e) {
  console.log("mouse up");
  drawUp(e);
}

// DRAWING
function draw(e) {
  if (!isDrawing)
    return;

  let mx = e.offsetX;
  let my = e.offsetY;

  ctx.lineTo(mx, my);
  ctx.stroke();
  lastX = mx;
  lastY = my;

  tempStack.push({
    x: mx,
    y: my,
    mode: "draw",
  });
}

function drawDown(e) {
  let mx = e.offsetX;
  let my = e.offsetY;

  ctx.beginPath();
  ctx.moveTo(mx, my);
  tempStack = [];
  tempStack.push({
    x: mx,
    y: my,
    mode: "begin",
  });

  lastX = mx;
  lastY = my;
  isDrawing = true;
}

function drawUp(e) {
  let mx = e.offsetX;
  let my = e.offsetY;

  tempStack.push({
    x: mx,
    y: my,
    mode: "end",
  });
  undoStack.push(tempStack);
  redoStack = [];

  isDrawing = false;
  saveFrame();
}

function undo() {
  if (undoStack.length == 0)
    return;

  let item = undoStack.pop();
  if (item)
    redoStack.push(item);
  redraw();
}

function redo() {
  if (redoStack.length == 0)
    return;

  let item = redoStack.pop();
  if (item)
    undoStack.push(item);
  redraw();
}

function redraw() {
  clearBoard(false);
  for (let i = 0; i < undoStack.length; i++) {
    let innerStack = undoStack[i];
    let didClear = false;
    for (let j = 0; j < innerStack.length; j++) {
      let pt = innerStack[j];
      let begin = false;

      if (pt.mode == "begin") {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
      }
      if (pt.mode == "draw") {
        ctx.lineTo(pt.x, pt.y);
      }
      if (pt.mode == "end" || j == innerStack.length - 1) {
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      if (pt.mode == "clear") {
        clearBoard(false);
        didClear = true;
      }
    }
    if (!didClear)
      ctx.stroke();
  }
  saveFrame();
}

function clearBoard(shouldSaveFlag) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (shouldSaveFlag) {
    tempStack = [];
    tempStack.push({
      mode: "clear",
    });
    undoStack.push(tempStack);
    redoStack = [];
    saveFrame();
  }
}

// FRAMES
function initializeFrames() {
  framesContainer = document.getElementById('frames');
  addFrame();
}

function addFrame() {
  if (currentFrame != null) {
    currentFrame.className = "";
  }

  let img = document.createElement('img');
  img.width = 100;
  img.height = 100;
  img.src = "";
  img.alt = "";
  img.className = "current-frame";
  img.addEventListener('mousedown', selectFrameFromMouse);

  undoStack = [];
  redoStack = [];
  img.undoStack = undoStack;
  img.redoStack = redoStack;

  framesContainer.appendChild(img);
  framesContainer.parentElement.scrollLeft = framesContainer.parentElement.scrollWidth;
  frames.push(img);

  currentFrame = img;
  clearBoard(false);
}

function saveFrame() {
  let data = canvas.toDataURL("image/png");
  currentFrame.src = data;
}

function deleteFrame() {
  if (frames.length == 1)
    return;

  let idx = frames.findIndex(f => f == currentFrame);
  let newIdx = idx;
  // Handle last element
  if (idx == frames.length - 1)
    newIdx = idx - 1;

  frames.splice(idx, 1);
  framesContainer.removeChild(currentFrame);
  selectFrameFromElement(frames[newIdx], true);
}

function selectFrame(e, clearUndoFlag) {
  currentFrame.className = "current-frame";

  clearBoard(false);
  ctx.drawImage(currentFrame, 0, 0);

  if (clearUndoFlag) {
    undoStack = currentFrame.undoStack;
    redoStack = currentFrame.redoStack;
  }
}

function selectFrameFromMouse(e) {
  currentFrame.className = "";
  currentFrame = e.target;
  selectFrame(e, true);
}

function selectFrameFromElement(e, clearUndoFlag) {
  currentFrame.className = "";
  currentFrame = e;
  selectFrame(e, clearUndoFlag);
}

// ANIMATIONS
function handleAnimation(e) {
  isAnimationPlaying = !isAnimationPlaying;

  if (animationTimer != null)
    clearInterval(animationTimer);

  currentAnimationFrame = 0;
  if (isAnimationPlaying) {
    e.innerHTML = "Stop";
    setButtonsDisabled(true);
    animationHelper();
    animationTimer = setInterval(animationHelper, animationDelay);
  } else {
    e.innerHTML = "Play";
    setButtonsDisabled(false);
  }
}

function animationHelper() {
  let nextFrame = frames[currentAnimationFrame];
  selectFrameFromElement(nextFrame, false);

  if (++currentAnimationFrame >= frames.length)
    currentAnimationFrame = 0;
}

function setButtonsDisabled(status) {
  document.getElementById('clear-board-button').disabled = status;
  document.getElementById('undo-draw-button').disabled = status;
  document.getElementById('redo-draw-button').disabled = status;
  document.getElementById('add-frame-button').disabled = status;
  document.getElementById('delete-frame-button').disabled = status;
}

// DEBUGGING
document.addEventListener('keydown', (e) => {
  if (e.key == 'a') {
    console.log("UNDO: ", undoStack);
    console.log("REDO: ", redoStack);
  }
});
