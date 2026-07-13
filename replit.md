# Notion Clone

Aplikasi editor dokumen kolaboratif berbasis web, terinspirasi dari Notion. Dibangun dengan Next.js 16 (canary), Convex, Better Auth, dan BlockNote.

Lihat `README.md` untuk dokumentasi lengkap (fitur, skema database, API Convex, dll).

## Menjalankan proyek

- Workflow `Start application` menjalankan `npm run dev` (`next dev --turbopack -p 5000`).
- Backend Convex sudah terhubung ke deployment prod yang ada (`reminiscent-curlew-987`); env var terkait (`NEXT_PUBLIC_CONVEX_URL`, `CONVEX_SITE_URL`, `CONVEX_DEPLOYMENT`) sudah dikonfigurasi di `.replit` (`userenv.shared`), dan `CONVEX_DEPLOY_KEY` tersimpan sebagai secret.
- `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` juga sudah dikonfigurasi.
- File `convex/_generated/` (api, dataModel, server) di-generate dengan `npx convex codegen` — wajib dijalankan ulang setelah mengubah skema/fungsi Convex, atau jika folder ini terhapus (misalnya reclone/reimport proyek).

## Perubahan setup

- Menambahkan `allowedDevOrigins` di `next.config.ts` agar aset dev Next.js (chunk `_next/static`, HMR) tidak diblokir saat diakses lewat proxy Replit (`*.replit.dev`, dll).

## User preferences

- Proyek diimpor dari GitHub; user memilih untuk tidak melakukan restrukturisasi, hanya perbaikan dokumentasi (README) dan menjalankan aplikasi.
