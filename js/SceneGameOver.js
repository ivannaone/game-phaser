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
        { fontSize: `${Phaser.Math.Between(10, 22)}px`, alpha: 0.3 }
      ).setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));

      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha * 0.3, to: star.alpha },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
      });
    }

    const cardW = 400, cardH = 320;
    const cardX = W / 2 - cardW / 2;
    const cardY = H / 2 - cardH / 2;

    const card = this.add.graphics();
    card.fillStyle(0xFFF8E1, 1);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.lineStyle(4, 0xFFD54F, 1);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 24);
    card.setAlpha(0);

    const emoji = this.finalScore >= 200 ? '🏆'
                : this.finalScore >= 100 ? '😊'
                : '😢';

    const titleText = this.finalScore >= 200 ? 'Luar Biasa!'
                    : this.finalScore >= 100 ? 'Bagus!'
                    : 'Game Over!';

    const title = this.add.text(W / 2, cardY + 54, `${emoji} ${titleText}`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '36px',
      color: '#E65100',
      stroke: '#fff',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    const scoreLbl = this.add.text(W / 2, cardY + 110, 'Skor Akhir', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#8D6E63',
    }).setOrigin(0.5).setAlpha(0);

    const scoreNum = this.add.text(W / 2, cardY + 150, `${this.finalScore} ⭐`, {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '48px',
      color: '#FF6B35',
      stroke: '#fff',
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);

    const levelTxt = this.add.text(W / 2, cardY + 200, `Level Tertinggi: ${this.finalLevel} 🏅`, {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#5D4037',
    }).setOrigin(0.5).setAlpha(0);

    const stars = this.finalScore >= 200 ? 3
                : this.finalScore >= 100 ? 2
                : 1;
    const starRow = this.add.text(W / 2, cardY + 238, '⭐'.repeat(stars) + '✩'.repeat(3 - stars), {
      fontSize: '28px',
    }).setOrigin(0.5).setAlpha(0);

    const btnBg = this.add.graphics().setAlpha(0);
    btnBg.fillStyle(0xFF6B35, 1);
    btnBg.fillRoundedRect(W / 2 - 140, cardY + cardH + 20, 280, 52, 26);
    btnBg.lineStyle(3, 0xFFFFFF, 0.5);
    btnBg.strokeRoundedRect(W / 2 - 140, cardY + cardH + 20, 280, 52, 26);

    const btnTxt = this.add.text(W / 2, cardY + cardH + 46, '🔄  Main Lagi!', {
      fontFamily: "'Fredoka One', cursive",
      fontSize: '22px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    const menuTxt = this.add.text(W / 2, cardY + cardH + 90, 'atau  🏠 Menu Utama', {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '14px',
      color: '#FFD54F',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: card,
      alpha: 1,
      y: cardY - 10,
      duration: 400,
      ease: 'Back.easeOut',
    });

    const items = [title, scoreLbl, scoreNum, levelTxt, starRow, btnBg, btnTxt, menuTxt];
    items.forEach((item, i) => {
      this.tweens.add({
        targets: item,
        alpha: 1,
        y: (item.y ?? 0) - 6,
        duration: 300,
        delay: 300 + i * 80,
        ease: 'Power2',
      });
    });

    const btnZone = this.add.zone(W / 2, cardY + cardH + 46, 280, 52)
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
        this.scene.start('SceneGame', {
          score: 0,
          lives: GAME_CONFIG.LIVES_START,
          level: 1,
        });
      });
    });

    const menuZone = this.add.zone(W / 2, cardY + cardH + 90, 200, 30)
      .setInteractive({ useHandCursor: true });
    menuZone.on('pointerdown', () => {
      this.scene.start('SceneMenu');
    });

    if (this.finalScore >= 100) {
      this.time.delayedCall(500, () => {
        const confetti = ['🎉', '🎊', '⭐', '🌟', '✨'];
        for (let i = 0; i < 15; i++) {
          this.time.delayedCall(i * 80, () => {
            const icon = confetti[Math.floor(Math.random() * confetti.length)];
            const x    = Phaser.Math.Between(60, W - 60);
            const p    = this.add.text(x, -20, icon, { fontSize: '24px' })
              .setOrigin(0.5).setDepth(300);
            this.tweens.add({
              targets: p,
              y: H + 40,
              x: x + Phaser.Math.Between(-60, 60),
              alpha: 0,
              duration: Phaser.Math.Between(1200, 2000),
              ease: 'Power1',
              onComplete: () => p.destroy(),
            });
          });
        }
      });
    }
  }
}
