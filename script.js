const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

// ---- RESIZE CANVAS ----
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener("resize", resize);
resize();

// ---- DOODLE IMAGES ----
const doodleImages = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `doodle${i}.png`;
  doodleImages.push(img);
}

// ---- DROPPED DOODLES ----
const doodles = []; // {img, x, y, scale}

// ---- UI ELEMENTS ----
const textInput = document.getElementById("textInput");
const textColorInput = document.getElementById("textColor");
const outlineColorInput = document.getElementById("outlineColor");
const slider = document.getElementById("doodleSlider");
const label = document.getElementById("sliderLabel");
const toggleBg = document.getElementById("toggleBg");
const exportBtn = document.getElementById("exportBtn");

// ---- DRAG & SCALE ----
let selectedDoodle = null;
let offsetX = 0;
let offsetY = 0;

// ---- ADD DOODLE ----
slider.addEventListener("input", () => {
  const index = slider.value - 1;
  label.innerText = `Doodle ${slider.value}`;
  addDoodle(index);
});

function addDoodle(index) {
  const img = doodleImages[index];
  if (!img.complete) return;
  doodles.push({
    img,
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 - 100,
    scale: 1
  });
  draw();
}

// ---- MOUSE EVENTS ----
canvas.addEventListener("mousedown", e => {
  for (let i = doodles.length - 1; i >= 0; i--) {
    const d = doodles[i];
    const w = d.img.width * d.scale;
    const h = d.img.height * d.scale;
    if (e.offsetX >= d.x && e.offsetX <= d.x + w &&
        e.offsetY >= d.y && e.offsetY <= d.y + h) {
      selectedDoodle = d;
      offsetX = e.offsetX - d.x;
      offsetY = e.offsetY - d.y;
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

// ---- LIVE TEXT ----
[textInput, textColorInput, outlineColorInput, toggleBg].forEach(el =>
  el.addEventListener("input", draw)
);

// ---- DRAW EVERYTHING ----
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Doodles
  if (toggleBg.checked) {
    doodles.forEach(d => {
      const w = d.img.width * d.scale;
      const h = d.img.height * d.scale;
      ctx.drawImage(d.img, d.x, d.y, w, h);
    });
  }

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
exportBtn.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");

  const scaleX = 1024 / canvas.width;
  const scaleY = 1024 / canvas.height;

  // Doodles
  doodles.forEach(d => {
    const w = d.img.width * d.scale * scaleX;
    const h = d.img.height * d.scale * scaleY;
    const x = d.x * scaleX;
    const y = d.y * scaleY;
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
});

// ---- START ----
draw();
