# 🌾 Spin Matapadi — Interactive Lucky Wheel

Aplikasi web **Wheel Spin (Roda Keberuntungan) Interaktif** dengan tema hijau pertanian (*agricultural aesthetic*), dirancang dengan standar *production-grade*, performa tinggi, dan *zero-bloat*.

---

## 🎯 Kategori Hadiah
1. **🏷️ Gantungan Kunci** — Souvenir eksklusif Matapadi.
2. **🎁 Merchandise** — Paket hadiah utama produk Matapadi.
3. **🌱 Zonk** — Kesempatan mencoba lagi di putaran berikutnya.

---

## ⚡ Tech Stack & Arsitektur

| Komponen | Pilihan Teknologi | Alasan & Keunggulan Produksi |
|---|---|---|
| **Build Tool & Bundler** | [Vite 6](https://vite.dev/) | HMR super cepat, kompilasi rollup efisien, output statis optimal. |
| **Language** | [TypeScript (Strict Mode)](https://www.typescriptlang.org/) | Type-safety penuh tanpa `any`, mencegah bug runtime pada kalkulasi sudut. |
| **Graphics Engine** | **HTML5 Canvas 2D API (Native)** | Rendering terakselerasi GPU langsung pada 60/120 FPS tanpa overhead Virtual DOM. Mendukung High-DPI / Retina Display. |
| **Audio System** | **Web Audio API (Procedural Synthesizer)** | Menghasilkan efek suara detak gerigi (*tick*), melodi kemenangan (*fanfare*), dan suara Zonk secara murni prosedural tanpa file MP3 eksternal. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Styling modern, responsif mobile/desktop, paleta hijau pertanian (Forest Green, Emerald, Harvest Gold, Earth Terracotta). |
| **Visual Effects** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | Animasi konfeti selebrasi saat memenangkan hadiah. |

---

## 📊 Hasil Pengujian & Ukuran Bundle

Ukuran bundle produksi (*gzipped*):
- `dist/index.html`: **~2.99 kB**
- `dist/assets/index.css`: **~6.24 kB**
- `dist/assets/index.js`: **~10.69 kB**
- **Total Bundle Size**: **< 20 kB** (Instant Load Time < 0.3s)

---

## 🚀 Panduan Menjalankan

### 1. Prasyarat
- Node.js `v18+` / `v20+`
- npm `v9+` / `v10+`

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan di Mode Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000` (atau port yang ditampilkan terminal).

### 4. Build untuk Produksi
```bash
npm run build
```
File siap di-deploy langsung dari folder `dist/` ke platform mana pun (Vercel, Cloudflare Pages, Netlify, atau GitHub Pages).

### 5. Menjalankan Simulasi Uji (Monte Carlo & Aligment Math)
```bash
npm test
```

---

## ⚙️ Kustomisasi Hadiah & Probabilitas
Seluruh konfigurasi segmen roda, warna, dan bobot probabilitas dapat diatur secara terpusat pada file:
[`src/core/constants.ts`](file:///c:/Users/RAFLY%20A.R/Downloads/spin-matapadi/src/core/constants.ts)

```typescript
export const WHEEL_ITEMS: readonly WheelSector[] = [
  // Ubah bobot (weight), label, atau warna di sini
];
```

---

## 📜 Lisensi
MIT License © 2026 Matapadi

