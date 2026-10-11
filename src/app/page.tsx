"use client";
import { useEffect, useState } from "react";
import { wmo, orbStyle } from "@/lib/weather";
type WRes = any;
const PRESETS = [
  { name: "Jakarta", lat: -6.2, lon: 106.84 },
  { name: "Yogyakarta", lat: -7.8, lon: 110.36 },
  { name: "Bandung", lat: -6.91, lon: 107.6 },
  { name: "Surabaya", lat: -7.25, lon: 112.75 },
  { name: "Bali", lat: -8.65, lon: 115.21 },
];
export default function Home() {
  const [q, setQ] = useState("");
  const [place, setPlace] = useState(PRESETS[1]);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [data, setData] = useState<WRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggest, setSuggest] = useState<any[]>([]);
  const toF = (c: number) => Math.round((c * 9) / 5 + 32);
  const fmt = (c: number) => (unit === "C" ? `${Math.round(c)}°C` : `${toF(c)}°F`);
  async function fetchW(p: { lat: number; lon: number }) {
    setLoading(true);
    try {
      const r = await fetch(`/api/weather?lat=${p.lat}&lon=${p.lon}`);
      const j = await r.json();
      setData(j);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const la = sp.get("lat"), lo = sp.get("lon"), nm = sp.get("name");
    if (la && lo) setPlace({ name: nm ? decodeURIComponent(nm) : "Lokasi link", lat: parseFloat(la), lon: parseFloat(lo) });
  }, []);
  useEffect(() => { fetchW(place); }, [place.lat, place.lon]);
  useEffect(() => {
    if (q.length < 2) { setSuggest([]); return; }
    const t = setTimeout(async () => {
      try { const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`); const j = await r.json(); setSuggest(j.results || []); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  function pick(s: any) {
    setPlace({ name: s.name, lat: s.latitude, lon: s.longitude });
    setQ(""); setSuggest([]);
    history.replaceState(null, "", `?lat=${s.latitude}&lon=${s.longitude}&name=${encodeURIComponent(s.name)}`);
  }
  const cur = data?.current;
  const code = cur?.weather_code ?? 0;
  const isDay = cur?.is_day ?? 1;
  const meta = wmo(code);
  const orb = orbStyle(code, isDay);
  const hourly: any[] = data?.hourly ? Array.from({ length: 12 }, (_, i) => ({ t: data.hourly.time[i], temp: data.hourly.temperature_2m[i], code: data.hourly.weather_code?.[i] ?? code })) : [];
  const daily: any[] = data?.daily ? Array.from({ length: 7 }, (_, i) => ({ date: data.daily.time[i], max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i], code: data.daily.weather_code[i], sunrise: data.daily.sunrise[i], sunset: data.daily.sunset[i] })) : [];
  return (
    <main className="mx-auto max-w-6xl px-3 py-3 md:px-6 md:py-8 min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-2 md:gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-xl bg-[var(--glow)] grid place-items-center text-[var(--bg)] font-bold text-sm md:text-base">◐</div>
          <div className="min-w-0"><div className="font-bold tracking-tight text-[15px] md:text-base leading-none">TEMPER</div><div className="label -mt-0.5 truncate">weather instrument · Open-Meteo</div></div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <div className="glass flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5">
            <span className="text-xs md:text-sm opacity-60 px-1">°</span>
            <button onClick={() => setUnit("C")} className={`min-h-9 md:min-h-11 min-w-9 md:min-w-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold ${unit === "C" ? "bg-[var(--glow)] text-[var(--bg)]" : "text-[var(--dim)]"}`}>C</button>
            <button onClick={() => setUnit("F")} className={`min-h-9 md:min-h-11 min-w-9 md:min-w-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold ${unit === "F" ? "bg-[var(--glow)] text-[var(--bg)]" : "text-[var(--dim)]"}`}>F</button>
          </div>
          <button onClick={() => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(p => setPlace({ name: "Lokasi saya", lat: p.coords.latitude, lon: p.coords.longitude })); }} className="glass min-h-9 md:min-h-11 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm hover:bg-white/5 shrink-0">📍 Saya</button>
        </div>
      </header>

      <div className="mt-3 md:mt-6 grid gap-3 md:gap-4 md:grid-cols-[1.1fr_.9fr] min-w-0">
        <div className="glass glow p-3 md:p-7 min-w-0 overflow-hidden">
          <div className="label">cari kota</div>
          <div className="relative mt-1.5 md:mt-2 min-w-0">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Yogyakarta, Tokyo, Berlin..." className="w-full min-w-0 rounded-full bg-white/5 border border-[var(--hair)] px-3 md:px-4 py-2.5 md:py-3 text-[15px] md:text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--glow)]" />
            {suggest.length > 0 && <div className="absolute z-10 mt-2 w-full glass p-2 max-h-64 overflow-auto">
              {suggest.map((s: any) => <button key={s.id} onClick={() => pick(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm break-words">{s.name} <span className="text-[var(--dim)]">· {s.country} {s.admin1 ? "· " + s.admin1 : ""}</span></button>)}
            </div>}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
            {PRESETS.map(p => <button key={p.name} onClick={() => setPlace(p)} className={`min-h-8 md:min-h-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-xs border ${place.name === p.name ? "bg-[var(--glow)] text-[var(--bg)] border-transparent" : "border-[var(--hair)] text-[var(--dim)] hover:text-[var(--ink)]"}`}>{p.name}</button>)}
          </div>
          <div className="mt-4 md:mt-6 flex flex-col items-center text-center min-w-0">
            <div className="orb shrink-0" style={{ background: orb.bg, boxShadow: `0 0 28px ${orb.glow}` } as any} />
            <div className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight break-words w-full">{cur ? fmt(cur.temperature_2m) : loading ? "…" : "—"}</div>
            <div className="text-[13px] md:text-sm text-[var(--dim)] break-words px-2">{meta.label} · {place.name} {cur ? `· ${cur.is_day ? "siang" : "malam"}` : ""}</div>
            <div className="label mt-1">{meta.icon} WMO {code}</div>
            {cur && <div className="mt-3 grid grid-cols-3 gap-1.5 md:gap-2 w-full text-xs md:text-sm min-w-0">
              <div className="glass p-2 md:p-3 min-w-0 overflow-hidden"><div className="label">terasa</div><div className="font-semibold truncate">{fmt(cur.apparent_temperature)}</div></div>
              <div className="glass p-2 md:p-3 min-w-0 overflow-hidden"><div className="label">lembap</div><div className="font-semibold truncate">{cur.relative_humidity_2m}%</div></div>
              <div className="glass p-2 md:p-3 min-w-0 overflow-hidden"><div className="label">angin</div><div className="font-semibold truncate">{cur.wind_speed_10m} km/h</div></div>
            </div>}
          </div>
        </div>

        <div className="grid gap-3 md:gap-4 min-w-0">
          <div className="glass p-3 md:p-4 min-w-0 overflow-hidden">
            <div className="label">per jam · 12 jam ke depan</div>
            <div className="mt-2 md:mt-3 flex gap-2 md:gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 snap-x">
              {hourly.map((h, i) => <div key={i} className="min-w-[68px] md:min-w-[76px] glass px-2 md:px-2.5 py-2 md:py-2.5 text-center shrink-0 snap-start">
                <div className="label text-[11px] md:text-xs">{h.t ? new Date(h.t).toLocaleTimeString("id-ID", { hour: "2-digit" }) : "—"}</div>
                <div className="text-lg md:text-xl leading-none my-1">{wmo(h.code).icon}</div>
                <div className="text-sm md:text-[15px] font-semibold">{fmt(h.temp)}</div>
              </div>)}
              {!hourly.length && <div className="text-xs md:text-sm text-[var(--dim)]">{loading ? "memuat…" : "—"}</div>}
            </div>
          </div>
          <div className="glass p-3 md:p-4 min-w-0 overflow-hidden">
            <div className="label">kualitas udara</div>
            <div className="mt-1.5 md:mt-2 flex items-baseline gap-2 flex-wrap"><div className="text-2xl md:text-3xl font-bold">{data?.aqi ?? "—"}</div><div className="label">US AQI</div></div>
            <div className="mt-1.5 md:mt-2 h-1.5 md:h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-[var(--glow)]" style={{ width: `${Math.min(100, (data?.aqi || 0) / 2)}%` }} /></div>
            <div className="label mt-1 leading-snug">0 baik · 300+ berbahaya · via Open-Meteo Air Quality</div>
          </div>
          <div className="glass p-3 md:p-4 min-w-0 overflow-hidden">
            <div className="label">7 hari ke depan</div>
            <div className="mt-2 grid gap-1.5 md:gap-2">
              {daily.map((d, i) => <div key={i} className="flex items-center justify-between gap-1 rounded-xl border border-[var(--hair)] px-2 md:px-3 py-2 min-w-0">
                <div className="text-xs md:text-sm truncate min-w-0">{new Date(d.date).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}</div>
                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm shrink-0"><span>{wmo(d.code).icon}</span><span className="hidden sm:inline text-[var(--dim)] truncate max-w-[80px]">{wmo(d.code).label}</span></div>
                <div className="text-xs md:text-sm font-semibold shrink-0">{fmt(d.max)} <span className="text-[var(--dim)]">/ {fmt(d.min)}</span></div>
              </div>)}
            </div>
            {daily[0] && <div className="label mt-2 md:mt-3 break-words">☀︎ {new Date(daily[0].sunrise).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · ☾ {new Date(daily[0].sunset).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>}
          </div>
        </div>
      </div>

      <div className="mt-3 md:mt-4 glass p-3 md:p-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="label break-words min-w-0 flex-1">share · ?lat&lon&name → tautan langsung cuaca lokasi</div>
        <button onClick={async () => { const url = `${location.origin}?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(place.name)}`; await navigator.clipboard.writeText(url); alert("link disalin"); }} className="rounded-full bg-[var(--glow)] text-[var(--bg)] px-4 py-2.5 text-xs md:text-sm font-semibold shrink-0 min-h-9">Salin link</button>
      </div>
      <div className="label mt-4 md:mt-6 text-center px-2 break-words">Built with Next.js · Data Open-Meteo · Style TEMPER glass/blur/glow</div>
    </main>
  );
}
