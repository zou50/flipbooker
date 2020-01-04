// Primary app
window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
  loadButtons();
  initializeFrames();
}

let canvas, ctx;
let clearBoardButton, addFrameButton, deleteFrameButton;
let isDrawing = false;
let lastX = 0, lastY = 0;

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

function loadButtons() {
  clearBoardButton = document.getElementById('clear-board-button');
  addFrameButton = document.getElementById('add-frame-button');
  deleteFrameButton = document.getElementById('delete-frame-button');
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
  currentFrame.className = "";
  currentFrame = e;
  selectFrame(e);
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
  selectFrameFromElement(nextFrame);

  if (++currentAnimationFrame >= frames.length)
    currentAnimationFrame = 0;
}

function setButtonsDisabled(status) {
  clearBoardButton.disabled = status;
  addFrameButton.disabled = status;
  deleteFrameButton.disabled = status;
}
