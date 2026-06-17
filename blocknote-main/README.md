# Notion Clone

Aplikasi editor dokumen kolaboratif berbasis web, terinspirasi dari Notion. Dibangun dengan Next.js, Convex, Clerk, dan BlockNote.

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

- **Editor Rich Text** — Editor berbasis blok menggunakan BlockNote, mendukung slash commands, markdown shortcuts, dan heading/list/quote
- **Auto-save** — Konten tersimpan otomatis dengan debounce 500ms
- **Real-time Sync** — Perubahan tersinkronisasi secara langsung ke semua client melalui Convex
- **Manajemen Halaman** — Buat, rename, arsipkan, pulihkan, dan hapus permanen halaman
- **Sidebar Hierarki** — Navigasi dokumen dengan daftar halaman dan kotak masuk sampah (Trash)
- **Publikasi Halaman** — Toggle publish/unpublish untuk berbagi halaman secara publik
- **Autentikasi Aman** — Login, daftar, dan proteksi route menggunakan Clerk

---

## Tech Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 Canary | Framework fullstack (App Router + Turbopack) |
| [Convex](https://convex.dev/) | ^1.0 | Real-time database & serverless functions |
| [Clerk](https://clerk.com/) | ^6.0 | Autentikasi & manajemen pengguna |
| [BlockNote](https://blocknotejs.org/) | ^0.23 | Editor rich text berbasis blok |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.0 | Styling utility-first |
| [Lucide React](https://lucide.dev/) | ^0.400 | Icon set |
| [Sonner](https://sonner.emilkowal.ski/) | ^2.0 | Toast notifications |

---

## Struktur Proyek

```
notion-clone/
├── app/
│   ├── layout.tsx                  # Root layout — ClerkProvider + ConvexClientProvider
│   ├── page.tsx                    # Landing page (redirect ke /dashboard jika sudah login)
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard utama dengan Sidebar
│   ├── doc/
│   │   └── [id]/
│   │       └── page.tsx            # Halaman editor dokumen
│   └── (auth)/
│       ├── sign-in/[[...sign-in]]/ # Halaman sign-in (Clerk hosted)
│       └── sign-up/[[...sign-up]]/ # Halaman sign-up (Clerk hosted)
│
├── components/
│   ├── editor.tsx                  # Komponen editor BlockNote
│   ├── sidebar.tsx                 # Sidebar — daftar halaman & trash
│   └── navbar.tsx                  # Navbar dokumen — judul & tombol publish
│
├── convex/
│   ├── schema.ts                   # Definisi skema database
│   ├── pages.ts                    # Query & mutation untuk halaman
│   ├── blocks.ts                   # Query & mutation untuk konten blok
│   ├── auth.config.ts              # Konfigurasi JWT Clerk
│   └── _generated/                 # File yang di-generate otomatis oleh Convex
│       ├── api.ts
│       ├── dataModel.d.ts
│       └── server.ts
│
├── lib/
│   └── convex.tsx                  # ConvexClientProvider dengan integrasi Clerk
│
├── middleware.ts                   # Proteksi route dengan Clerk
├── next.config.ts                  # Konfigurasi Next.js
├── tailwind.config.ts              # Konfigurasi Tailwind CSS
└── package.json
```

---

## Skema Database

Database dikelola oleh Convex dan terdiri dari 3 tabel:

### `users`
| Field | Tipe | Keterangan |
|---|---|---|
| `clerkId` | `string` | ID unik dari Clerk |
| `name` | `string` | Nama pengguna |
| `email` | `string` | Alamat email |
| `imageUrl` | `string?` | URL foto profil (opsional) |

### `pages`
| Field | Tipe | Keterangan |
|---|---|---|
| `title` | `string` | Judul halaman |
| `userId` | `string` | ID pemilik (dari Clerk) |
| `isArchived` | `boolean` | Status arsip / trash |
| `isPublished` | `boolean` | Status publik |
| `parentDocument` | `Id<"pages">?` | ID halaman induk (hierarki) |
| `icon` | `string?` | Emoji ikon halaman |
| `coverImage` | `string?` | URL gambar sampul |

### `blocks`
| Field | Tipe | Keterangan |
|---|---|---|
| `pageId` | `Id<"pages">` | Referensi ke halaman |
| `content` | `any` | Konten BlockNote dalam format JSON |
| `position` | `number` | Urutan blok dalam halaman |

---

## Setup & Instalasi

### Prasyarat

- Node.js v22+
- pnpm
- Akun [Convex](https://dashboard.convex.dev/)
- Akun [Clerk](https://dashboard.clerk.com/)

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
- Mencetak `NEXT_PUBLIC_CONVEX_URL` yang dibutuhkan

**3. Setup Clerk**

Di [Clerk Dashboard](https://dashboard.clerk.com/):
1. Buat aplikasi baru
2. Buka **JWT Templates** → klik **New template** → pilih **Convex**
3. Salin **Issuer URL** untuk digunakan sebagai `CLERK_JWT_ISSUER_DOMAIN`
4. Buka **API Keys** untuk mendapatkan `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` dan `CLERK_SECRET_KEY`

---

## Konfigurasi Environment

Tambahkan variabel berikut ke **Replit Secrets** (atau file `.env.local` untuk development lokal):

| Key | Deskripsi | Cara Mendapatkan |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | URL deployment Convex | Output dari `npx convex dev --once` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | Clerk Dashboard → API Keys |
| `CLERK_JWT_ISSUER_DOMAIN` | Issuer URL dari JWT template Convex | Clerk Dashboard → JWT Templates → Convex |

---

## Menjalankan Aplikasi

```bash
# Development
pnpm dev

# Build production
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
                                    └─► Clerk menangani auth
                                            │
                                            └─► Redirect ke /dashboard
```

Semua route di `/dashboard` dan `/doc/[id]` dilindungi oleh `middleware.ts`. Setiap query dan mutation Convex memvalidasi identitas user melalui `ctx.auth.getUserIdentity()` di sisi server.

---

## API & Fungsi Convex

### `pages.ts`

| Fungsi | Tipe | Deskripsi |
|---|---|---|
| `list` | Query | Ambil semua halaman aktif milik user |
| `get` | Query | Ambil satu halaman berdasarkan ID |
| `getTrash` | Query | Ambil halaman yang sudah diarsipkan |
| `create` | Mutation | Buat halaman baru |
| `update` | Mutation | Update judul, ikon, atau cover halaman |
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

---

## Deployment

### Replit

1. Pastikan semua **Secrets** sudah diisi (lihat [Konfigurasi Environment](#konfigurasi-environment))
2. Klik tombol **Deploy** di Replit
3. Tambahkan domain produksi ke **Allowed Origins** di Clerk Dashboard

### DNS Clerk (Custom Domain)

Jika menggunakan custom domain, tambahkan CNAME record berikut di DNS provider:

| Name | Target |
|---|---|
| `accounts` | `accounts.clerk.services` |
| `clerk` | `frontend-api.clerk.services` |
| `clk._domainkey` | `dkim1.f1jwvqkswuk0.clerk.services` |
| `clk2._domainkey` | `dkim2.f1jwvqkswuk0.clerk.services` |
| `clkmail` | `mail.f1jwvqkswuk0.clerk.services` |

> Jika menggunakan Cloudflare, pastikan semua record di atas menggunakan mode **DNS only** (ikon awan abu-abu), bukan proxied.
