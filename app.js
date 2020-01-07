// Primary app
window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
  initializeFrames();
  loadExportTools();
}

let canvas, alphaCanvas, animCanvas;
let ctx, ctxAlpha, ctxAnim;

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

let zip, encoder;

function loadCanvas() {
  canvas = document.getElementById('main-board');
  alphaCanvas = document.getElementById('alpha-board');
  animCanvas = document.getElementById('anim-board');

  ctx = canvas.getContext('2d');
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#FFF";

  ctxAlpha = alphaCanvas.getContext('2d');
  ctxAlpha.globalAlpha = 0.1;

  ctxAnim = animCanvas.getContext('2d');

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
  ctx.lineTo(mx, my);
  ctx.stroke();

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
  redraw();
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
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      if (pt.mode == "draw") {
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      if (pt.mode == "end") {
        ctx.lineTo(pt.x, pt.y);
      }
      if (pt.mode == "clear") {
        clearBoard(false);
        didClear = true;
      }
    }
  }
  saveFrame();
}

function drawAlpha() {
  clearAlphaBoard();

  let idx = frames.findIndex(f => f == currentFrame);
  if (idx == 0)
    return;

  // Draw ghost image of previous frame
  let previousFrame = frames[idx - 1];
  ctxAlpha.drawImage(previousFrame, 0, 0);
}

function clearBoard(shouldSaveFlag) {
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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

function clearAlphaBoard() {
  ctxAlpha.clearRect(0, 0, alphaCanvas.width, alphaCanvas.height);
}

function clearAnimBoard() {
  ctxAnim.clearRect(0, 0, animCanvas.width, animCanvas.height);
}

// FRAMES
function initializeFrames() {
  framesContainer = document.getElementById('frames');
  addFrame("", false);
}

function addFrame(src, isClone) {
  // Create new image element for frame
  let img = document.createElement('img');
  img.width = 100;
  img.height = 100;
  img.src = src;
  img.alt = "";
  img.addEventListener('mousedown', selectFrameFromMouse);

  if (isClone) {
    img.undoStack = undoStack.map(e => e);
    img.redoStack = redoStack.map(e => e);
  }
  else {
    img.undoStack = [];
    img.redoStack = [];
  }
  undoStack = img.undoStack;
  redoStack = img.redoStack;

  // Store image as new frame
  framesContainer.appendChild(img);
  framesContainer.parentElement.scrollLeft = framesContainer.parentElement.scrollWidth;
  frames.push(img);

  selectFrameFromElement(frames[frames.length - 1], true);
}

function cloneFrame() {
  let oldSrc = canvas.toDataURL("image/png");
  addFrame(oldSrc, true);
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

  drawAlpha();
  if (clearUndoFlag) {
    undoStack = currentFrame.undoStack;
    redoStack = currentFrame.redoStack;
  }
}

function selectFrameFromMouse(e) {
  if (currentFrame != null)
    currentFrame.className = "";

  currentFrame = e.target;
  selectFrame(e, true);
}

function selectFrameFromElement(e, clearUndoFlag) {
  if (currentFrame != null)
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
    clearBoard(false);
    clearAlphaBoard();

    e.innerHTML = "Stop";
    setButtonsDisabled(true);
    animationHelper();
    animationTimer = setInterval(animationHelper, animationDelay);
  } else {
    clearAnimBoard();
    selectFrameFromElement(currentFrame, true);

    e.innerHTML = "Play";
    setButtonsDisabled(false);
  }
}

function animationHelper() {
  let nextFrame = frames[currentAnimationFrame];
  animationShowFrame(nextFrame);

  if (++currentAnimationFrame >= frames.length)
    currentAnimationFrame = 0;
}

function animationShowFrame(nextFrame) {
  if (currentFrame != null)
    currentFrame.className = "";

  currentFrame = nextFrame;
  currentFrame.className = "current-frame";

  clearAnimBoard();
  ctxAnim.drawImage(currentFrame, 0, 0);
}

function setButtonsDisabled(status) {
  document.getElementById('clear-board-button').disabled  = status;
  document.getElementById('undo-draw-button').disabled    = status;
  document.getElementById('redo-draw-button').disabled    = status;
  document.getElementById('add-frame-button').disabled    = status;
  document.getElementById('delete-frame-button').disabled = status;
  document.getElementById('clone-frame-button').disabled  = status;
}

// EXPORT
function loadExportTools() {
  zip = new JSZip();
  encoder = new GIFEncoder();
}

function exportFramesAsPng() {
  for (let i = 0; i < frames.length; i++) {
    let fileName = "frame_" + i + ".png";
    zip.file(fileName, frames[i].src.substr(frames[i].src.indexOf(',')+1), {base64: true});
  }
  zip.generateAsync({type:"base64"}).then(function (base64) {
    window.location = "data:application/zip;base64," + base64;
  });
}

function exportFramesAsGif() {
  encoder.setRepeat(0);
  encoder.setDelay(animationDelay);
  let gifFilename = "download.gif";

  encoder.start();
  for (let i = 0; i < frames.length; i++) {
    ctx.drawImage(frames[i], 0, 0);
    encoder.addFrame(ctx);
  }
  selectFrameFromElement(currentFrame);
  encoder.finish();
  encoder.download(gifFilename);
}

// DEBUGGING
document.addEventListener('keydown', (e) => {
  if (e.key == 'a') {
    console.log("UNDO: ", undoStack);
    console.log("REDO: ", redoStack);
  }
});
