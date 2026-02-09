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
let imagesLoaded = 0;
const totalImages = 8;

for (let i = 1; i <= totalImages; i++) {
  const img = new Image();
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      console.log("Alla doodles laddade!");
      draw();
    }
  };
  img.onerror = () => {
    console.warn(`Kunde inte ladda doodle${i}.png`);
    imagesLoaded++; // Fortsätt även om en bild failar
  };
  img.src = `doodle${i}.png`;
  doodleImages.push(img);
}

// ---- DROPPED DOODLES ----
let doodles = [];
let doodleIdCounter = 0;

// ---- UI ELEMENTS ----
const textInput = document.getElementById("textInput");
const textColorInput = document.getElementById("textColor");
const outlineColorInput = document.getElementById("outlineColor");
const slider = document.getElementById("doodleSlider");
const label = document.getElementById("sliderLabel");
const toggleBg = document.getElementById("toggleBg");
const exportBtn = document.getElementById("exportBtn");
const addDoodleBtn = document.getElementById("addDoodleBtn");
const removeDoodleBtn = document.getElementById("removeDoodleBtn");
const clearDoodlesBtn = document.getElementById("clearDoodlesBtn");
const goToEditorBtn = document.getElementById("goToEditorBtn");

// ---- DRAG & SCALE ----
let selectedDoodle = null;
let offsetX = 0;
let offsetY = 0;

// ---- HJÄLPFUNKTIONER ----
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

// ---- ADD DOODLE ----
function addDoodle() {
  const index = parseInt(slider.value) - 1;
  const img = doodleImages[index];
  
  if (!img || !img.complete) {
    showNotification("Vänta tills bilden är laddad...", "error");
    return;
  }
  
  const scale = 0.5;
  const w = img.width * scale;
  const h = img.height * scale;
  
  doodles.push({
    id: doodleIdCounter++,
    img,
    x: (canvas.width - w) / 2,
    y: (canvas.height - h) / 2,
    scale: scale
  });
  
  showNotification("Doodle tillagd!");
  draw();
}

// ---- TA BORT SENASTE DOODLE ----
function removeLastDoodle() {
  if (doodles.length > 0) {
    doodles.pop();
    showNotification("Senaste doodle borttagen");
    draw();
  } else {
    showNotification("Inga doodles att ta bort", "error");
  }
}

// ---- RENSA ALLA DOODLES ----
function clearAllDoodles() {
  if (doodles.length > 0) {
    doodles = [];
    showNotification("Alla doodles borttagna");
    draw();
  }
}

// ---- EVENT LISTENERS FÖR KNAPPAR ----
addDoodleBtn.addEventListener("click", addDoodle);
removeDoodleBtn.addEventListener("click", removeLastDoodle);
clearDoodlesBtn.addEventListener("click", clearAllDoodles);

slider.addEventListener("input", () => {
  label.innerText = `Doodle ${slider.value}`;
});

// Navigation till editor
goToEditorBtn.addEventListener("click", () => {
  window.location.href = 'editor.html';
});

// ---- MOUSE EVENTS ----
canvas.addEventListener("mousedown", e => {
  const pos = getMousePos(e);
  
  for (let i = doodles.length - 1; i >= 0; i--) {
    const d = doodles[i];
    const w = d.img.width * d.scale;
    const h = d.img.height * d.scale;
    
    if (pos.x >= d.x && pos.x <= d.x + w &&
        pos.y >= d.y && pos.y <= d.y + h) {
      selectedDoodle = d;
      offsetX = pos.x - d.x;
      offsetY = pos.y - d.y;
      // Flytta till överst
      doodles.push(doodles.splice(i, 1)[0]);
      draw();
      break;
    }
  }
});

canvas.addEventListener("mouseup", () => {
  selectedDoodle = null;
});

canvas.addEventListener("mouseleave", () => {
  selectedDoodle = null;
});

canvas.addEventListener("mousemove", e => {
  if (selectedDoodle) {
    const pos = getMousePos(e);
    selectedDoodle.x = pos.x - offsetX;
    selectedDoodle.y = pos.y - offsetY;
    draw();
  }
});

// ---- SCROLL TO SCALE ----
canvas.addEventListener("wheel", e => {
  if (!selectedDoodle) return;
  e.preventDefault();
  
  const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
  selectedDoodle.scale *= scaleFactor;
  selectedDoodle.scale = Math.max(0.1, Math.min(5, selectedDoodle.scale));
  draw();
}, { passive: false });

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
      
      // Rita outline runt vald doodle
      if (d === selectedDoodle) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(d.x, d.y, w, h);
        ctx.setLineDash([]);
      }
    });
  }

  // Text
  const text = textInput.value || "Skriv något...";
  const textColor = textInput.value ? textColorInput.value : "#666";
  const outlineColor = outlineColorInput.value;

  ctx.font = "80px Ganevia, Arial, sans-serif";
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
  try {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d");

    // Vit bakgrund
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, 1024, 1024);

    const scaleX = 1024 / canvas.width;
    const scaleY = 1024 / canvas.height;

    // Doodles
    if (toggleBg.checked) {
      doodles.forEach(d => {
        const w = d.img.width * d.scale * scaleX;
        const h = d.img.height * d.scale * scaleY;
        const x = d.x * scaleX;
        const y = d.y * scaleY;
        exportCtx.drawImage(d.img, x, y, w, h);
      });
    }

    // Text
    const text = textInput.value || "Graffiti";
    const textColor = textColorInput.value;
    const outlineColor = outlineColorInput.value;

    exportCtx.font = "120px Ganevia, Arial, sans-serif";
    exportCtx.textAlign = "center";
    exportCtx.textBaseline = "middle";

    exportCtx.lineWidth = 8;
    exportCtx.strokeStyle = outlineColor;
    exportCtx.strokeText(text, 512, 512);

    exportCtx.fillStyle = textColor;
    exportCtx.fillText(text, 512, 512);

    // Ladda ner
    const link = document.createElement("a");
    link.download = "graffiti_" + new Date().getTime() + ".png";
    link.href = exportCanvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Bilden exporterades!");
  } catch (err) {
    console.error("Export fel:", err);
    showNotification("Export misslyckades", "error");
  }
});

// ---- NOTIFICATION ----
function showNotification(msg, type = "success") {
  const notif = document.createElement("div");
  notif.textContent = msg;
  const bgColor = type === "error" ? "#f44336" : "#4CAF50";
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColor};
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 1000;
    font-family: sans-serif;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

// ---- KEYBOARD SHORTCUTS ----
document.addEventListener("keydown", e => {
  // Delete för att ta bort senaste doodle (om inte man skriver i textfältet)
  if ((e.key === "Delete" || e.key === "Backspace") && document.activeElement !== textInput) {
    e.preventDefault();
    removeLastDoodle();
  }
});

// ---- START ----
draw();
