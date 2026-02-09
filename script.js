const bg = document.getElementById("bg");
const ctx = bg.getContext("2d");

const exportCanvas = document.getElementById("export");
const exportCtx = exportCanvas.getContext("2d");

function resize() {
  bg.width = innerWidth;
  bg.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ---- DOODLES ----
const doodles = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `doodle${i}.png`;
  doodles.push(img);
}

const slider = document.getElementById("doodleSlider");
const label = document.getElementById("sliderLabel");
const toggleBg = document.getElementById("toggleBg");

// ---- SPRAY PARTICLES ----
let particles = [];

function spray(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x, y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      life: 30
    });
  }
}

function updateSpray() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function drawSpray() {
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---- DRAW ----
function drawDoodles() {
  ctx.clearRect(0, 0, bg.width, bg.height);
  if (!toggleBg.checked) return;

  const img = doodles[slider.value - 1];
  if (!img.complete) return;

  for (let i = 0; i < 14; i++) {
    const size = Math.random() * 220 + 120;
    ctx.drawImage(
      img,
      Math.random() * bg.width,
      Math.random() * bg.height,
      size,
      size
    );
  }
}

function loop() {
  drawDoodles();
  updateSpray();
  drawSpray();
  requestAnimationFrame(loop);
}
loop();

// ---- UI ----
slider.addEventListener("input", () => {
  label.innerText = `Doodle ${slider.value}`;
  spray(innerWidth / 2, innerHeight / 2);
});

toggleBg.addEventListener("change", () => {
  spray(innerWidth / 2, innerHeight / 2);
});

function renderText() {
  document.getElementById("output").innerText =
    document.getElementById("textInput").value;
  spray(innerWidth / 2, innerHeight / 2);
}

// ---- EXPORT PNG (TRANSPARENT) ----
function exportPNG() {
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  exportCtx.clearRect(0, 0, 1024, 1024);

  exportCtx.font = "120px Ganevia";
  exportCtx.textAlign = "center";
  exportCtx.textBaseline = "middle";
  exportCtx.fillStyle = "white";
  exportCtx.fillText(
    document.getElementById("output").innerText,
    512, 512
  );

  const link = document.createElement("a");
  link.download = "graffiti.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}
