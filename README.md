# Hawa Weather

> Glassmorphism weather instrument · Live di **https://hawa-weather.vercel.app** · Data [Open-Meteo](https://open-meteo.com) · Style [designmd.app/library/hawa-weather](https://designmd.app/library/hawa-weather)

![HAWA preview](public/preview.png)

Aplikasi cuaca single-page yang terinspirasi konsep **Hawa Weather** (glass · blur · glow · drift). Cari kota, lihat kondisi sekarang dengan orb bercahaya yang adaptif, hourly 12 jam, AQI, forecast 7 hari, sunrise/sunset, share link langsung. Mobile-first, no API key, cache 5 menit.

---

## ✨ Fitur

- **Search kota** — autocomplete via `GET /api/geocode`, debounce 300 ms, chip preset Jakarta / Yogyakarta / Bandung / Surabaya / Bali
- **Cuaca sekarang** — suhu, terasa (apparent), lembap, angin, WMO code + icon, siang/malam, orb gradient yang berubah sesuai kondisi
- **Per jam 12 jam** — scroll horizontal snap, card 68 px (76 px desktop)
- **Kualitas udara** — US AQI + progress bar via Open-Meteo Air Quality
- **7 hari** — max/min, icon WMO, label, sunrise/sunset hari ini
- **Share** — `?lat&lon&name` → tautan langsung lokasi (copy via clipboard)
- **GPS** — tombol 📍 Saya (pakai `navigator.geolocation`)
- **°C / °F** — toggle tanpa reload

## 📱 Mobile optimization

Di layar kecil sebelumnya butuh zoom out — sekarang fix:

- `viewport: width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover`
- `html,body { overflow-x:hidden; max-width:100% }` + `* { min-width:0 }` agar flex/grid tidak overflow
- Root font `15 → 14px ≤768px → 13px ≤380px`
- Orb `96 (320) / 112 (380) / 200px desktop` — sebelumnya 220 px makan 60% lebar
- Container `px-3 py-3`, hourly `min-w 68px` + `scrollbar-none snap-x`, gap rapat
- Input `text-[15px]` di mobile agar iOS tidak auto-zoom
- Verifikasi: `W=320 scrollOverflow=0 font=13px orb=96` — fit tanpa horizontal scroll

## 🛠️ Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** (`@import "tailwindcss"`)
- **Open-Meteo** — forecast, geocoding, air-quality (tanpa API key, proxy via route handler)
- **Vercel** (prod) + **Cloudflare Pages** via `@opennextjs/cloudflare` (opsional)

## 🔌 API

| Route | Upstream | Cache |
|---|---|---|
| `GET /api/geocode?q=Yogyakarta` | `https://geocoding-api.open-meteo.com/v1/search` | `s-maxage=300` |
| `GET /api/weather?lat=-7.8&lon=110.36` | `https://api.open-meteo.com/v1/forecast` + `https://air-quality-api.open-meteo.com/v1/air-quality` | `s-maxage=300` |

Payload weather: `current` (temperature_2m, apparent_temperature, relative_humidity_2m, wind_speed_10m, weather_code, is_day) + `hourly` (12) + `daily` (7, sunrise/sunset) + `aqi` (US AQI).

## 🎨 Design — TEMPER

Lihat `DESIGN.md` untuk spec lengkap.

- Token: `--ink:#DCE3F2 --dim:#7C87A6 --glow:#9FD8FF --panel:rgba(22,26,40,.72) --hair:rgba(180,195,235,.16) --bg:#070A14/#1A2238/#141B2E`
- Teknik: `backdrop-filter: blur(16px)`, `border: rgba`, `box-shadow` glow + inset, gradient radial orb, animasi `drift 14s` + `pulse 3s`
- Font: `system-ui` sans + `Courier New` monospace untuk `.label` uppercase tracking

## 🚀 Local dev

```bash
bun install        # atau npm install / pnpm install
bun dev            # http://localhost:3000
bun run build      # production build (6 routes: / + /_not-found + 2× api)
```

Env: tidak perlu — Open-Meteo tanpa key. Jika butuh override base URL, set di `src/app/api/*/route.ts`.

## ☁️ Deploy

### Vercel (aktif)

```bash
vercel --prod      # sudah live di https://hawa-weather.vercel.app
```

`next.config.ts` tanpa adapter. SSO Protection dimatikan (`ssoProtection: null`) agar `*.vercel.app` public.

### Cloudflare Pages (opsional)

```bash
bun run deploy     # opennextjs-cloudflare build && deploy
# atau
bun run preview    # preview lokal worker
```

Butuh `wrangler.jsonc` + `open-next.config.ts` (sudah ada). Lihat `.vercel/project.json` untuk binding Cloudflare bila dipakai.

## 📁 Struktur

```
src/
  app/
    layout.tsx          # metadata + viewport (device-width, max-scale 5)
    globals.css         # TEMPER tokens, orb, glass, responsive font
    page.tsx            # client page — search, preset, orb, hourly, AQI, daily
    api/
      geocode/route.ts  # proxy Open-Meteo geocoding
      weather/route.ts  # proxy forecast + air-quality
  lib/
    weather.ts          # wmo(code) → {label,icon}, orbStyle(code,isDay)
public/
DESIGN.md               # spec TEMPER
```

## 🙏 Kredit

- Data cuaca: [Open-Meteo](https://open-meteo.com) (CC BY 4.0)
- Inspirasi visual: [designmd.app/library/hawa-weather — TEMPER](https://designmd.app/library/hawa-weather)
- Built with [Next.js](https://nextjs.org) · Deployed on [Vercel](https://vercel.com)

---

MIT — bebas pakai untuk belajar. PR & issue welcome.
