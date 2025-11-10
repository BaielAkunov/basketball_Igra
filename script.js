const canvas = document.getElementById('court');
const ctx = canvas.getContext('2d');

// 🔧 Responsive canvas setup
function resizeCanvas() {
  const screenWidth = window.innerWidth;
  canvas.width = screenWidth < 600 ? screenWidth - 40 : 800;
  canvas.height = canvas.width / 2;
  startY = canvas.height - 30;
  hoop.y = canvas.height - 150;
  drawScene();
}
window.addEventListener('resize', resizeCanvas);

// 🏀 Game variables
let g = 9.8;
let scale = 20;
let startX = 50;
let startY = canvas.height - 30;
let hoop = { x: 500, y: canvas.height - 150, r: 15 };

let power = 0;
let powerDirection = 1;
let charging = false;
let canShoot = true;

// ⚡ Power bar canvas
const powerCanvas = document.createElement('canvas');
powerCanvas.width = 300;
powerCanvas.height = 20;
powerCanvas.style.border = "2px solid #444";
powerCanvas.style.marginTop = "10px";
document.querySelector('.controls').appendChild(powerCanvas);
const powerCtx = powerCanvas.getContext('2d');

// 🎯 Angle input
document.getElementById('angle').oninput = e => {
  document.getElementById('angleVal').textContent = `${e.target.value}°`;
  drawScene();
};

// 🏀 Draw hoop
function drawHoop() {
  const boardX = hoop.x - 40;
  const boardY = hoop.y - 100;
  const boardWidth = 80;
  const boardHeight = 60;

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 3;
  ctx.fillRect(boardX, boardY, boardWidth, boardHeight);
  ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);

  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 2;
  ctx.strokeRect(hoop.x - 15, hoop.y - 55, 30, 20);

  const rimRadius = hoop.r;
  ctx.beginPath();
  ctx.arc(hoop.x, hoop.y, rimRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#e53935";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hoop.x, hoop.y);
  ctx.lineTo(hoop.x, hoop.y - 25);
  ctx.strokeStyle = "#b71c1c";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#eee";
  for (let i = -rimRadius + 2; i < rimRadius; i += 5) {
    ctx.beginPath();
    ctx.moveTo(hoop.x + i, hoop.y + 2);
    ctx.lineTo(hoop.x + i * 0.6, hoop.y + 25);
    ctx.stroke();
  }
}

// 🟠 Draw ball
function drawBall(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 7, y);
  ctx.lineTo(x + 7, y);
  ctx.moveTo(x, y - 7);
  ctx.lineTo(x, y + 7);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();
}

// 🔋 Draw power bar
function drawPowerBar() {
  powerCtx.clearRect(0, 0, powerCanvas.width, powerCanvas.height);
  const gradient = powerCtx.createLinearGradient(0, 0, powerCanvas.width, 0);
  gradient.addColorStop(0, "green");
  gradient.addColorStop(0.5, "yellow");
  gradient.addColorStop(1, "red");
  powerCtx.fillStyle = gradient;
  powerCtx.fillRect(0, 0, (power / 100) * powerCanvas.width, powerCanvas.height);
}

// 🔁 Update power
function updatePower() {
  if (!charging) return;
  power += powerDirection * 2;
  if (power >= 100) {
    power = 100;
    powerDirection = -1;
  } else if (power <= 0) {
    power = 0;
    powerDirection = 1;
  }
  drawPowerBar();
  requestAnimationFrame(updatePower);
}

// 🎨 Draw full scene
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawHoop();
  drawBall(startX, startY);
  drawPowerBar();
}

// 🎮 Start charging
function shoot() {
  if (!canShoot) return;
  canShoot = false;
  charging = true;
  power = 0;
  powerDirection = 1;
  updatePower();

  document.querySelector('button').textContent = "Бросить";
  document.querySelector('button').onclick = releaseShot;
}

// 🏹 Release shot
function releaseShot() {
  charging = false;
  document.querySelector('button').textContent = "Прицелиться";
  document.querySelector('button').onclick = shoot;

  const angleDeg = +document.getElementById('angle').value;
  const v0 = 5 + (power / 100) * 15;

  let deviation = 0;
  if (power < 40 || power > 90) deviation = (Math.random() - 0.5) * 10;

  const angleRad = (angleDeg + deviation) * Math.PI / 180;
  const vx = v0 * Math.cos(angleRad);
  const vy = v0 * Math.sin(angleRad);

  let t = 0;
  const dt = 0.03;

  function animate() {
    const x = startX + vx * t * scale;
    const y = startY - (vy * t - 0.5 * g * t * t) * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHoop();
    drawBall(x, y);

    const dx = x - hoop.x;
    const dy = y - hoop.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < hoop.r + 10) {
      showMessage("💥 кирпич!");
      canShoot = true;
      return;
    }

    if (x > hoop.x - 10 && x < hoop.x + 10 && y > hoop.y + 5 && y < hoop.y + 25) {
      showMessage("🏆 идеально!");
      canShoot = true;
      return;
    }

    if (y > canvas.height - 10 || x > canvas.width) {
      showMessage("❌ не попал!");
      canShoot = true;
      return;
    }

    t += dt;
    requestAnimationFrame(animate);
  }

  animate();
}

// 💬 Show result message
function showMessage(msg) {
  ctx.font = "28px Segoe UI";
  ctx.fillStyle = "#ff9800";
  ctx.textAlign = "center";
  ctx.fillText(msg, canvas.width / 2, 50);
}

// 🚀 Initialize
resizeCanvas();