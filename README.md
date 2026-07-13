# Notion Clone

Aplikasi editor dokumen kolaboratif berbasis web, terinspirasi dari Notion. Dibangun dengan Next.js, Convex, Better Auth, dan BlockNote.

---

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Skema Database](#skema-database)
- [Setup & Instalasi](#setup--instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Alur Autentikasi](#alur-autentikasi)
- [API & Fungsi Convex](#api--fungsi-convex)
- [Deployment](#deployment)

---

## Fitur

- **Editor Rich Text** — Editor berbasis blok menggunakan BlockNote (TipTap), mendukung slash commands, markdown shortcuts, dan heading/list/quote
- **Auto-save** — Konten tersimpan otomatis dengan debounce
- **Real-time Sync** — Perubahan tersinkronisasi secara langsung ke semua client melalui Convex, termasuk sinkronisasi dokumen kolaboratif via `@convex-dev/prosemirror-sync`
- **Presence** — Menampilkan siapa saja yang sedang membuka halaman yang sama secara real-time
- **Komentar & Thread** — Diskusi berbasis thread pada konten dokumen, lengkap dengan reaksi emoji
- **Manajemen Halaman** — Buat, rename, arsipkan, pulihkan, dan hapus permanen halaman, dengan hierarki parent/child dan pengurutan kustom
- **Sidebar Hierarki** — Navigasi dokumen dengan daftar halaman dan kotak masuk sampah (Trash)
- **Publikasi Halaman** — Toggle publish/unpublish untuk berbagi halaman secara publik (`/p/[id]`)
- **Autentikasi Aman** — Login, daftar, dan proteksi route menggunakan Better Auth terintegrasi Convex
- **Profil Pengguna** — Nama, avatar (upload via Cloudinary), warna avatar, dan preferensi tema (light/dark/system)

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 Canary | Framework fullstack (App Router + Turbopack) |
| [Convex](https://convex.dev/) | ^1.0 | Real-time database & serverless functions |
| [Better Auth](https://www.better-auth.com/) | ^1.6 | Autentikasi & manajemen sesi, terintegrasi via `@convex-dev/better-auth` |
| [BlockNote](https://blocknotejs.org/) (TipTap) | ^0.23 / TipTap 3.27 | Editor rich text berbasis blok |
| [@convex-dev/prosemirror-sync](https://www.convex.dev/components/prosemirror-sync) | ^0.2 | Sinkronisasi real-time konten editor antar client |
| [Cloudinary](https://cloudinary.com/) | — | Upload & crop foto profil |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.0 | Styling utility-first (lihat `MIGRATION_RULES.md` untuk aturan wajib) |
| [Lucide React](https://lucide.dev/) | ^0.400 | Icon set |
| [Sonner](https://sonner.emilkowal.ski/) | ^2.0 | Toast notifications |

---

## Struktur Proyek

```
notion-clone/
├── app/
│   ├── layout.tsx                  # Root layout — ConvexClientProvider
│   ├── page.tsx                    # Landing page (redirect ke /dashboard jika sudah login)
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard utama dengan Sidebar
│   ├── doc/
│   │   └── [id]/
│   │       └── page.tsx            # Halaman editor dokumen
│   ├── p/
│   │   └── [id]/
│   │       └── page.tsx            # Halaman publik hasil publish
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/ # Halaman sign-in
│   │   └── sign-up/[[...sign-up]]/ # Halaman sign-up
│   └── api/auth/[...all]/route.ts  # Better Auth route handler
│
├── components/
│   ├── editor/                     # Komponen editor BlockNote + extensions
│   ├── comments/                   # UI thread & komentar
│   ├── sidebar/                    # Sidebar — daftar halaman & trash
│   └── ui/                         # Komponen UI dasar
│
├── convex/
│   ├── schema.ts                   # Definisi skema database
│   ├── pages.ts                    # Query & mutation untuk halaman
│   ├── blocks.ts                   # Query & mutation untuk konten blok
│   ├── comments.ts                 # Query & mutation untuk thread & komentar
│   ├── presence.ts                 # Query & mutation untuk presence real-time
│   ├── prosemirrorSync.ts          # Sinkronisasi konten editor
│   ├── users.ts                    # Query & mutation profil pengguna
│   ├── files.ts                    # Upload file ke Convex storage
│   ├── auth.ts                     # Konfigurasi Better Auth (server)
│   ├── auth.config.ts              # Konfigurasi provider auth untuk Convex
│   ├── http.ts                     # HTTP actions (termasuk route Better Auth)
│   └── _generated/                 # File yang di-generate otomatis oleh Convex
│
├── lib/
│   ├── convex.tsx                  # ConvexClientProvider
│   ├── auth-client.ts              # Better Auth client (browser)
│   ├── auth-server.ts              # Better Auth helper (server, Next.js)
│   ├── cloudinary.ts               # Helper upload Cloudinary
│   ├── image-crop.ts               # Utility crop gambar
│   ├── editor-context.tsx          # Context state editor
│   ├── sidebar-context.tsx         # Context state sidebar
│   └── theme.tsx                   # Provider tema light/dark/system
│
├── hooks/                          # Custom hooks (media query, pending state, dll)
├── proxy.ts                        # Proxy middleware (Next.js 16 canary)
├── next.config.ts                  # Konfigurasi Next.js
├── postcss.config.js               # Konfigurasi Tailwind v4 (PostCSS)
├── MIGRATION_RULES.md              # Aturan wajib Tailwind v4 di proyek ini
└── package.json
```

---

## Skema Database

Database dikelola oleh Convex dan terdiri dari 6 tabel:

### `pages`
| Field | Tipe | Keterangan |
|---|---|---|
| `title` | `string` | Judul halaman |
| `icon` | `string?` | Emoji ikon halaman |
| `coverImage` | `string?` | URL gambar sampul |
| `userId` | `string` | ID pemilik |
| `isArchived` | `boolean` | Status arsip / trash |
| `isPublished` | `boolean` | Status publik |
| `parentDocument` | `Id<"pages">?` | ID halaman induk (hierarki) |
| `order` | `number?` | Urutan kustom halaman di sidebar |

### `blocks`
| Field | Tipe | Keterangan |
|---|---|---|
| `pageId` | `Id<"pages">` | Referensi ke halaman |
| `content` | `any` | Konten BlockNote dalam format JSON |
| `position` | `number` | Urutan blok dalam halaman |

### `users`
| Field | Tipe | Keterangan |
|---|---|---|
| `userId` | `string` | ID pengguna (dari Better Auth) |
| `name` | `string` | Nama pengguna |
| `avatarUrl` | `string?` | URL foto profil (Cloudinary) |
| `avatarColor` | `string?` | Warna avatar fallback |
| `theme` | `"light" \| "dark" \| "system"?` | Preferensi tema |

### `threads`
| Field | Tipe | Keterangan |
|---|---|---|
| `pageId` | `Id<"pages">` | Halaman tempat thread berada |
| `resolved` | `boolean` | Status thread selesai/belum |
| `resolvedBy` | `string?` | User yang menyelesaikan thread |
| `resolvedUpdatedAt` | `number?` | Timestamp resolusi |
| `updatedAt` | `number` | Timestamp update terakhir |
| `metadata` | `any?` | Metadata tambahan (posisi anchor, dll) |

### `comments`
| Field | Tipe | Keterangan |
|---|---|---|
| `threadId` | `Id<"threads">` | Thread induk |
| `userId` | `string` | Penulis komentar |
| `body` | `any?` | Isi komentar |
| `updatedAt` | `number` | Timestamp update terakhir |
| `deletedAt` | `number?` | Timestamp soft-delete |
| `metadata` | `any?` | Metadata tambahan |
| `reactions` | `array` | Daftar reaksi emoji `{ emoji, createdAt, userId }` |

### `presence`
| Field | Tipe | Keterangan |
|---|---|---|
| `pageId` | `Id<"pages">` | Halaman yang sedang dibuka |
| `userId` | `string` | Pengguna |
| `sessionId` | `string` | ID sesi browser/tab |
| `userName` | `string` | Nama tampilan |
| `color` | `string` | Warna kursor/indikator |
| `from` / `to` | `number` | Rentang seleksi kursor di editor |
| `updatedAt` | `number` | Timestamp heartbeat terakhir |

---

## Setup & Instalasi

### Prasyarat

- Node.js v22+
- pnpm
- Akun [Convex](https://dashboard.convex.dev/)

### Langkah Instalasi

**1. Install dependensi**

```bash
pnpm install
```

**2. Setup Convex**

Login ke Convex CLI dan inisialisasi backend:

```bash
npx convex dev --once
```

Perintah ini akan:
- Membuat proyek baru di Convex dashboard
- Men-generate file di `convex/_generated/`
- Mencetak `NEXT_PUBLIC_CONVEX_URL` dan `CONVEX_SITE_URL` yang dibutuhkan

**3. Setup Better Auth**

Better Auth berjalan terintegrasi langsung dengan Convex (`@convex-dev/better-auth`), tidak memerlukan akun pihak ketiga terpisah. Yang perlu disiapkan:
- `BETTER_AUTH_SECRET` — string acak minimal 32 karakter (generate: `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` — URL publik aplikasi (dipakai sebagai `baseURL` dan untuk daftar `trustedOrigins`)

**4. (Opsional) Setup Cloudinary**

Untuk fitur upload foto profil, daftar gratis di [Cloudinary](https://cloudinary.com/), lalu buat *upload preset* dengan **Signing mode: Unsigned** agar bisa diunggah langsung dari browser.

---

## Konfigurasi Environment

Tambahkan variabel berikut ke **Replit Secrets** (atau file `.env.local` untuk development lokal) — lihat juga `.env.example`:

| Key | Deskripsi | Cara Mendapatkan |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | URL deployment Convex | Output dari `npx convex dev --once`, Convex dashboard → Settings |
| `CONVEX_SITE_URL` | URL HTTP actions Convex (akhiran `.site`) | Convex dashboard → Settings |
| `CONVEX_DEPLOY_KEY` | Deploy key untuk CI/CD | Convex dashboard → Settings → Deploy Keys |
| `BETTER_AUTH_SECRET` | Secret acak min. 32 karakter untuk sesi auth | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL publik aplikasi (tanpa trailing slash) | URL dev Replit / domain produksi |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary (opsional, untuk upload avatar) | Cloudinary dashboard |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Upload preset unsigned (opsional) | Cloudinary dashboard → Settings → Upload |

---

## Menjalankan Aplikasi

```bash
# Development
pnpm dev

# Build production (juga men-deploy Convex functions)
pnpm build

# Jalankan production build
pnpm start
```

Aplikasi berjalan di port **5000**.

---

## Alur Autentikasi

```
User membuka /
    │
    ├─ Sudah login? ──► Redirect ke /dashboard
    │
    └─ Belum login? ──► Tampilkan landing page
                            │
                            └─► /sign-in atau /sign-up
                                    │
                                    └─► Better Auth menangani auth
                                            │
                                            └─► Redirect ke /dashboard
```

Autentikasi ditangani oleh **Better Auth**, terintegrasi ke Convex melalui `@convex-dev/better-auth`:
- `convex/auth.ts` mendefinisikan konfigurasi Better Auth di sisi Convex (server)
- `lib/auth-client.ts` menyediakan client auth untuk komponen browser (`signIn`, `signUp`, `signOut`, `useSession`)
- `lib/auth-server.ts` menyediakan helper auth untuk Server Components/Route Handlers Next.js
- `app/api/auth/[...all]/route.ts` menangani request auth (sign-in, sign-up, sesi, dll)

Setiap query dan mutation Convex memvalidasi identitas user melalui `ctx.auth.getUserIdentity()` di sisi server.

---

## API & Fungsi Convex

### `pages.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| `list` | Query | Ambil semua halaman aktif milik user |
| `get` | Query | Ambil satu halaman berdasarkan ID (juga dipakai untuk halaman publik) |
| `getTrash` | Query | Ambil halaman yang sudah diarsipkan |
| `create` | Mutation | Buat halaman baru |
| `update` | Mutation | Update judul, ikon, cover, atau urutan halaman |
| `archive` | Mutation | Arsipkan halaman ke trash |
| `restore` | Mutation | Pulihkan halaman dari trash |
| `remove` | Mutation | Hapus halaman secara permanen |
| `publish` | Mutation | Jadikan halaman publik |
| `unpublish` | Mutation | Kembalikan halaman ke privat |

### `blocks.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| `list` | Query | Ambil semua blok konten untuk satu halaman |
| `upsert` | Mutation | Simpan atau perbarui konten blok (dipakai auto-save) |
| `update` | Mutation | Update blok berdasarkan ID |

### `comments.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| `listForPage` | Query | Ambil semua thread & komentar untuk satu halaman |
| `getUsersByIds` | Query | Ambil profil pengguna terkait untuk ditampilkan di UI komentar |

### `presence.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| — | Query/Mutation | Heartbeat & query siapa saja yang sedang aktif di suatu halaman |

### `users.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| — | Query/Mutation | Ambil & update profil pengguna (nama, avatar, warna, tema) |

### `files.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| `generateUploadUrl` | Mutation | Generate URL upload sementara ke Convex storage |
| `getStorageUrl` | Mutation | Ambil URL publik dari file yang tersimpan |

---

## Deployment

### Replit

1. Pastikan semua **Secrets** sudah diisi (lihat [Konfigurasi Environment](#konfigurasi-environment))
2. Klik tombol **Deploy** di Replit
3. Perbarui `NEXT_PUBLIC_APP_URL` ke domain produksi setelah deploy pertama
