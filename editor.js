const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let template = new Image();
let userImage = null;

let imgX = 300;
let imgY = 300;
let imgScale = 1;

let dragging = false;
let offsetX = 0;
let offsetY = 0;

// ---- Templates ----
function setTemplate(type) {
  template.src = type === "shirt"
    ? "shirt_template.png"
    : "pants_template.png";
}
setTemplate("shirt");

template.onload = draw;

// ---- Upload image ----
document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    userImage = img;
    imgX = 300;
    imgY = 300;
    imgScale = 1;
    draw();
  };
  img.src = URL.createObjectURL(file);
});

// ---- Mouse drag ----
canvas.addEventListener("mousedown", e => {
  dragging = true;
  offsetX = e.offsetX - imgX;
  offsetY = e.offsetY - imgY;
});

canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("mouseleave", () => dragging = false);

canvas.addEventListener("mousemove", e => {
  if (!dragging || !userImage) return;
  imgX = e.offsetX - offsetX;
  imgY = e.offsetY - offsetY;
  draw();
});

// ---- Scroll to scale ----
canvas.addEventListener("wheel", e => {
  if (!userImage) return;
  e.preventDefault();
  imgScale += e.deltaY * -0.001;
  imgScale = Math.max(0.1, imgScale);
  draw();
});

// ---- Draw ----
function draw() {
  ctx.clearRect(0, 0, 1024, 1024);

  if (template.complete) {
    ctx.drawImage(template, 0, 0, 1024, 1024);
  }

  if (userImage) {
    const w = userImage.width * imgScale;
    const h = userImage.height * imgScale;
    ctx.drawImage(userImage, imgX, imgY, w, h);
  }
}

// ---- Export ----
function exportPNG() {
  const link = document.createElement("a");
  link.download = "roblox_clothing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
