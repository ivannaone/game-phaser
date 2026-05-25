const config = {
  type: Phaser.AUTO,
  width:  GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#FFF3E0',
  parent: 'game-container',
  scene: [SceneMenu, SceneGame, SceneGameOver],

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  dom: { createContainer: false },
};

const game = new Phaser.Game(config);

game.events.on('ready', () => {
  const el = document.getElementById('loading');
  if (el) {
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '0';
    setTimeout(() => { if (el) el.style.display = 'none'; }, 400);
  }
});
