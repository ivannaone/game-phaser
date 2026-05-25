/**
 * @param {Phaser.Scene} scene
 * @param {number} x, y, w, h, r  — posisi, ukuran, corner radius
 * @param {number} fill  — warna fill (hex)
 * @param {number} stroke — warna stroke (hex), 0 = tidak ada
 * @param {number} strokeWidth
 */
function drawRoundRect(scene, x, y, w, h, r, fill, stroke = 0, strokeWidth = 2) {
  const g = scene.add.graphics();
  if (stroke) {
    g.lineStyle(strokeWidth, stroke, 1);
  }
  g.fillStyle(fill, 1);
  g.fillRoundedRect(x, y, w, h, r);
  if (stroke) {
    g.strokeRoundedRect(x, y, w, h, r);
  }
  return g;
}

function gameText(scene, x, y, text, size = 16, color = '#3E2723', weight = '700') {
  return scene.add.text(x, y, text, {
    fontFamily: "'Fredoka One', cursive",
    fontSize: `${size}px`,
    color,
    stroke: 'rgba(0,0,0,0)',
    strokeThickness: 0,
  }).setOrigin(0.5);
}

function spawnPopup(scene, x, y, text, color = '#4CAF50') {
  const t = scene.add.text(x, y, text, {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '26px',
    color,
    stroke: '#000',
    strokeThickness: 3,
  }).setOrigin(0.5).setDepth(200);

  scene.tweens.add({
    targets: t,
    y: y - 80,
    alpha: 0,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 900,
    ease: 'Power2',
    onComplete: () => t.destroy(),
  });
}

function spawnParticles(scene, x, y, emoji, count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist  = 50 + Math.random() * 40;
    const p = scene.add.text(x, y, emoji, {
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(190);

    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist - 20,
      alpha: 0,
      scale: 0.3,
      duration: 700 + Math.random() * 200,
      ease: 'Power2',
      delay: i * 40,
      onComplete: () => p.destroy(),
    });
  }
}

function flashScreen(scene, color = 0xFFFF00, alpha = 0.35, duration = 200) {
  const flash = scene.add.rectangle(
    GAME_CONFIG.WIDTH / 2,
    GAME_CONFIG.HEIGHT / 2,
    GAME_CONFIG.WIDTH,
    GAME_CONFIG.HEIGHT,
    color,
    alpha
  ).setDepth(500);

  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration,
    onComplete: () => flash.destroy(),
  });
}

function shakeCamera(scene, intensity = 0.006, duration = 250) {
  scene.cameras.main.shake(duration, intensity);
}

function getTimerDuration(level) {
  const t = GAME_CONFIG.TIME_PER_ORDER - (level - 1) * 1000;
  return Math.max(t, GAME_CONFIG.MIN_TIME);
}

function getRecipesForLevel(level) {
  return RECIPES.filter(r => r.level <= level);
}

function pickRandomRecipe(level, lastRecipeName = null) {
  const pool = getRecipesForLevel(level);
  const filtered = pool.filter(r => r.name !== lastRecipeName);
  const arr = filtered.length > 0 ? filtered : pool;
  return arr[Math.floor(Math.random() * arr.length)];
}
