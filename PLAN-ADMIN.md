# Rencana Frontend Role Admin

Status: **P0 selesai diimplementasikan** (7 halaman + redesign modern + dark mode).
Branch kerja: `dalfa` (terpisah dari `main`).
Basis: frontend role **pengguna** yang sudah ada di `index.html` + `src/`.

## Aturan kerja (WAJIB)

Frontend role pengguna **tidak boleh diubah**. File berikut bersifat read-only:

- `index.html`
- `src/main.mjs`
- `src/state.mjs`
- `src/styles.css`
- `tests/state.test.mjs`

Semua pekerjaan admin masuk ke file baru. Dengan begitu `node --test tests/state.test.mjs` tetap 100% hijau.

## Struktur file

```
index.html                  (pengguna, tidak diubah)
src/main.mjs                (pengguna, tidak diubah)
src/state.mjs               (pengguna, tidak diubah)
src/styles.css              (pengguna, tidak diubah)

admin.html                  BARU  entry point admin
src/admin/main.mjs          BARU  router + renderer admin
src/admin/state.mjs         BARU  state admin (terpisah penuh dari state pengguna)
src/admin/styles.css        BARU  design system admin (mandiri)
tests/admin.test.mjs        BARU  test state admin
PLAN-ADMIN.md               BARU  dokumen ini
```

Catatan penting: `admin.html` **tidak** meng-*link* `src/styles.css` milik pengguna.
Panel admin punya design system mandiri (token, komponen, dark mode) agar bebas
di-redesign tanpa menyentuh file pengguna. Palet tetap satu keluarga (hijau pinus +
aksen tembaga) supaya masih terasa satu produk.

Konsekuensi yang perlu diingat: kalau palet pengguna berubah, token admin **tidak**
ikut otomatis. Kalau ini jadi masalah, langkah berikutnya adalah mengekstrak token
bersama ke `src/tokens.css` yang di-link kedua panel.

## Inventaris fitur role pengguna (baseline)

| Halaman | Route | Fitur |
|---|---|---|
| Ringkasan | `#/home` | Counter 12 ekor, kartu suhu & kelembapan, 4 baris perangkat (air/pakan/lampu/musik) + badge status, ringkasan kamera, ringkasan aktivitas, alert "Pakan habis" |
| Monitoring | `#/monitor` | 5 kartu sensor (suhu, kelembapan, status pakan, debit air, perubahan berat), 2 grafik tren 30 menit, tombol uji skenario pakan |
| Kontrol IoT | `#/controls` | Toggle valve air (+debit 0.7 L/menit), toggle lampu + radio merah/warm white, toggle musik klasik |
| Kamera & YOLO | `#/camera` | Placeholder viewfinder, status model, daftar deteksi (kelas/confidence/status trigger), "Catat trigger", "Tambah deteksi" |
| Telur & berat | `#/eggs` | Pembacaan berat +58 g, catatan indikasi telur, "Tambah indikasi" |
| Riwayat | `#/history` | Log aktivitas + filter Semua/Sensor/Kontrol/Kamera/Berat |

Infrastruktur lintas halaman: hash routing + `normalizePage()` fallback, toast + `aria-live`,
pengembalian fokus setelah re-render, state preview `?preview=loading|error`,
sidebar desktop → drawer mobile, `aria-pressed` pada semua toggle, `prefers-reduced-motion`,
`resetDemo()`.

Yang **tidak ada** di pengguna (menjadi wilayah admin): login/role, manajemen user,
manajemen kandang & perangkat, konfigurasi threshold/otomasi, manajemen kamera & model,
kalibrasi sensor, notifikasi, laporan.

## Prinsip desain admin

Admin adalah **produsen konfigurasi**, pengguna adalah **konsumen**. Setiap halaman admin
harus punya jejak di halaman pengguna. Catatan kosong di frontend pengguna adalah slot
yang memang menunggu diisi admin:

| Catatan di frontend pengguna | Kebutuhan admin |
|---|---|
| "Aturan otomatis belum ditetapkan" (valve air) | Konfigurasi threshold + otomasi |
| "Satuan dan ambang mengikuti konfigurasi" (sensor berat) | Kalibrasi sensor berat |
| "Model belum tersambung" (YOLO) | Manajemen kamera + model |
| "Warna yang dicatat di brief: merah dan warm white" | Master pilihan aktuator |
| "12 ekor" dari brief | Master data kandang & populasi |

## Peta halaman admin

### P0 — selesai diimplementasikan

1. **Gerbang Role** — layar split-screen pilih masuk sebagai Admin atau Pengguna.
2. **Dashboard** (`#/dashboard`) — 4 KPI dengan sparkline, donut kesehatan perangkat,
   kartu kandang dengan meter, status perangkat, alert terbuka, timeline + ringkasan audit.
3. **Pengguna** (`#/users`) — tabel + pencarian live + filter peran, modal tambah/ubah,
   aktif/nonaktifkan, validasi email & duplikat.
4. **Kandang & perangkat** (`#/coops`) — kartu kandang, tabel perangkat, filter kandang,
   sambungkan/putuskan.
5. **Aturan & otomasi** (`#/rules`) — 7 kartu: ambang suhu, kelembapan, notifikasi pakan,
   otomasi valve, jadwal lampu (+warna), jadwal musik, ambang indikasi telur.
   Kartu nonaktif otomatis di-dim dan dibuat `inert`.
6. **Kamera & model** (`#/cameras`) — tabel kamera, aktif/nonaktif.
7. **Log aktivitas** (`#/logs`) — timeline jejak perubahan admin.
8. **Pengaturan** (`#/settings`) — profil admin, status sistem, toggle tema, reset data.

Tambahan lintas halaman: **dark mode** (toggle di topbar + Pengaturan), sidebar rail
bergrup, breadcrumb, toast, modal dengan backdrop blur, `prefers-reduced-motion`.

### P1 — belum dikerjakan

- Kalibrasi sensor berat (titik kalibrasi, satuan, ambang)
- Notifikasi & alert rules (channel, penerima, jam tenang)
- Laporan & ekspor CSV
- Preview stream kamera dan unggah model YOLO

### P2 — opsional

- Audit trail detail per-entitas
- Toggle mode demo ↔ live (butuh backend)

## Pola teknis yang dipakai ulang dari pengguna

- Router hash sederhana: `normalizeAdminPage()` dengan fallback ke `dashboard`.
- Renderer per halaman dalam objek `renderers`, dipanggil ulang penuh setelah aksi.
- State immutable: setiap aksi mengembalikan objek baru (`{ ...state, ... }`).
- Validasi input di layer state dan **melempar error** untuk nilai tak dikenal, sama seperti
  `toggleControl`/`setLightColor` di `src/state.mjs`.
- Semua aksi admin tercatat ke `state.auditLog` (padanan `events` di pengguna) dan ditandai
  `simulated: true` selama belum ada backend.
- Toast + `liveAnnouncer` untuk umpan balik, fokus dikembalikan lewat `data-focus-key`.
- `aria-pressed` pada toggle, `aria-current="page"` pada nav aktif.

## Komponen CSS baru yang dibutuhkan

Hanya yang belum ada di `src/styles.css`:

- `.data-table` — tabel data admin (header, zebra, aksi baris)
- `.form-grid`, `.field`, `.field-label`, `.field-hint`, `.field-error` — form konfigurasi
- `.role-badge` — badge role (admin/pengguna) di topbar
- `.stat-tile` — kartu angka dashboard (total kandang, perangkat online, dll.)
- `.modal`, `.modal-card` — dialog tambah/edit
- `.switch-row` — baris toggle di halaman aturan
- `.pill-online`, `.pill-offline` — status perangkat

Semua memakai variabel yang sudah ada (`--pine`, `--paper`, `--copper`, `--water`,
`--radius-card`, `--radius-control`) agar konsisten otomatis.

## Urutan pengerjaan yang disarankan

1. `admin.html` + `src/admin/styles.css` + `src/admin/state.mjs` (fixture) + `tests/admin.test.mjs`
2. Dashboard Admin + shell sidebar/topbar
3. Manajemen Pengguna (tabel + modal)
4. Manajemen Kandang & Perangkat
5. Threshold & Otomasi
6. P1: Kamera, Kalibrasi, Log, Notifikasi, Laporan

## Verifikasi tiap tahap

```
node --test tests/state.test.mjs tests/admin.test.mjs
python -m http.server 4173 --bind 127.0.0.1
```

- Panel pengguna: `http://127.0.0.1:4173/`
- Panel admin: `http://127.0.0.1:4173/admin.html`

Catatan: proyek ini belum punya `package.json`, jadi tidak ada perintah test kanonik.
Jalankan `node --test` dengan path file eksplisit seperti di atas.

Saat mengubah `src/admin/styles.css` atau `src/admin/main.mjs`, naikkan query `?v=`
di `admin.html` agar browser tidak memakai cache lama.
