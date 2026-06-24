# Tailwind v4 Migration Rules — Wajib Diikuti

> Generated dari audit codebase. 8 aturan wajib untuk konsistensi Tailwind CSS v4 di project ini.

---

## Rule 1 — Satu `@import "tailwindcss"` di Globals

**Aturan:** `@import "tailwindcss"` hanya boleh ada **sekali**, di baris pertama `app/globals.css`. Tidak boleh ada di file lain.

**Why:** Tailwind v4 CSS-first config — seluruh konfigurasi terpusat di satu entry point. Duplicate import menyebabkan class conflict dan output CSS membengkak.

**How to apply:** Sebelum menambah file CSS baru, pastikan tidak ada `@import "tailwindcss"` di sana. Plugin/extension CSS harus di-`@import` SETELAH baris pertama ini, bukan sebelum.

```css
/* ✅ BENAR — app/globals.css line 1 */
@import "tailwindcss";

/* ❌ SALAH — jangan di file lain */
/* components/editor/editor.css */
@import "tailwindcss"; /* LARANGAN */
```

---

## Rule 2 — Semua Token Wajib Didaftarkan di `@theme`

**Aturan:** Setiap nilai yang dipakai berulang (warna, spasi, font, radius, animasi) HARUS didefinisikan sebagai token di blok `@theme inline` di `app/globals.css`. Tidak boleh hardcode langsung di class atau CSS property.

**Why:** Token di `@theme` otomatis menghasilkan utility class Tailwind (misal `--color-highlight` → `bg-highlight`, `text-highlight`). Nilai hardcode tidak bisa di-override, tidak dark-mode aware, dan menyebar jadi noise di codebase.

**How to apply:**
- Warna → `--color-*: value`
- Spasi custom → `--spacing-*: value`
- Font stack → `--font-sans: ...`, `--font-mono: ...`
- Radius → `--radius-*: value`
- Animasi → `--animate-*: keyframe duration easing`

```css
/* ✅ BENAR */
@theme inline {
  --color-highlight:    oklch(91% 0.12 84);
  --color-highlight-dk: oklch(42% 0.10 75 / 0.55);
  --font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ❌ SALAH — hardcode di CSS rule */
mark.comment-highlight {
  background-color: oklch(91% 0.12 84); /* tidak terdaftar di @theme */
}
```

---

## Rule 3 — Dark Mode via `@variant dark`, Bukan Selector `.dark { }`

**Aturan:** Dark mode CSS variables didefinisikan menggunakan `@variant dark { :root { ... } }` atau `@layer base { @variant dark { ... } }`, BUKAN lewat selector `.dark { ... }` gaya v3.

**Why:** Project sudah mendefinisikan `@variant dark (&:where(.dark, .dark *))` di line 3 globals.css. Blok `.dark { }` di line 61–111 adalah pola lama v3 yang bekerja secara kebetulan, tapi bisa menimbulkan specificity conflict dan tidak memanfaatkan cascade layer Tailwind v4.

**How to apply:**

```css
/* ✅ BENAR — v4 style */
@variant dark {
  :root {
    --background: #191919;
    --foreground: #e8e8e7;
  }
}

/* ❌ LAMA — v3 style yang masih ada di globals.css line 61 */
.dark {
  --background: #191919;
}
```

> **Exception:** `dark:` prefix di Tailwind classes (misal `dark:bg-input/30`) tetap VALID di v4 selama `@variant dark` sudah didefinisikan — ini bukan v3 pattern, ini Tailwind utility biasa.

---

## Rule 4 — Arbitrary Text Size Diganti Token `--text-*`

**Aturan:** Dilarang menggunakan `text-[Xpx]` untuk ukuran tipografi. Semua custom text size harus didefinisikan sebagai token `--text-*` di `@theme`.

**Why:** `text-[10px]` muncul 15+ kali di codebase. Tanpa token, perubahan skala tipografi harus edit puluhan file. Tailwind v4 mendukung `--text-xxs`, `--text-badge`, dll sebagai first-class token.

**How to apply:**
```css
/* app/globals.css — tambahkan ke @theme inline */
@theme inline {
  --text-xxs:   0.625rem; /* 10px */
  --text-xs2:   0.6875rem; /* 11px */
  --text-badge: 0.5625rem; /* 9px */
}
```
```tsx
/* ✅ BENAR */
<span className="text-xxs font-medium">...</span>

/* ❌ SALAH */
<span className="text-[10px] font-medium">...</span>
```

---

## Rule 5 — Radius Arbitrary `calc(var(--radius)-Xpx)` Diganti Token

**Aturan:** Dilarang menggunakan `rounded-[calc(var(--radius)-3px)]` atau `rounded-[calc(var(--radius)-5px)]`. Gunakan token `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` yang sudah ada di `@theme`.

**Why:** Token `--radius-sm` sampai `--radius-xl` sudah didefinisikan di globals.css line 165–168. Penggunaan `calc()` arbitrary di class adalah duplikasi yang menghindari sistem token yang sudah dibuat.

**How to apply:**
```tsx
/* ✅ BENAR */
<div className="rounded-sm">...</div>   /* --radius-sm = calc(var(--radius) - 4px) */
<div className="rounded-md">...</div>   /* --radius-md = calc(var(--radius) - 2px) */

/* ❌ SALAH */
<div className="rounded-[calc(var(--radius)-3px)]">...</div>
<div className="rounded-[calc(var(--radius)-5px)]">...</div>
```

---

## Rule 6 — Font Family via `@theme`, Bukan Raw `font-family` Property

**Aturan:** Font stack tidak boleh ditulis langsung di `body { font-family: ... }` atau inline style. Harus didefinisikan sebagai `--font-sans` dan `--font-mono` di `@theme`, lalu digunakan via class `font-sans` / `font-mono`.

**Why:** Tailwind v4 otomatis menghasilkan `font-sans` dan `font-mono` utility dari token `--font-*` di `@theme`. Raw `font-family` di CSS body tidak ter-compose dengan Tailwind utility chain dan tidak portable ke dark mode / responsive.

**How to apply:**
```css
/* ✅ BENAR — app/globals.css */
@theme inline {
  --font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
               "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Base reset boleh menggunakan token yang sudah ada */
html, body {
  font-family: var(--font-sans); /* referensikan token, jangan hardcode lagi */
}
```
```tsx
/* Dalam component */
<code className="font-mono text-sm">...</code>  /* ✅ */
/* style={{ fontFamily: 'sans-serif' }}          ❌ */
```

---

## Rule 7 — Hardcoded Warna CSS (`oklch`, `rgba`, `#hex`) Harus Lewat Token

**Aturan:** Semua nilai warna literal di CSS rules (di globals.css atau file CSS manapun) HARUS menjadi token `--color-*` di `@theme` terlebih dahulu, lalu direferensikan via `var(--color-*)`.

**Why:** Warna hardcode di CSS property (bukan Tailwind class) tidak bisa di-override oleh theme, tidak ter-compose dengan opacity modifier (`/50`), dan tidak terdeteksi oleh tooling Tailwind. Ini berlaku untuk `oklch(...)`, `rgba(...)`, dan `#hex` di dalam CSS rules.

**How to apply:**
```css
/* ✅ BENAR */
@theme inline {
  --color-comment-highlight:    oklch(91% 0.12 84);
  --color-comment-highlight-hv: oklch(84% 0.16 72);
  --color-selection-bg:         oklch(56% 0.18 240 / 0.14); /* ring color @ 14% */
}

mark.comment-highlight {
  background-color: var(--color-comment-highlight); /* ✅ */
}

.selectedCell:after {
  background: var(--color-selection-bg); /* ✅ */
}

/* ❌ SALAH — nilai literal langsung */
mark.comment-highlight {
  background-color: oklch(91% 0.12 84);        /* ❌ */
}
.selectedCell:after {
  background: rgba(35, 131, 226, 0.14);        /* ❌ */
}
```

---

## Rule 8 — Jangan Campur Tailwind Transform Utility + Inline `style={{ transform }}`

**Aturan:** Jika sebuah elemen sudah punya inline `style={{ transform: '...' }}`, **jangan** tambahkan Tailwind `translate-*`, `rotate-*`, atau `scale-*` di `className`. Pilih salah satu jalur saja.

**Why:** Di Tailwind **v3**, `translate-*` menghasilkan property `transform: translateX(...)` — sehingga inline style akan menimpanya dan hanya satu yang aktif. Di Tailwind **v4**, utility ini berubah menjadi CSS *individual transform property* terpisah:

| Utility | v3 output | v4 output |
|---------|-----------|-----------|
| `-translate-x-1/2` | `transform: translateX(-50%)` | `translate: -50% 0` |
| `rotate-45` | `transform: rotate(45deg)` | `rotate: 45deg` |
| `scale-95` | `transform: scale(0.95)` | `scale: 0.95` |

Karena `translate` dan `transform` adalah **CSS property berbeda**, keduanya aktif bersamaan. Contoh nyata yang sudah terjadi di project ini:

```tsx
/* ❌ SALAH — double-transform: offset = -50% - 50% = -100% → lari ke kiri */
<div
  className="left-1/2 -translate-x-1/2"
  style={{ transform: `translateX(-50%) scale(${open ? 0.92 : 1})` }}
/>

/* ✅ BENAR — hapus class, biarkan inline style saja yang handle */
<div
  className="left-1/2"
  style={{ transform: `translateX(-50%) scale(${open ? 0.92 : 1})` }}
/>

/* ✅ BENAR — atau pakai class saja tanpa inline style (untuk animasi statik) */
<div className="left-1/2 -translate-x-1/2" />
```

**How to apply:**
- Elemen dengan animasi JS (scale, spring, drag offset) → gunakan **inline style saja**, hapus Tailwind transform class.
- Elemen statis tanpa animasi JS → gunakan **Tailwind class saja**, tidak perlu inline style.
- Sebelum menambah `translate-*` ke elemen yang sudah ada `style={{ transform }}`, periksa dulu apakah inline style sudah ada.

---

## Referensi Cepat — Token @theme yang Sudah Ada

| Kategori | Token | Tailwind Class |
|----------|-------|----------------|
| Warna UI | `--color-background` … `--color-ring` | `bg-background`, `text-foreground`, dll |
| Sidebar | `--color-sidebar` … `--color-sidebar-ring` | `bg-sidebar`, `text-sidebar-foreground`, dll |
| Charts | `--color-chart-1` … `--color-chart-5` | `bg-chart-1`, `text-chart-2`, dll |
| Radius | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` | `rounded-sm`, `rounded-md`, dll |
| Animasi | `--animate-accordion-*`, `--animate-icon-spring-in`, `--animate-page-item-in` | `animate-accordion-down`, dll |
| Easing | `--ease-spring`, `--ease-snap` | `ease-spring`, `ease-snap` |
| Font | `--font-sans`, `--font-mono` | `font-sans`, `font-mono` |
| Tipografi kustom | `--text-xxs` (10px), `--text-xs2` (11px), `--text-badge` (9px) | `text-xxs`, `text-xs2`, `text-badge` |
| Komentar | `--color-comment-highlight`, `--color-comment-highlight-hover`, `--color-comment-highlight-dk` | `bg-comment-highlight`, dll |
| Seleksi tabel | `--color-selection-bg` | `bg-selection-bg` |

## Rule Ringkas — Cara Deteksi Double-Transform

Jalankan perintah ini sebelum PR review untuk cek konflik:

```bash
# Temukan elemen yang punya SEKALIGUS Tailwind translate/rotate/scale DAN inline style transform
grep -rn "translate-x-\|translate-y-\|-rotate-\|scale-x-\|scale-y-" \
  --include="*.tsx" components/ app/ | grep "className" \
  > /tmp/tw-transforms.txt

grep -rn "style={{" --include="*.tsx" components/ app/ \
  | grep "transform" >> /tmp/tw-transforms.txt

# File yang muncul di kedua hasil = kandidat konflik — periksa manual
```
