const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
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

// ---- DRAW DOODLES ----
function drawDoodles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!toggleBg.checked) return;

  const img = doodles[slider.value - 1];
  if (!img.complete) return;

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
drawDoodles();

// ---- UPDATE ON SLIDER ----
slider.addEventListener("input", () => {
  label.innerText = `Doodle ${slider.value}`;
  drawDoodles();
});

toggleBg.addEventListener("change", () => {
  drawDoodles();
});

// ---- RENDER TEXT ----
function renderText() {
  const text = document.getElementById("textInput").value;
  const textColor = document.getElementById("textColor").value;
  const outlineColor = document.getElementById("outlineColor").value;

  drawDoodles(); // rita bakgrund först

  ctx.font = "80px Ganevia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Outline
  ctx.lineWidth = 6;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  // Fill
  ctx.fillStyle = textColor;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

// ---- EXPORT PNG ----
function exportPNG() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");

  // Doodles (om bakgrund är på)
  if (toggleBg.checked) {
    const img = doodles[slider.value - 1];
    if (img.complete) {
      for (let i = 0; i < 14; i++) {
        const size = Math.random() * 220 + 120;
        exportCtx.drawImage(
          img,
          Math.random() * 1024,
          Math.random() * 1024,
          size * 1024 / canvas.width,
          size * 1024 / canvas.height
        );
      }
    }
  }

  // Text
  const text = document.getElementById("textInput").value;
  const textColor = document.getElementById("textColor").value;
  const outlineColor = document.getElementById("outlineColor").value;

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
