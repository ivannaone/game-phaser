class SceneGame extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneGame' });
  }

  init(data) {
    this.score      = data.score  ?? 0;
    this.lives      = data.lives  ?? GAME_CONFIG.LIVES_START;
    this.level      = data.level  ?? 1;
    this.collected  = [];
    this.recipe     = null;
    this.timerLeft  = 0;
    this.timerMax   = getTimerDuration(this.level);
    this.isProcessing = false;
    this._lastRecipe  = null;
  }

  preload() {

    this.load.audio('bgm', 'assets/audio/bgm.mp3');

    this.load.audio('click', 'assets/audio/click.mp3');

    this.load.audio('success', 'assets/audio/success.mp3');

    this.load.audio('fail', 'assets/audio/fail.mp3');

  }

  create() {
    this.bgm = this.sound.add('bgm', {
    loop: true,
    volume: 0.3
});

this.time.delayedCall(500, () => {

    this.input.once('pointerdown', () => {

        if (!this.bgm.isPlaying) {
            this.bgm.play();
        }

    });

});

    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    this._buildBackground(W, H);

    this._buildHUD(W);

    this._buildOrderBoard(W, H);

    this._buildCookingArea(W, H);

    this._buildChef(W, H);

    this._buildIngredientButtons(W, H);

    this.time.delayedCall(300, () => this._nextOrder());
}

  update(time, delta) {
    if (this.isProcessing || !this.recipe) return;

    this.timerLeft -= delta;
    if (this.timerLeft < 0) this.timerLeft = 0;

    this._updateTimerBar();

    if (this.timerLeft <= 0) {
      this._timeUp();
    }
  }

  _buildBackground(W, H) {
    const bg = this.add.graphics();

    bg.fillStyle(0xFFF3E0, 1);
    bg.fillRect(0, 0, W, H * 0.6);

    bg.lineStyle(1, 0xFFE0B2, 0.45);
    for (let x = 0; x < W; x += 60) bg.lineBetween(x, 0, x, H * 0.6);
    for (let y = 0; y < H * 0.6; y += 60) bg.lineBetween(0, y, W, y);

    bg.fillStyle(0xBCAAA4, 1);
    bg.fillRect(0, H * 0.6, W, H);
    bg.lineStyle(1, 0xA1887F, 0.35);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, H * 0.6, x, H);
    for (let y = H * 0.6; y < H; y += 80) bg.lineBetween(0, y, W, y);

    const cy = H * 0.6 - 18;
    bg.fillStyle(0x5D4037, 1);
    bg.fillRect(0, cy, W, 30);
    bg.fillStyle(0x795548, 1);
    bg.fillRect(0, cy, W, 10);

    const wallDecos = [
      { x: 60,  y: 70, icon: '🌿' },
      { x: 130, y: 70, icon: '🌺' },
      { x: W - 60,  y: 70, icon: '🌿' },
      { x: W - 130, y: 70, icon: '⭐' },
    ];
    wallDecos.forEach(d => {
      const t = this.add.text(d.x, d.y, d.icon, { fontSize: '28px' })
        .setOrigin(0.5).setAlpha(0.7);
      this.tweens.add({
        targets: t, y: d.y - 8, duration: 2000 + Math.random() * 800,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
  }

  _buildHUD(W) {
    const hdr = this.add.graphics();
    hdr.fillStyle(COLORS.HEADER, 1);
    hdr.fillRect(0, 0, W, 48);

    this.add.text(16, 24, '🍳 Warung Ivanna!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '20px',
      color: '#FFFFFF',
      stroke: 'rgba(0,0,0,.25)',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    this._buildPill(W - 260, 24, '⭐', () => `${this.score}`, 'scoreTxt');

    this._buildPill(W - 150, 24, '❤️', () => `${this.lives}`, 'livesTxt');

    this._buildPill(W - 55, 24, '🏆', () => `${this.level}`, 'levelTxt');
  }

  _buildPill(x, y, icon, getter, key) {
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0xFFFFFF, 0.25);
    pillBg.fillRoundedRect(x - 46, y - 14, 88, 28, 14);

    const txt = this.add.text(x + 6, y, `${icon} ${getter()}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '15px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this[key] = { el: txt, getter, icon };
  }

  _refreshPill(key) {
    const p = this[key];
    if (p) p.el.setText(`${p.icon} ${p.getter()}`);
  }

  _buildOrderBoard(W, H) {
    const bx = W - 185, by = 58, bw = 178, bh = 230;

    const panel = this.add.graphics();
    panel.fillStyle(0xFFFDE7, 1);
    panel.fillRoundedRect(bx, by, bw, bh, 14);
    panel.lineStyle(3, 0xFFD54F, 1);
    panel.strokeRoundedRect(bx, by, bw, bh, 14);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.12);
    shadow.fillRoundedRect(bx + 4, by + 4, bw, bh, 14);
    shadow.setDepth(-1);

    this.add.text(bx + bw / 2, by + 16, '📋 Pesanan Tamu', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '13px',
      color: '#F57F17',
    }).setOrigin(0.5);

    this.orderEmoji = this.add.text(bx + bw / 2, by + 52, '🍳', {
      fontSize: '36px',
    }).setOrigin(0.5);

    this.orderName = this.add.text(bx + bw / 2, by + 88, '—', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '15px',
      color: '#E65100',
      wordWrap: { width: bw - 16 },
      align: 'center',
    }).setOrigin(0.5);

    this.needItems = [];
    for (let i = 0; i < 5; i++) {
      const t = this.add.text(bx + 14, by + 108 + i * 20, '', {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#5D4037',
      }).setOrigin(0, 0.5);
      this.needItems.push(t);
    }

    this.timerBg = this.add.graphics();
    this.timerBg.fillStyle(0xFFE082, 1);
    this.timerBg.fillRoundedRect(bx + 10, by + bh - 18, bw - 20, 10, 5);

    this.timerBar = this.add.graphics();
    this._redrawTimerBar(bx + 10, by + bh - 18, bw - 20, 10, 1.0, COLORS.TIMER_OK);

    this._timerBarX  = bx + 10;
    this._timerBarY  = by + bh - 18;
    this._timerBarW  = bw - 20;
    this._timerBarH  = 10;
  }

  _redrawTimerBar(x, y, w, h, pct, color) {
    this.timerBar.clear();
    this.timerBar.fillStyle(color, 1);
    this.timerBar.fillRoundedRect(x, y, Math.max(4, w * pct), h, 5);
  }

  _updateTimerBar() {
    const pct   = this.timerLeft / this.timerMax;
    const color = pct > 0.5 ? COLORS.TIMER_OK
                : pct > 0.25 ? COLORS.TIMER_WARN
                : COLORS.TIMER_BAD;
    this._redrawTimerBar(
      this._timerBarX, this._timerBarY,
      this._timerBarW, this._timerBarH,
      pct, color
    );

    if (pct <= 0.2 && Math.random() < 0.15) {
      this.cameras.main.shake(80, 0.002);
    }
  }

  _buildCookingArea(W, H) {
    const cx = 280, cy = H * 0.38;

    this.flameText = this.add.text(cx, cy + 62, '🔥', { fontSize: '30px' })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.flameText,
      scaleX: 1.25, scaleY: 0.85,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const pan = this.add.graphics();
    pan.fillStyle(0x000000, 0.18);
    pan.fillEllipse(cx, cy + 22, 160, 22);
    pan.fillStyle(0x5D4037, 1);
    pan.fillRoundedRect(cx + 68, cy - 8, 68, 16, 8);
    pan.fillStyle(0x795548, 1);
    pan.fillRoundedRect(cx + 72, cy - 4, 60, 8, 4);
    pan.fillStyle(0x424242, 1);
    pan.fillEllipse(cx, cy, 156, 80);
    pan.fillStyle(0x616161, 1);
    pan.fillEllipse(cx, cy - 6, 148, 72);
    pan.fillStyle(0x757575, 1);
    pan.fillEllipse(cx, cy - 10, 130, 60);
    pan.fillStyle(0xFFFFFF, 0.12);
    pan.fillEllipse(cx - 20, cy - 18, 60, 20);

    this._panFoodX = cx;
    this._panFoodY = cy - 10;
    this.panFoodGroup = [];
  }

  _buildChef(W, H) {
    const cx = 130, cy = H * 0.52;

    const chef = this.add.graphics();
    chef.fillStyle(0x5D4037, 1);
    chef.fillRoundedRect(cx - 24, cy + 30, 18, 28, 4);
    chef.fillRoundedRect(cx + 6, cy + 30, 18, 28, 4);
    chef.fillStyle(0x3E2723, 1);
    chef.fillRoundedRect(cx - 28, cy + 52, 22, 10, 5);
    chef.fillRoundedRect(cx + 4, cy + 52, 22, 10, 5);
    chef.fillStyle(0xFFFFFF, 1);
    chef.fillRoundedRect(cx - 30, cy - 10, 60, 42, 8);
    chef.lineStyle(2, 0xFF6B35, 0.5);
    chef.strokeRoundedRect(cx - 30, cy - 10, 60, 42, 8);
    chef.lineStyle(2, 0xFF6B35, 0.4);
    for (let i = 0; i < 3; i++) {
      chef.lineBetween(cx - 12 + i * 12, cy - 10, cx - 12 + i * 12, cy + 32);
    }
    chef.fillStyle(0xFFCC80, 1);
    chef.fillCircle(cx - 36, cy + 10, 10);
    chef.fillCircle(cx + 36, cy + 10, 10);

    const head = this.add.graphics();
    head.fillStyle(0xFFCC80, 1);
    head.fillCircle(cx, cy - 28, 26);
    head.fillStyle(0xFF8A65, 0.55);
    head.fillCircle(cx - 16, cy - 22, 7);
    head.fillCircle(cx + 16, cy - 22, 7);

    head.fillStyle(0x3E2723, 1);
    head.fillCircle(cx - 9, cy - 31, 4);
    head.fillCircle(cx + 9, cy - 31, 4);
    head.fillStyle(0xFFFFFF, 1);
    head.fillCircle(cx - 7, cy - 33, 1.5);
    head.fillCircle(cx + 11, cy - 33, 1.5);

    head.lineStyle(2.5, 0xE65100, 1);
    head.beginPath();
    head.arc(cx, cy - 22, 9, 0.3, Math.PI - 0.3);
    head.strokePath();

    const hat = this.add.graphics();
    hat.fillStyle(0xFFFFFF, 1);
    hat.fillRoundedRect(cx - 22, cy - 66, 44, 36, 4);
    hat.fillRoundedRect(cx - 28, cy - 54, 56, 10, 3);
    hat.lineStyle(2, 0xE0E0E0, 1);
    hat.strokeRoundedRect(cx - 22, cy - 66, 44, 36, 4);

    const spoon = this.add.text(cx + 42, cy - 10, '🥄', { fontSize: '22px' })
      .setOrigin(0.5);
    this.tweens.add({
      targets: spoon,
      angle: 15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const chefGroup = [chef, head, hat];
    this.tweens.add({
      targets: chefGroup,
      y: '-=7',
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.speechBubble = this.add.text(cx + 20, cy - 80, '', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '14px',
      color: '#E65100',
      backgroundColor: '#FFF8E1',
      padding: { x: 8, y: 5 },
    }).setOrigin(0, 1).setAlpha(0);

    this._chefX = cx;
    this._chefY = cy;
  }

  _buildIngredientButtons(W, H) {

  const count = INGREDIENTS.length;

  const btnW = 82;
  const btnH = 92;

  const gap = 14;

  const totalW =
    (count * btnW) +
    ((count - 1) * gap);

  const startX =
    (W - totalW) / 2 + (btnW / 2);

  const y = H - 58;

  this.ingButtons = [];

  INGREDIENTS.forEach((ing, i) => {

    const x = startX + i * (btnW + gap);

    // Posisi Y awal yang tetap untuk icon dan label
    const iconBaseY  = y - 18;
    const labelBaseY = y + 26;

    const shadow = this.add.graphics();

    shadow.fillStyle(0xD98B2B, 0.25);

    shadow.fillRoundedRect(
      x - btnW / 2,
      y - btnH / 2 + 5,
      btnW,
      btnH,
      18
    );

    const bg = this.add.graphics();

    this._drawIngBtn(
      bg,
      x,
      y,
      btnW,
      btnH,
      false
    );

    const icon = this.add.text(
      x,
      iconBaseY,
      ing.icon,
      {
        fontSize: '28px',
        fixedWidth: 40,
        align: 'center'
      }
    )
      .setOrigin(0.5)
      .setResolution(2);

    const label = this.add.text(
      x,
      labelBaseY,
      ing.name,
      {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#5D4037',
        fixedWidth: 60,
        align: 'center'
      }
    )
      .setOrigin(0.5)
      .setResolution(2);

    const check = this.add.text(
      x + 28,
      y - 32,
      '✓',
      {
        fontFamily: "'Fredoka One', cursive",
        fontSize: '14px',
        color: '#FFFFFF',
        backgroundColor: '#4CAF50',
        padding: { x: 4, y: 2 }
      }
    )
    .setOrigin(0.5)
    .setAlpha(0);

    const zone = this.add.zone(
      x,
      y,
      btnW,
      btnH
    ).setInteractive({
      useHandCursor: true
    });

    zone.on('pointerover', () => {

      if (this.collected.includes(ing.id)) return;

      this.tweens.killTweensOf([icon, label]);

      // Tween ke posisi absolut (base - 5), bukan relatif
      this.tweens.add({
        targets: icon,
        y: iconBaseY - 5,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 120,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: label,
        y: labelBaseY - 5,
        duration: 120,
        ease: 'Power2'
      });

    });

    zone.on('pointerout', () => {

      this.tweens.killTweensOf([icon, label]);

      // Kembali ke posisi absolut semula
      this.tweens.add({
        targets: icon,
        y: iconBaseY,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: label,
        y: labelBaseY,
        duration: 120,
        ease: 'Power2'
      });

    });

    zone.on('pointerdown', () => {
      this._onIngredientClick(ing, i);
    });

    this.ingButtons.push({
      bg,
      shadow,
      icon,
      label,
      check,
      zone,
      ing,
      y,
      iconBaseY,
      labelBaseY
    });

  });
}

  _drawIngBtn(g, x, y, w, h, used) {

  g.clear();

  const fillColor =
    used ? 0xDFF5E1 : 0xFFFFFF;

  const strokeColor =
    used ? 0x66BB6A : 0xFFCC80;

  g.fillStyle(fillColor, 1);

  g.fillRoundedRect(
    x - w / 2,
    y - h / 2,
    w,
    h,
    18
  );

  g.lineStyle(3, strokeColor, 1);

  g.strokeRoundedRect(
    x - w / 2,
    y - h / 2,
    w,
    h,
    18
  );

  g.fillStyle(0xFFFFFF, 0.25);

  g.fillRoundedRect(
    x - w / 2 + 4,
    y - h / 2 + 4,
    w - 8,
    18,
    10
  );
}

  _nextOrder() {
    this.isProcessing = false;
    this.collected    = [];
    this.recipe       = pickRandomRecipe(this.level, this._lastRecipe);
    this._lastRecipe  = this.recipe.name;
    this.timerMax     = getTimerDuration(this.level);
    this.timerLeft    = this.timerMax;

    this.ingButtons.forEach(b => {
      this._drawIngBtn(b.bg, b.icon.x, b.y, 76, 80, false);
      b.check.setAlpha(0);

      // Reset posisi icon & label ke base masing-masing
      this.tweens.killTweensOf([b.icon, b.label]);
      b.icon.y  = b.iconBaseY;
      b.label.y = b.labelBaseY;
      b.icon.setScale(1);
    });

    this._clearPanFood();

    this.orderEmoji.setText(this.recipe.emoji);
    this.orderName.setText(this.recipe.name);

    this.needItems.forEach(t => t.setText(''));
    this.recipe.needs.forEach((id, i) => {
      const ing = INGREDIENTS.find(x => x.id === id);
      this.needItems[i].setText(`◦ ${ing.icon} ${ing.name}`);
      this.needItems[i].setStyle({ color: '#5D4037' });
    });

    this._chefSay(`Tolong buat\n${this.recipe.name}! 🙏`);
  }

  _onIngredientClick(ing, btnIdx) {
      this.sound.play('click', {
      volume: 0.5
    });
    if (this.isProcessing || !this.recipe) return;

    if (this.collected.includes(ing.id)) {
      this._wrongShake(btnIdx);
      return;
    }

    if (!this.recipe.needs.includes(ing.id)) {
      this._wrongShake(btnIdx);
      spawnPopup(this, ing.icon.x ?? 400, 420, '❌ Bukan bahan ini!', '#F44336');
      shakeCamera(this, 0.006, 200);
      this._chefSay('Eh salah bahan! 😅');
      return;
    }

    this.collected.push(ing.id);

    const btn = this.ingButtons[btnIdx];
    this._drawIngBtn(btn.bg, btn.icon.x, btn.y, 76, 80, true);
    btn.check.setAlpha(1);

    this.tweens.add({
      targets: btn.icon,
      scaleX: 1.4, scaleY: 1.4,
      duration: 120,
      yoyo: true,
    });

    spawnParticles(this, btn.icon.x, btn.icon.y, ing.icon, 5);

    const needIdx = this.recipe.needs.indexOf(ing.id);
    if (needIdx >= 0) {
      const ing2 = INGREDIENTS.find(x => x.id === ing.id);
      this.needItems[needIdx].setText(`✓ ${ing2.icon} ${ing2.name}`);
      this.needItems[needIdx].setStyle({ color: '#2E7D32' });
    }

    this._addToPan(ing.icon);

    if ([...this.recipe.needs].sort().join() === [...this.collected].sort().join()) {
      this._success();
    }
  }

  _addToPan(icon) {
    const count  = this.panFoodGroup.length;
    const angle  = (count / this.recipe.needs.length) * Math.PI * 2;
    const radius = 30;
    const tx = this._panFoodX + Math.cos(angle) * radius;
    const ty = this._panFoodY + Math.sin(angle) * radius * 0.4;

    const t = this.add.text(this._panFoodX, this._panFoodY + 30, icon, {
      fontSize: '24px',
    }).setOrigin(0.5).setDepth(10);

    this.tweens.add({
      targets: t,
      x: tx, y: ty,
      duration: 350,
      ease: 'Back.easeOut',
    });

    this.panFoodGroup.push(t);
  }

  _clearPanFood() {
    this.panFoodGroup.forEach(t => t.destroy());
    this.panFoodGroup = [];
  }

  _success() {
    this.sound.play('success', {
      volume: 0.6
    });
    this.isProcessing = true;

    const bonus = Math.floor((this.timerLeft / this.timerMax) * GAME_CONFIG.TIME_BONUS_MAX);
    const pts   = this.recipe.pts + bonus;
    this.score += pts;

    const newLevel = Math.floor(this.score / GAME_CONFIG.SCORE_PER_LEVEL) + 1;
    const levelUp  = newLevel > this.level;
    this.level     = newLevel;

    this._refreshPill('scoreTxt');
    this._refreshPill('levelTxt');

    flashScreen(this, 0xFFFF00, 0.3, 250);
    spawnPopup(this, 280, 300, `+${pts} ⭐`, '#4CAF50');
    spawnParticles(this, 280, 280, this.recipe.emoji, 8);
    this._chefSay(levelUp ? '🎉 Level naik!' : '😋 Mantap!');

    if (levelUp) {
      this.time.delayedCall(200, () => {
        spawnPopup(this, 400, 220, `⬆ Level ${this.level}!`, '#FF6B35');
        shakeCamera(this, 0.005, 300);
      });
    }

    this.time.delayedCall(900, () => this._nextOrder());
  }

  _timeUp() {
    this.sound.play('fail', {
      volume: 0.6
    });
    if (this.isProcessing) return;
    this.isProcessing = true;

    this.lives--;
    this._refreshPill('livesTxt');
    shakeCamera(this, 0.012, 300);
    flashScreen(this, 0xFF0000, 0.3, 300);
    spawnPopup(this, 280, 280, '⏰ Waktu Habis!', '#F44336');
    this._chefSay('Aduh keburu!\n😱');

    if (this.lives <= 0) {
      this.time.delayedCall(600, () => {
        this.scene.start('SceneGameOver', { score: this.score, level: this.level });
      });
    } else {
      this.time.delayedCall(800, () => this._nextOrder());
    }
  }

  _wrongShake(btnIdx) {
    const btn = this.ingButtons[btnIdx];
    this.tweens.add({
      targets: [btn.bg, btn.icon, btn.label],
      x: '+=6',
      duration: 60,
      yoyo: true,
      repeat: 3,
    });
  }

  _chefSay(text) {
    this.speechBubble.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.speechBubble,
      alpha: 0,
      duration: 400,
      delay: 1800,
    });
  }
}