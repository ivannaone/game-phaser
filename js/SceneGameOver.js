class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'SceneGameOver' });
  }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.finalLevel = data.level ?? 1;
  }

  create() {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    const bg = this.add.graphics();
    bg.fillStyle(0x1A0A00, 1);
    bg.fillRect(0, 0, W, H);

    for (let i = 0; i < 30; i++) {
      const star = this.add.text(
        Phaser.Math.Between(20, W - 20),
        Phaser.Math.Between(20, H - 20),
        '⭐',
        { fontSize: `${Phaser.Math.Between(10, 22)}px` }
      ).setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));

      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha * 0.3, to: star.alpha },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
      });
    }

    const cardW = 400, cardH = 420;
    const cardX = W / 2 - cardW / 2;
    const cardY = H / 2 - cardH / 2;
    const cx    = W / 2;

    const card = this.add.graphics();
    card.fillStyle(0xFFF8E1, 1);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.lineStyle(4, 0xFFD54F, 1);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.setAlpha(0);

    const emoji     = this.finalScore >= 200 ? '🏆' : this.finalScore >= 100 ? '😊' : '😢';
    const titleText = this.finalScore >= 200 ? 'Luar Biasa!' : this.finalScore >= 100 ? 'Bagus!' : 'Game Over!';

    const title = this.add.text(cx, cardY + 52, `${emoji} ${titleText}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '36px', color: '#E65100',
      stroke: '#fff', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    const scoreLbl = this.add.text(cx, cardY + 108, 'Skor Akhir', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px', fontStyle: 'bold', color: '#8D6E63',
    }).setOrigin(0.5).setAlpha(0);

    const scoreNum = this.add.text(cx, cardY + 150, `${this.finalScore} ⭐`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '52px', color: '#FF6B35',
      stroke: '#fff', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    const levelTxt = this.add.text(cx, cardY + 210, `Level Tertinggi: ${this.finalLevel} 🏅`, {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '15px', fontStyle: 'bold', color: '#5D4037',
    }).setOrigin(0.5).setAlpha(0);

    const stars   = this.finalScore >= 200 ? 3 : this.finalScore >= 100 ? 2 : 1;
    const starRow = this.add.text(cx, cardY + 250, '⭐'.repeat(stars) + '✩'.repeat(3 - stars), {
      fontSize: '30px',
    }).setOrigin(0.5).setAlpha(0);

    const btnY  = cardY + cardH - 90;
    const btnW  = 280, btnH = 52;

    const btnBg = this.add.graphics().setAlpha(0);
    btnBg.fillStyle(0xFF6B35, 1);
    btnBg.fillRoundedRect(cx - btnW / 2, btnY, btnW, btnH, 26);
    btnBg.lineStyle(3, 0xFFFFFF, 0.5);
    btnBg.strokeRoundedRect(cx - btnW / 2, btnY, btnW, btnH, 26);

    const btnTxt = this.add.text(cx, btnY + btnH / 2, '🔄  Main Lagi!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '22px', color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    const menuTxt = this.add.text(cx, cardY + cardH - 24, 'atau  🏠 Menu Utama', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px', color: '#FF8C00',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: card, alpha: 1, duration: 400, ease: 'Back.easeOut' });

    [title, scoreLbl, scoreNum, levelTxt, starRow, btnBg, btnTxt, menuTxt].forEach((item, i) => {
      this.tweens.add({
        targets: item, alpha: 1,
        duration: 300, delay: 300 + i * 80, ease: 'Power2',
      });
    });

    const btnZone = this.add.zone(cx, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true });
    btnZone.on('pointerover', () => {
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    btnZone.on('pointerout', () => {
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    btnZone.on('pointerdown', () => {
      flashScreen(this, 0xFF6B35, 0.5, 300);
      this.time.delayedCall(300, () => {
        this.scene.start('SceneGame', { score: 0, lives: GAME_CONFIG.LIVES_START, level: 1 });
      });
    });

    const menuZone = this.add.zone(cx, cardY + cardH - 24, 220, 30)
      .setInteractive({ useHandCursor: true });
    menuZone.on('pointerdown', () => this.scene.start('SceneMenu'));

    if (this.finalScore >= 100) {
      this.time.delayedCall(500, () => {
        const confetti = ['🎉', '🎊', '⭐', '🌟', '✨'];
        for (let i = 0; i < 15; i++) {
          this.time.delayedCall(i * 80, () => {
            const icon = confetti[Math.floor(Math.random() * confetti.length)];
            const x    = Phaser.Math.Between(60, W - 60);
            const p    = this.add.text(x, -20, icon, { fontSize: '24px' }).setOrigin(0.5).setDepth(300);
            this.tweens.add({
              targets: p,
              y: H + 40, x: x + Phaser.Math.Between(-60, 60),
              alpha: 0, duration: Phaser.Math.Between(1200, 2000),
              ease: 'Power1', onComplete: () => p.destroy(),
            });
          });
        }
      });
    }
  }
}