# Design direction: Smart Poultry

Status: UI pengguna untuk prototipe front-end. Identitas final dan detail koneksi IoT menyusul.

## Design Read

Aplikasi operasional mobile-first untuk pengguna kandang ayam. Prioritasnya membaca suhu, kelembapan, pakan, air, dan status perangkat dengan cepat. Bahasa visual memakai hijau hutan dan warna netral hangat, dengan aksen khusus pada status air dan pencahayaan.

Dials: ENERGY 2 / RHYTHM 2 / MOTION 1.

Beranda memakai ilustrasi lanskap kandang sebagai titik fokus, lalu ringkasan sensor dan status perangkat. Foto lokal dari arsip Stitch dipakai sebagai pratinjau di kartu kamera dan halaman kontrol/kamera, tetap diberi status bahwa kamera belum terhubung. Pada ponsel, navigasi bawah tetap terlihat; pada layar lebar, hero membentang di area konten.

## Tokens

- Pine `#154212` dan Pine-soft `#2d5a27`: aksi utama dan navigasi.
- Paper `#faf9f4`, surface `#ffffff`, dan surface-low `#f5f4ef`: latar hangat dan kartu.
- Ink `#1b1c19`, moss `#42493e`, dan outline `#c2c9bb`: teks dan pemisah yang terbaca.
- Gold `#7e5700` dan pale gold `#ffdead`: aksen sekunder untuk pembacaan dan status penting.
- Water `#4b7d83`: aksen semantik untuk kontrol air.
- Typography: Plus Jakarta Sans dengan fallback system sans.
- Radius: kartu 16px, kontrol 10px, status chip membulat bila membantu pemindaian.
- Motion: transisi singkat untuk umpan balik klik; tanpa animasi loop.

## Product scope

- Front-end ini hanya untuk role pengguna. Halaman dan panel admin tidak termasuk.
- Login/pendaftaran adalah prototipe lokal: memakai hash PBKDF2 jika Web Crypto tersedia; tanpa Web Crypto, mode demo tidak memverifikasi kata sandi. Tombol pratinjau demo membuka aplikasi tanpa kredensial. Tidak untuk autentikasi produksi.
- Navigasi ponsel memakai tab bawah untuk Beranda, Monitoring, Kontrol, Kamera, Notifikasi, dan Profil. Layar lebar memakai sidebar.
- Monitoring menampilkan suhu, kelembapan, status pakan, valve air, dan lampu.
- Valve memiliki kontrol buka/tutup. Lampu menggunakan satu mode tetap: merah + warm white, tanpa pemilih warna.
- Musik klasik memiliki toggle dan input volume angka, tanpa slider.
- Kamera hanya menyediakan halaman live-view. YOLO, sensor berat/debit, dan riwayat tidak ditampilkan pada versi ini.
- Badge DEMO tunggal menandai fixture data pada semua halaman. Badge lain yang mengulang label demo tidak digunakan.

## Interaction decisions

- Toggle memakai nama kontrol tetap, `aria-pressed`, dan warna state yang tenang supaya keadaan aktif mudah dikenali.
- Notifikasi dapat ditandai satu per satu atau sekaligus. Profil pengguna dapat diedit dan disimpan ke state halaman.
- Nilai sensor berasal dari fixture untuk mencoba layout. Detail threshold, validasi, dan kontrak backend menunggu spesifikasi perangkat.
