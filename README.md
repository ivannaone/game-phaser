# 🍳 Warung Ivanna! — Game Memasak Indonesia

Game memasak 2D lucu berbasis **Phaser 3** dengan tema warung makan Indonesia.

---

##  Struktur Project

```
warung-seru/
├── index.html          ← Entry point utama
├── js/
│   ├── data.js         ← Data bahan & resep
│   ├── utils.js        ← Helper functions
│   ├── SceneMenu.js    ← Layar menu utama
│   ├── SceneGame.js    ← Gameplay utama
│   ├── SceneGameOver.js← Layar game over
│   └── main.js         ← Konfigurasi Phaser
└── README.md
```

---

## Cara Menjalankan di VS Code

### Cara 1 — Live Server (Rekomendasi)
1. Install ekstensi **Live Server** di VS Code
   - Buka Extensions (`Ctrl+Shift+X`)
   - Cari "Live Server" oleh Ritwick Dey
   - Klik Install
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser otomatis terbuka dan refresh setiap save!

### Cara 2 — Buka langsung di browser
1. Buka file `index.html` langsung di Chrome/Firefox/Edge
2. ⚠️ Beberapa browser memblokir file lokal — gunakan Live Server agar aman

---

## Cara Main

| Aksi | Cara |
|------|------|
| Pilih bahan | **Klik** tombol bahan di bagian bawah |
| Lihat pesanan | Papan **kanan atas** |
| Timer | Bar hijau di bawah papan pesanan |
| Level naik | Setiap 120 poin |

### Tips:
- ✅ Pilih **semua bahan** yang tercantum di papan pesanan
- ❌ Jangan klik bahan yang **tidak ada** di resep
- ⚡ Selesaikan **sebelum timer habis** untuk bonus poin
- Makin tinggi level → makin sedikit waktu yang diberikan!

---

## Cara Modifikasi

### Tambah bahan baru → `js/data.js`
```js
{ id: 'garlic', icon: '🧄', name: 'Bawang Putih', col: 8 },
```

### Tambah resep baru → `js/data.js`
```js
{
  name:  'Ayam Goreng',
  emoji: '🍟',
  needs: ['chicken', 'garlic', 'onion'],
  pts:   35,
  level: 2,
  tip:   'Crispy!',
},
```

### Ubah kecepatan timer → `js/data.js`
```js
const GAME_CONFIG = {
  TIME_PER_ORDER: 15000,  // ms — durasi awal timer (lebih besar = lebih santai)
  MIN_TIME:        7000,   // ms — batas minimum timer (jangan terlalu kecil)
  ...
};
```

### Ubah warna tema → `js/data.js` bagian `COLORS`

---

## Pengembangan Lanjutan

Ide fitur yang bisa kamu tambahkan sendiri:

- **🖼️ Sprite gambar** — load gambar PNG untuk chef & bahan lewat `this.load.image()`
- **🎵 Sound effect** — pakai `this.sound.add()` untuk bunyi saat berhasil
- **📱 Mobile touch** — Phaser sudah support touch secara otomatis
- **💾 High score** — simpan ke `localStorage` untuk skor terbaik
- **🗺️ Multiple stage** — buat scene baru untuk level yang berbeda tampilannya
- **👥 2 Player** — keyboard WASD untuk player 2

---

## Dependensi

| Library | Versi | Cara Load |
|---------|-------|-----------|
| **Phaser 3** | 3.60.0 | CDN (otomatis dari internet) |
| **Google Fonts** | — | CDN (Fredoka One, Nunito) |

> ⚠️ Butuh koneksi internet untuk CDN. Untuk offline, download Phaser dari
> https://github.com/phaserjs/phaser/releases dan ganti link di `index.html`.

---

## Belajar Lebih Lanjut

- [Phaser 3 Official Docs](https://docs.phaser.io/phaser3)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Phaser Discord Community](https://discord.gg/phaser)