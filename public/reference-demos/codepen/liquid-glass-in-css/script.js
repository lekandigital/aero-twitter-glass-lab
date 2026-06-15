// just for dragging the glass rectangle

const glass = document.querySelector(".glass");

glass.style.position = "absolute";

let isDragging = false;

let offsetX = 0;
let offsetY = 0;

let x = 100;
let y = 100;

let vx = 0;
let vy = 0;

const friction = 0.985;
const bounce = 0.75;
const maxVelocity = 10;

const movementHistory = [];
const velocitySampleWindow = 50; // ms
const stopThreshold = 40; // ms — critical fix

glass.style.left = `${x}px`;
glass.style.top = `${y}px`;

/* ---------------- DRAG START ---------------- */

glass.addEventListener("mousedown", (e) => {
  isDragging = true;

  vx = 0;
  vy = 0;

  movementHistory.length = 0;

  const rect = glass.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top; // ✅ fixed

  recordMovement(e);

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

/* ---------------- DRAG MOVE ---------------- */

function onMouseMove(e) {
  if (!isDragging) return;

  x = e.clientX - offsetX;
  y = e.clientY - offsetY;

  recordMovement(e);
  updatePosition();
}

/* ---------------- DRAG END ---------------- */

function onMouseUp() {
  isDragging = false;

  computeVelocityFromHistory();

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}

/* ---------------- MOVEMENT TRACKING ---------------- */

function recordMovement(e) {
  const now = performance.now();

  movementHistory.push({
    x: e.clientX,
    y: e.clientY,
    time: now,
  });

  while (
    movementHistory.length > 0 &&
    now - movementHistory[0].time > velocitySampleWindow
  ) {
    movementHistory.shift();
  }
}

function computeVelocityFromHistory() {
  if (movementHistory.length < 2) {
    vx = 0;
    vy = 0;
    return;
  }

  const last = movementHistory[movementHistory.length - 1];

  // ✅ Critical fix:
  // If no recent movement, kill velocity
  const now = performance.now();
  if (now - last.time > stopThreshold) {
    vx = 0;
    vy = 0;
    return;
  }

  const first = movementHistory[0];

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const dt = last.time - first.time;

  if (dt === 0 || (dx === 0 && dy === 0)) {
    vx = 0;
    vy = 0;
    return;
  }

  vx = (dx / dt) * 16 * 0.6;
  vy = (dy / dt) * 16 * 0.6;

  vx = Math.max(-maxVelocity, Math.min(maxVelocity, vx));
  vy = Math.max(-maxVelocity, Math.min(maxVelocity, vy));
}

/* ---------------- POSITION UPDATE ---------------- */

function updatePosition() {
  const width = glass.offsetWidth;
  const height = glass.offsetHeight;

  x = Math.max(0, Math.min(x, window.innerWidth - width));
  y = Math.max(0, Math.min(y, window.innerHeight - height));

  glass.style.left = `${x}px`;
  glass.style.top = `${y}px`;
}

/* ---------------- ANIMATION LOOP ---------------- */

function animate() {
  if (!isDragging) {
    x += vx;
    y += vy;

    const width = glass.offsetWidth;
    const height = glass.offsetHeight;

    if (x <= 0) {
      x = 0;
      vx *= -bounce;
    } else if (x >= window.innerWidth - width) {
      x = window.innerWidth - width;
      vx *= -bounce;
    }

    if (y <= 0) {
      y = 0;
      vy *= -bounce;
    } else if (y >= window.innerHeight - height) {
      y = window.innerHeight - height;
      vy *= -bounce;
    }

    vx *= friction;
    vy *= friction;

    if (Math.abs(vx) < 0.05) vx = 0;
    if (Math.abs(vy) < 0.05) vy = 0;

    updatePosition();
  }

  requestAnimationFrame(animate);
}

animate();