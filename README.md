# Monitoring Kandang Ayam

Pratinjau front-end mandiri untuk aplikasi monitoring dan kontrol kandang. Project ini belum terhubung ke backend, kamera, sensor, atau ESP.

Lokasi: `C:\Users\ega\chicken-coop-iot-frontend`

## Jalankan lokal

Dari folder project, jalankan:

```text
python -m http.server 4173 --bind 127.0.0.1
```

Lalu buka `http://127.0.0.1:4173`.

## Uji state pratinjau

```text
node --test tests/state.test.mjs
```

## Isi prototipe

- Ringkasan kandang dengan jumlah awal 12 ekor sesuai brief.
- Monitoring suhu, kelembapan, status pakan, debit air, dan perubahan berat dengan nilai fixture yang ditandai data simulasi.
- Grafik tren suhu/kelembapan, daftar event kamera demo, status trigger lokal, dan riwayat yang bisa difilter.
- Kontrol valve, pakan tersedia/habis, lampu merah/warm white, dan musik klasik. Tombol toggle menampilkan status aktif yang terlihat dan dapat dibaca assistive tech; semua aksi hanya memperbarui state lokal dan log demo.
- Tombol reset mengembalikan skenario awal. Tidak ada perintah yang dikirim ke ESP atau perangkat nyata.
- Tampilan kamera tetap placeholder, bukan video atau gambar palsu.
- Loading dan error state pratinjau dapat dilihat dengan `?preview=loading` atau `?preview=error`.
- Layout desktop dan mobile, navigasi keyboard, serta status koneksi yang jujur.

Detail yang masih menunggu spesifikasi: jenis sensor pakan/air, unit dan posisi sensor berat, target YOLO, cara trigger ESP, threshold, serta format data backend.

`DESIGN.md` mencatat arah visual dan batasan prototipe. Repo AquSmartPonik hanya dijadikan referensi pola dashboard; file repo tersebut tidak digunakan atau diubah.
