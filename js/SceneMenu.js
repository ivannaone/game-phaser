class SceneMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneMenu' });
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    this._drawBackground(W, H);

    const decos = ['🍳','🌶️','🍚','🍗','🧅','🥚','🍤','🧊'];
    decos.forEach((d, i) => {
      const x = 60 + (i % 4) * 190 + Phaser.Math.Between(-20, 20);
      const y = i < 4 ? 80 : H - 80;
      const t = this.add.text(x, y, d, { fontSize: '32px' })
        .setOrigin(0.5).setAlpha(0.55);

      this.tweens.add({
        targets: t,
        y: y - 14,
        duration: 1800 + i * 200,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 150,
      });
    });

    const titleBg = this.add.graphics();
    titleBg.fillStyle(0xFF6B35, 1);
    titleBg.fillRoundedRect(W / 2 - 230, 130, 460, 80, 40);
    titleBg.lineStyle(4, 0xFFFFFF, 0.5);
    titleBg.strokeRoundedRect(W / 2 - 230, 130, 460, 80, 40);

    this.add.text(W / 2, 170, '🍳 Warung Ivanna!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '46px',
      color: '#FFFFFF',
      stroke: '#C62828',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 228, 'Masak cepat, sajikan tepat!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '20px',
      color: '#FF6B35',
      stroke: '#fff',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const cards = [
      { icon: '🧑‍🍳', label: 'Pilih bahan\nyang tepat' },
      { icon: '⏱️',  label: 'Sebelum\nwaktu habis' },
      { icon: '⭐',  label: 'Kumpulkan\nbanyak poin!' },
    ];
    cards.forEach((c, i) => {
      const cx = 170 + i * 230;
      const cy = 320;

      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 0.85);
      bg.lineStyle(3, 0xFFD54F, 1);
      bg.fillRoundedRect(cx - 80, cy - 55, 160, 110, 16);
      bg.strokeRoundedRect(cx - 80, cy - 55, 160, 110, 16);

      this.add.text(cx, cy - 20, c.icon, { fontSize: '34px' }).setOrigin(0.5);
      this.add.text(cx, cy + 28, c.label, {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '14px',
        color: '#5D4037',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);
    });

    const btnBaseY = 450;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF6B35, 1);
    btnBg.fillRoundedRect(-120, -30, 240, 60, 30);
    btnBg.lineStyle(4, 0xFFFFFF, 0.5);
    btnBg.strokeRoundedRect(-120, -30, 240, 60, 30);

    const btnText = this.add.text(0, 0, '▶  Mulai Main!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '24px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Container di posisi tengah tombol
    const btnContainer = this.add.container(W / 2, btnBaseY + 30, [btnBg, btnText]);

    const btn = this.add.zone(W / 2, btnBaseY + 30, 240, 60)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });
    btn.on('pointerdown', () => {
      flashScreen(this, 0xFF6B35, 0.4, 300);
      this.time.delayedCall(300, () => {
        this.scene.start('SceneGame', { score: 0, lives: GAME_CONFIG.LIVES_START, level: 1 });
      });
    });

    // ✅ Tween pada container — y absolut, tidak terakumulasi
    const baseCY = btnBaseY + 30;
    this.tweens.add({
      targets: btnContainer,
      y: { from: baseCY, to: baseCY - 8 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    document.getElementById('loading').style.display = 'none';
  }

  _drawBackground(W, H) {
    const bg = this.add.graphics();
    bg.fillStyle(0xFFF3E0, 1);
    bg.fillRect(0, 0, W, H);

    bg.lineStyle(1, 0xFFE0B2, 0.5);
    for (let x = 0; x < W; x += 60) bg.lineBetween(x, 0, x, H * 0.55);
    for (let y = 0; y < H * 0.55; y += 60) bg.lineBetween(0, y, W, y);

    bg.fillStyle(0xBCAAA4, 1);
    bg.fillRect(0, H * 0.55, W, H);

    bg.lineStyle(1, 0xA1887F, 0.4);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, H * 0.55, x, H);
    for (let y = H * 0.55; y < H; y += 80) bg.lineBetween(0, y, W, y);

    const counterY = H * 0.55 - 20;
    bg.fillStyle(0x6D4C41, 1);
    bg.fillRect(0, counterY, W, 28);
    bg.fillStyle(0x8D6E63, 1);
    bg.fillRect(0, counterY, W, 10);
  }
}