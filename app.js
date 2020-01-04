// Primary app
window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
}

var canvas;
var ctx;
let isDrawing = false;
let lastX = 0, lastY = 0;

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
