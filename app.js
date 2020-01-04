// Primary app
var canvas;
var ctx;

window.onload = function() {
  console.log("Flipbooker");

  loadCanvas();
}

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

function onMouseMove() {
  console.log("mouse move");
}

function onMouseDown() {
  console.log("mouse down");
}

function onMouseUp() {
  console.log("mouse up");
}
