# Macanria CMS — Dokumentasi Teknis

Dokumen ini menjelaskan arsitektur, fitur, cara kerja, dan panduan operasional CMS
(Content Management System) untuk website Macanria (homemade soy milk tea & tofu ice
cream, Jakarta).

Terakhir diperbarui: mengikuti penyelesaian Phase 3b (pemisahan konten dari kode).

---

## 1. Ringkasan

Tujuan utama proyek: **memisahkan konten dari kode** (separation of content from code).
Sebelumnya seluruh teks, harga, daftar produk, foto, dan tautan ditulis langsung
(hardcoded) di dalam `index.html`. Sekarang konten disimpan terpisah dan diambil oleh
website saat dimuat, serta dapat diedit lewat panel admin tanpa menyentuh kode, CSS,
atau animasi.

Prinsip desain:

- **Konten terpisah dari kode.** Website membaca konten dari penyimpanan via API.
- **Panel admin hanya membaca/menulis konten** melalui API-nya sendiri; tidak menyentuh
  `index.html`, CSS, engine parallax, atau konfigurasi server.
- **Portabel antar lingkungan.** Kode sama untuk lokal, Vercel, dan VPS; yang berbeda
  hanya adapter penyimpanan (dipilih otomatis berdasarkan environment variable).
- **Validasi ketat di sisi server.** Setiap penyimpanan divalidasi terhadap skema resmi;
  field asing ditolak.
- **Aman.** Password dicek di server (hash), rate-limiting pada login, pembatasan tipe
  file upload, cookie sesi httpOnly.

## 2. Cakupan CMS

Section yang dapat diedit lewat CMS (7):

- **menu** — kategori (Soymilk Tea, Pure Tea, Fruit Tea) dan produk (nama, mandarin,
  deskripsi, harga, badge).
- **scoops** — Tofu Ice Cream: intro, harga, daftar rasa, daftar topping.
- **story** — Our Story: judul, body, dua maskot (Macan & Tutu).
- **senses** — Five Senses: lima entri (Sight, Smell, Sound, Touch, Taste).
- **gallery** — ticker teks dan delapan foto.
- **locations** — daftar outlet (flagship, region, nama, area, alamat, jam, maps).
- **footer** — teks, deskripsi, tiga kolom tautan, tautan sosial, copyright.

Di luar cakupan CMS (tetap hardcoded, sesuai kesepakatan):

- **general** — hero, marquee, scene parallax, featured cards, dan lineup. Ini adalah
  aset desain/animasi (engine parallax 3D) yang sengaja dipertahankan di dalam HTML dan
  tidak dikelola lewat CMS.

---

## 3. Arsitektur

Backend memakai pendekatan Clean/Hexagonal Architecture (ports & adapters) agar
logika bisnis terpisah dari detail teknis (penyimpanan, framework, HTTP), sehingga mudah
dipindah antar lingkungan dan diuji.

Lapisan:

- domain / application — use case murni (getSection, updateSection, login,
  uploadImage) yang tidak tahu apakah data disimpan di file, KV, atau Supabase.
- ports — antarmuka (kontrak) seperti ContentRepository, ImageStorage, RateLimiter,
  SessionManager, PasswordHasher.
- adapters — implementasi konkret dari port:
  - Persistence: FileContentRepository (lokal/VPS), KvContentRepository (Vercel KV).
  - Storage: LocalImageStorage (lokal/VPS), BlobImageStorage (Vercel Blob).
  - Security: MemoryRateLimiter (lokal), KvRateLimiter (Vercel), JwtSessionManager,
    passwordHasher.
- main — container.js (dependency injection / pemilihan adapter) dan httpAdapter.js
  (helper HTTP: cookie sesi, requireLogin, dsb).

### Struktur folder (ringkas)

    macanria/
      content.json                 <- data konten (FileContentRepository lokal)
      frontend/
        index.html                 <- website (shell; konten diisi content-render.js)
        content-render.js          <- pengambil & penyuntik konten dari /api/content
        admin/
          index.html               <- dashboard CMS (sidebar 7 section)
          admin.js                 <- editor form (1:1 dengan skema)
          admin.css, login.html
        assets/                    <- gambar desain (logo, cup, ic-*, photo-*)
        uploads/                   <- hasil upload gambar via CMS (lokal)
      backend/
        dev-server.cjs             <- server lokal (static + /api/*)
        cms/
          application/usecases/    <- getSection, updateSection, login, uploadImage
          adapters/persistence/    <- FileContentRepository, KvContentRepository
          adapters/storage/        <- LocalImageStorage, BlobImageStorage
          adapters/security/       <- MemoryRateLimiter, KvRateLimiter, JwtSessionManager
          schemas/                 <- skema resmi per section (validasi ketat)
          main/                    <- container.js, httpAdapter.js

## 4. Alur Data

Membaca (menampilkan website):

1. Pengunjung membuka index.html.
2. content-render.js memanggil GET /api/content.
3. Server mengembalikan seluruh konten (7 section) dari repository aktif.
4. Script menyuntikkan konten ke elemen-elemen shell di HTML.

Menulis (mengedit via CMS):

1. Admin login di /admin/login.html (password dicek di server).
2. Dashboard memuat konten via GET /api/content.
3. Admin mengedit satu section, menekan Simpan.
4. PUT /api/content/<section> mengirim payload; server memvalidasi terhadap skema.
5. Jika valid -> disimpan; jika ada field asing / melanggar batas -> ditolak (HTTP 422).

---

## 5. Skema Data (Validasi Ketat)

Setiap section punya skema resmi di server. Aturan umum:

- additionalProperties: false — field yang tidak dikenal ditolak.
- Semua field wajib (required) sesuai definisi.
- Ada batas panjang string (maxLength) dan batas jumlah item array (min/max).
- Beberapa field memakai enum (nilai terbatas).

Pelanggaran apa pun menyebabkan penyimpanan ditolak dengan HTTP 422.

### menu

Struktur: categories berisi tiga kategori tetap (soymilk, pure, fruit). Tiap kategori:

    label   : string (maks 40)
    zh       : string (maks 20)   -> nama Mandarin
    note     : string (maks 160)
    items    : array 1..30 produk

Tiap produk (item):

    name   : string (maks 60)
    zh      : string (maks 30)
    desc    : string (maks 200)
    price   : string (maks 20)
    badge   : enum ["", "Bestseller", "Recommended", "Signature"]

### scoops (Tofu Ice Cream)

    intro     : string (maks 400)
    price     : string (maks 60)
    flavours  : array 1..20 rasa
    toppings  : array 0..12 (tiap item string maks 40)

Tiap rasa (flavour):

    name   : string (maks 60)
    zh      : string (maks 30)
    desc    : string (maks 200)
    img     : string (maks 200)   -> path gambar

### story

    title    : string (maks 120)
    body     : string (maks 600)
    mascots  : array tepat 2 (Macan & Tutu)

Tiap maskot (mascot):

    zh        : string (maks 20)
    name      : string (maks 60)
    tagline   : string (maks 60)
    desc      : string (maks 200)
    img       : string (maks 200)

### senses

    title  : string (maks 120)
    items  : array tepat 5

Tiap entri (sense):

    key    : enum ["Sight", "Smell", "Sound", "Touch", "Taste"]
    text   : string (maks 300)

### gallery

    ticker  : string (maks 300)
    photos  : array tepat 8

Tiap foto (photo):

    img     : string (maks 200)
    layout  : string (maks 40)   -> mis. "span2c span2r" untuk sel besar

### locations

    outlets : array 1..40

Tiap outlet:

    flagship : boolean          -> true menampilkan badge Flagship
    region   : string (maks 40)
    name     : string (maks 80)
    area     : string (maks 80)
    address  : string (maks 200)
    hours    : string (maks 120)
    maps     : string (maks 300)  -> URL Google Maps

### footer

    title       : string (maks 40)
    subtext     : string (maks 60)
    description : string (maks 300)
    menuLinks   : array 0..8 link
    orderLinks  : array 0..8 link
    infoLinks   : array 0..8 link
    social      : array 0..8 link
    copyright   : string (maks 160)

Tiap link:

    label : string (maks 40)
    href  : string (maks 300)

---

## 6. Keamanan

- Autentikasi server-side. Password TIDAK dicek di JavaScript sisi klien. Login mengirim
  password ke server; server membandingkannya dengan hash (bcrypt) yang disimpan sebagai
  environment variable (ADMIN_PASSWORD_HASH). Hash tidak pernah di-commit ke repo.
- Sesi. Setelah login berhasil, server mengeluarkan cookie sesi (mcms_session) yang
  bersifat httpOnly, SameSite=Lax, Path=/, dan Secure (di HTTPS). Masa berlaku 8 jam.
- Rate limiting login. Percobaan login dibatasi (default 5 percobaan per 5 menit).
  Lokal memakai MemoryRateLimiter; Vercel memakai KvRateLimiter.
- Validasi skema. Semua penulisan konten divalidasi di server. Field asing ditolak
  (HTTP 422), mencegah injeksi data di luar struktur yang diizinkan.
- Upload gambar dibatasi tipe gambar (jpg/png/webp). Lokal ke frontend/uploads/;
  Vercel ke Blob storage.
- Rahasia via environment variable. SESSION_SECRET dan ADMIN_PASSWORD_HASH diset lewat
  env (.env.local di lokal, Environment Variables di Vercel). File .env.local dilindungi
  .gitignore dan tidak di-commit.

PENTING (produksi): kredensial/secret yang dipakai selama pengembangan bersifat dummy dan
dianggap SUDAH BOCOR. Sebelum go-live WAJIB dibuat ulang: SESSION_SECRET baru dan
ADMIN_PASSWORD_HASH baru dari password kuat. Jangan pakai password pengembangan.

---

## 7. Portabilitas & Pemilihan Adapter

Kode inti sama untuk semua lingkungan. Perbedaan hanya pada adapter penyimpanan, dipilih
otomatis di container.js berdasarkan environment variable KV_REST_API_URL:

- Jika KV_REST_API_URL ada (lingkungan Vercel):
    - Konten: KvContentRepository (Vercel KV)
    - Rate limit: KvRateLimiter
    - Gambar: BlobImageStorage (Vercel Blob)
  Paket @vercel/* di-import secara lazy (dynamic import) hanya di cabang ini, sehingga
  tidak pernah dimuat di lokal/VPS (mencegah error "missing env vars").
- Jika tidak ada (lokal / VPS):
    - Konten: FileContentRepository (membaca/menulis content.json)
    - Rate limit: MemoryRateLimiter (in-memory)
    - Gambar: LocalImageStorage (menyimpan ke frontend/uploads/)

Rencana Supabase: cukup menambah adapter baru (mis. SupabaseContentRepository) yang
memenuhi port ContentRepository, lalu memilihnya di container.js. Tidak perlu mengubah
use case atau frontend.

Prinsip yang dipegang selama pengembangan: buat jalan dulu di lokal, baru penyesuaian
untuk Vercel. Semua adapter lokal (File, Memory, Local storage) dibuat agar CMS bisa
berjalan penuh tanpa layanan cloud.

---

## 8. Phase 3b — Pemisahan Konten dari HTML

Sebelumnya index.html berisi konten hardcoded untuk 7 section, padahal content-render.js
juga mengisi konten yang sama dari API. Akibatnya konten dobel (bisa berkedip / tidak
konsisten). Phase 3b membersihkan konten hardcoded, menyisakan "shell" (kerangka) yang
diisi sepenuhnya oleh CMS.

content-render.js bekerja dengan dua pola:

- Pola A (rebuild) untuk daftar/kartu: JS menghapus isi container lalu membangun ulang.
  Berlaku untuk: menu (.mgrid), scoops (#scoop-grid, #topping-chips), gallery (.gal-grid,
  .gal-note), locations (.lgrid), footer (ul tiap .f-col dan .f-soc). Container ini
  dikosongkan di HTML; JS mengisinya.
- Pola B (isi teks) untuk story & senses: JS hanya mengisi textContent ke elemen yang
  sudah ada (.story-body, .mcard-*, .sense-name, .sense-desc). Elemen ini WAJIB tetap ada
  di HTML; hanya teks default-nya yang dikosongkan.

Elemen yang di-textContent (bukan rebuild) juga dipertahankan: #scoop-zh/name/desc,
.scoop-price, .menu-note, .f-cjk/.f-tag/.f-copy. Judul kolom footer (h4) dan angka
.sense-num dipertahankan sebagai elemen desain.

Perbaikan data gambar: field img di content.json sempat berisi placeholder. Dikembalikan
ke aset asli: scoops -> assets/ic-*.png, mascots -> assets/macan-front.png &
assets/tutu-front.png, gallery -> assets/photo-*.jpg. Hasil render kini identik dengan
versi lama.

Yang TIDAK disentuh: hero, marquee, scene parallax, featured cards, lineup (general),
serta engine parallax 3D (script inline di index.html), CSS, font, warna, dan urutan
section.

## 9. API Endpoints

- GET /api/content
  Mengembalikan seluruh konten (7 section). Dipakai website dan dashboard.
- PUT /api/content/<section>
  Menyimpan satu section (memerlukan sesi login). Payload divalidasi terhadap skema.
  Balasan: 200 { ok:true, savedAt, section } bila valid; 422 dengan pesan bila field
  asing / melanggar batas; 401 bila belum login.
- POST /api/auth/login
  Body berisi password. Server memverifikasi terhadap hash, menerapkan rate limit, dan
  bila cocok mengeluarkan cookie sesi.
- POST /api/upload
  Mengunggah gambar (tipe dibatasi). Mengembalikan URL/path gambar yang tersimpan.

## 10. Menjalankan Secara Lokal

1. Pastikan .env.local berisi SESSION_SECRET dan ADMIN_PASSWORD_HASH (nilai dummy untuk
   pengembangan). Tanpa KV_REST_API_URL agar memilih adapter lokal.
2. Jalankan dev-server (backend/dev-server.cjs). Server menyajikan frontend/ sebagai
   static dan meng-handle /api/*.
3. Buka http://localhost:3001/ untuk website, http://localhost:3001/admin/ untuk CMS.
4. Setelah mengubah file backend/api/lib, RESTART dev-server (modul di-cache). File
   frontend (index.html, content-render.js, admin.js) cukup di-refresh browser.

## 11. Panduan Deploy (Vercel)

Bagian ini dilakukan oleh pemilik (bukan otomatis), karena menyangkut kredensial:

1. Generate SESSION_SECRET baru (acak, panjang) dan ADMIN_PASSWORD_HASH baru (bcrypt dari
   password kuat). Jangan pakai nilai pengembangan.
2. Set Environment Variables di Vercel: SESSION_SECRET, ADMIN_PASSWORD_HASH,
   KV_REST_API_URL, KV_REST_API_TOKEN (untuk KV), serta token Blob bila diperlukan.
3. Siapkan penyimpanan KV & Blob di Vercel.
4. Jalankan proses seed untuk mengisi konten awal ke KV (dari content.json).
5. Push ke GitHub; Vercel auto-deploy. (Koneksi Vercel diatur lewat GitHub, tidak manual.)

## 12. Pemeliharaan & Backup

Selama Phase 3b dibuat backup bertahap index.html: .bak, .bak-menu, .bak-scoops,
.bak-story, .bak-senses, .bak-gallery, .bak-locfoot, .bak-scoopintro. Backup content.json:
.bak-img. File backup lain: httpAdapter.js.bak, container.js.bak2, admin.js.bak.

Untuk mengubah konten: gunakan CMS (bukan mengedit HTML). Untuk menambah section baru ke
CMS: buat skema di schemas/, tambahkan renderer di content-render.js dan editor di
admin.js, serta navlink di admin/index.html. Untuk pindah penyimpanan: tambah adapter yang
memenuhi port terkait, pilih di container.js.
