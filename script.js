const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.onresize = resize;
resize();

function doodle() {
  ctx.fillStyle = `hsla(${Math.random()*360},100%,50%,0.8)`;
  ctx.beginPath();
  ctx.arc(
    Math.random()*canvas.width,
    Math.random()*canvas.height,
    Math.random()*80 + 20,
    0, Math.PI*2
  );
  ctx.fill();
}

for (let i = 0; i < 50; i++) doodle();

function renderText() {
  document.getElementById("output").innerText =
    document.getElementById("textInput").value;
}
