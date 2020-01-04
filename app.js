// Primary app
window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
  initializeFrames();
}

let canvas, ctx;
let isDrawing = false;
let lastX = 0, lastY = 0;

let framesContainer;
let frames = [];
let currentFrame;

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

function draw(e) {
  if (!isDrawing)
    return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function clearBoard(shouldSaveFlag) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (shouldSaveFlag)
    saveFrame();
}

function onMouseEnter() {
  console.log("mouse enter");
}

function onMouseOut() {
  console.log("mouse out");
}

function onMouseMove(e) {
  console.log("mouse move");
  draw(e);
}

function onMouseDown(e) {
  console.log("mouse down");
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
}

function onMouseUp() {
  console.log("mouse up");
  isDrawing = false;
  saveFrame();
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
  selectFrameFromElement(frames[newIdx]);
}

function selectFrame(e) {
  currentFrame.className = "current-frame";

  clearBoard(false);
  ctx.drawImage(currentFrame, 0, 0);
}

function selectFrameFromMouse(e) {
  currentFrame.className = "";
  currentFrame = e.target;
  selectFrame(e);
}

function selectFrameFromElement(e) {
  currentFrame = e;
  selectFrame(e);
}
