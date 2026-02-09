const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  draw();
}
window.addEventListener("resize", resize);
resize();

// ---- DOODLES ----
const doodleImages = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `doodle${i}.png`;
  doodleImages.push(img);
}

// ---- DROPPED DOODLES ----
const doodles = []; // varje element: {img, x, y, scale}

// ---- UI ELEMENTS ----
const textInput = document.getElementById("textInput");
const textColorInput = document.getElementById("textColor");
const outlineColorInput = document.getElementById("outlineColor");
const slider = document.getElementById("doodleSlider");
const label = document.getElementById("sliderLabel");
const toggleBg = document.getElementById("toggleBg");

// ---- DRAG & SCALE ----
let selectedDoodle = null;
let offsetX = 0;
let offsetY = 0;

// ---- ADD DOODLE ON SLIDER CHANGE ----
slider.addEventListener("input", () => {
  label.innerText = `Doodle ${slider.value}`;
  addDoodle(slider.value - 1);
  draw();
});

toggleBg.addEventListener("change", draw);
textInput.addEventListener("input", draw);
textColorInput.addEventListener("input", draw);
outlineColorInput.addEventListener("input", draw);

// ---- ADD DOODLE FUNCTION ----
function addDoodle(index) {
  const img = doodleImages[index];
  if (!img.complete) return;
  doodles.push({
    img,
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 - 100,
    scale: 1
  });
}

// ---- MOUSE EVENTS ----
canvas.addEventListener("mousedown", e => {
  for (let i = doodles.length - 1; i >= 0; i--) {
    const d = doodles[i];
    const w = d.img.width * d.scale;
    const h = d.img.height * d.scale;
    if (
      e.offsetX >= d.x &&
      e.offsetX <= d.x + w &&
      e.offsetY >= d.y &&
      e.offsetY <= d.y + h
    ) {
      selectedDoodle = d;
      offsetX = e.offsetX - d.x;
      offsetY = e.offsetY - d.y;
      // flytta den till toppen
      doodles.push(doodles.splice(i, 1)[0]);
      break;
    }
  }
});

canvas.addEventListener("mouseup", () => selectedDoodle = null);
canvas.addEventListener("mouseleave", () => selectedDoodle = null);

canvas.addEventListener("mousemove", e => {
  if (selectedDoodle) {
    selectedDoodle.x = e.offsetX - offsetX;
    selectedDoodle.y = e.offsetY - offsetY;
    draw();
  }
});

// ---- SCROLL TO SCALE ----
canvas.addEventListener("wheel", e => {
  if (!selectedDoodle) return;
  e.preventDefault();
  selectedDoodle.scale += e.deltaY * -0.001;
  selectedDoodle.scale = Math.max(0.1, selectedDoodle.scale);
  draw();
});

// ---- DRAW EVERYTHING ----
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background doodle (if checked)
  if (toggleBg.checked && doodles.length === 0) {
    const img = doodleImages[slider.value - 1];
    if (img.complete) {
      for (let i = 0; i < 14; i++) {
        const size = Math.random() * 220 + 120;
        ctx.drawImage(
          img,
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          size,
          size
        );
      }
    }
  }

  // User doodles
  doodles.forEach(d => {
    const w = d.img.width * d.scale;
    const h = d.img.height * d.scale;
    ctx.drawImage(d.img, d.x, d.y, w, h);
  });

  // Text
  const text = textInput.value;
  const textColor = textColorInput.value;
  const outlineColor = outlineColorInput.value;

  ctx.font = "80px Ganevia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = 6;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = textColor;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// ---- EXPORT PNG ----
function exportPNG() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");

  // User doodles
  doodles.forEach(d => {
    const w = d.img.width * d.scale * (1024 / canvas.width);
    const h = d.img.height * d.scale * (1024 / canvas.height);
    const x = d.x * (1024 / canvas.width);
    const y = d.y * (1024 / canvas.height);
    exportCtx.drawImage(d.img, x, y, w, h);
  });

  // Text
  const text = textInput.value;
  const textColor = textColorInput.value;
  const outlineColor = outlineColorInput.value;

  exportCtx.font = "120px Ganevia";
  exportCtx.textAlign = "center";
  exportCtx.textBaseline = "middle";

  exportCtx.lineWidth = 8;
  exportCtx.strokeStyle = outlineColor;
  exportCtx.strokeText(text, 512, 512);

  exportCtx.fillStyle = textColor;
  exportCtx.fillText(text, 512, 512);

  const link = document.createElement("a");
  link.download = "graffiti.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

// ---- START ----
draw();
