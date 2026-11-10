# Design direction: Monitoring Kandang

Status: draft awal berdasarkan brief dan referensi dashboard AquSmartPonik. Nama produk, logo, serta identitas final belum diberikan.

## Design Read

Aplikasi operasional untuk pemilik/pengawas kandang ayam, dibaca cepat dari desktop maupun ponsel. Bahasa visual: instrumen kandang yang tenang dan praktis, dengan hijau hutan, warna tanah terang, serta aksen hangat untuk mengingatkan konteks pakan dan telur.

Dials: ENERGY 2 / RHYTHM 2 / MOTION 1.

## Tokens

- Pine `#233c30`: navigasi dan hierarki utama, membawa referensi alam tanpa menyalin UI contoh.
- Paper `#f3f1e9` dan surface `#fffefa`: bidang baca hangat dengan batas halus.
- Moss `#75866a`: teks bantu dan status netral.
- Copper `#b97945`: aksen hangat untuk konteks kandang, bukan hiasan pada semua kontrol.
- Water `#4b7d83`: aksen khusus air agar kontrol aliran mudah dikenali.
- Typography: system sans agar terbaca jelas dan tidak memerlukan font eksternal.
- Radius: kartu 17px, kontrol 10px, badge status membulat hanya saat membantu pemindaian.
- Motion: transisi singkat untuk drawer dan umpan balik klik; tidak ada animasi loop.

## Decisions

- Sidebar desktop dan drawer mobile memberi tempat tetap bagi menu aplikasi. Setiap menu menuju view yang benar-benar ada.
- Jumlah 12 berasal dari brief. Nilai suhu, kelembapan, pakan, aliran air, berat, keyakinan YOLO, dan event sengaja menggunakan fixture dummy yang diberi label simulasi agar alur fitur dapat diuji.
- Kontrol valve, lampu merah/warm white, dan musik klasik mempertahankan nama tombol, memakai `aria-pressed`, lalu menampilkan status aktif dengan isian warna tenang, bukan glow.
- Semua kontrol hanya mengubah state browser dan log simulasi. Tidak ada koneksi hardware.
- Kamera memakai placeholder, bukan gambar/video sintetis. Event deteksi dummy terpisah dari stream kamera yang belum tersedia.
- Halaman telur memberi label "indikasi" dan tidak menganggap sampel berat sebagai telur terkonfirmasi.
