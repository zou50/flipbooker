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

function clearBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
}

// FRAMES
function initializeFrames() {
  framesContainer = document.getElementById('frames');
  currentFrame = createFrameImage();
}

function createFrameImage() {
  let img = document.createElement('img');
  img.width = 100;
  img.height = 100;
  img.src = "";
  img.alt = "";
  img.className = "current-frame"
  img.addEventListener('mousedown', selectFrame);

  framesContainer.appendChild(img);
  framesContainer.parentElement.scrollLeft = framesContainer.parentElement.scrollWidth;

  return img;
}

function addFrame() {
    let data = canvas.toDataURL("image/png");
    frames.push(data);
    currentFrame.src = data;
    currentFrame.className = "";
    currentFrame = createFrameImage();
    clearBoard();
}

function deleteFrame() {

}

function selectFrame(e) {
  currentFrame.className = "";
  currentFrame = e.target;
  currentFrame.className = "current-frame";

  clearBoard();
  ctx.drawImage(currentFrame, 0, 0);
}
