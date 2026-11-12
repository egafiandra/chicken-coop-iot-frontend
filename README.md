# Smart Poultry

Front-end aplikasi kandang untuk pengguna. Project berdiri sendiri, belum tersambung ke backend, kamera, sensor, atau ESP.

Lokasi: `C:\Users\ega\chicken-coop-iot-frontend`

## Jalankan lokal

Dari folder project:

```text
python -m http.server 4174 --bind 127.0.0.1
```

Buka `http://127.0.0.1:4174`.

## Fitur front-end

- Login dan pembuatan akun pengguna tersedia di front-end. Tidak ada email/kata sandi bawaan. Akun demo tersimpan lokal; jika Web Crypto tersedia, kredensial memakai hash PBKDF2. Pada koneksi tanpa Web Crypto, kata sandi tidak diverifikasi. Tombol pratinjau demo membuka aplikasi tanpa kredensial. Bukan autentikasi produksi.
- Beranda memakai foto ayam yang dilisensikan CC0, serta ringkasan suhu, kelembapan, pakan, valve air, dan jumlah ayam.
- Kontrol buka/tutup valve, lampu dengan mode tetap merah + warm white, dan musik klasik.
- Pengaturan volume musik melalui input angka.
- Halaman Kontrol dan Kamera memakai foto Stitch lokal; Kamera tetap berstatus belum terhubung. Tanpa YOLO.
- Notifikasi dengan aksi tandai dibaca dan profil pengguna yang bisa diperbarui.
- Navigasi bawah pada ponsel, navigasi samping pada layar lebar.

Jumlah awal 12 ekor dan angka contoh untuk suhu, kelembapan, serta notifikasi tersedia agar tampilan dapat dicoba. Badge DEMO menandai data tersebut.

## Uji

```text
node --test tests/*.test.mjs
```

Detail backend dan koneksi perangkat dapat ditambahkan setelah spesifikasi sistem IoT diterima. Repo AquSmartPonik hanya menjadi referensi tampilan dan tidak diubah.
