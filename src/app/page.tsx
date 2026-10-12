"use client";

import { useEffect, useState } from "react";
import { wmo } from "@/lib/weather";
import { WeatherVisual, TimePhase } from "@/components/WeatherVisual";

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
  const [visitors, setVisitors] = useState<number | null>(null);
  const [timeMode, setTimeMode] = useState<"auto" | TimePhase>("auto");
  const [autoPhase, setAutoPhase] = useState<TimePhase>("siang");
  const [orbTilt, setOrbTilt] = useState({ x: 0, y: 0 });

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

  // Record / fetch visitor counter
  useEffect(() => {
    async function trackVisitor() {
      try {
        const hasVisited = sessionStorage.getItem("weather_orb_visited");
        const method = hasVisited ? "GET" : "POST";
        const r = await fetch("/api/visitors", { method });
        if (r.ok) {
          const j = await r.json();
          if (typeof j.visitors === "number") {
            setVisitors(j.visitors);
            if (!hasVisited) {
              sessionStorage.setItem("weather_orb_visited", "1");
            }
          }
        }
      } catch (err) {
        console.error("Visitor tracking error:", err);
      }
    }
    trackVisitor();
  }, []);

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

  const handleOrbMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -22;
    setOrbTilt({ x, y });
  };

  const handleOrbMouseLeave = () => {
    setOrbTilt({ x: 0, y: 0 });
  };

  const cur = data?.current;
  const code = cur?.weather_code ?? 0;
  const meta = wmo(code);

  // Compute auto time phase client-side safely in useEffect
  useEffect(() => {
    if (cur?.time) {
      const h = new Date(cur.time).getHours();
      if (h >= 5 && h < 11) setAutoPhase("pagi");
      else if (h >= 11 && h < 15) setAutoPhase("siang");
      else if (h >= 15 && h < 18) setAutoPhase("sore");
      else setAutoPhase("malam");
    } else {
      const localH = new Date().getHours();
      if (localH >= 5 && localH < 11) setAutoPhase("pagi");
      else if (localH >= 11 && localH < 15) setAutoPhase("siang");
      else if (localH >= 15 && localH < 18) setAutoPhase("sore");
      else setAutoPhase("malam");
    }
  }, [cur?.time]);

  const effectivePhase: TimePhase = timeMode === "auto" ? autoPhase : timeMode;

  const cyclePhase = () => {
    const list: TimePhase[] = ["pagi", "siang", "sore", "malam"];
    const next = list[(list.indexOf(effectivePhase) + 1) % list.length];
    setTimeMode(next);
  };

  const hourly: any[] = data?.hourly ? Array.from({ length: 12 }, (_, i) => ({
    t: data.hourly.time[i],
    temp: data.hourly.temperature_2m[i],
    code: data.hourly.weather_code?.[i] ?? code,
  })) : [];

  const daily: any[] = data?.daily ? Array.from({ length: 7 }, (_, i) => ({
    date: data.daily.time[i],
    max: data.daily.temperature_2m_max[i],
    min: data.daily.temperature_2m_min[i],
    code: data.daily.weather_code[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    uv_max: data.daily.uv_index_max?.[i],
    rain_sum: data.daily.precipitation_sum?.[i],
    pop: data.daily.precipitation_probability_max?.[i],
  })) : [];

  // AQI assessment
  const aqiVal = data?.aqi;
  const aqiStatus = aqiVal == null
    ? ""
    : aqiVal <= 50
    ? "Baik"
    : aqiVal <= 100
    ? "Sedang"
    : aqiVal <= 150
    ? "Sensitif"
    : aqiVal <= 200
    ? "Tidak Sehat"
    : "Berbahaya";

  const aqiColor = aqiVal == null
    ? "var(--glow)"
    : aqiVal <= 50
    ? "#34d399"
    : aqiVal <= 100
    ? "#fbbf24"
    : aqiVal <= 150
    ? "#fb923c"
    : "#f87171";

  // Dynamic sky backgrounds matching time of day
  const skyBackgrounds = {
    pagi: "radial-gradient(1200px 800px at 70% -10%, #7C2D12 0%, #1E1B4B 45%, #070A14 100%)",
    siang: "radial-gradient(1200px 800px at 70% -10%, #1E3A8A 0%, #172554 45%, #070A14 100%)",
    sore: "radial-gradient(1200px 800px at 70% -10%, #9A3412 0%, #581C87 45%, #070A14 100%)",
    malam: "radial-gradient(1200px 800px at 70% -10%, #312E81 0%, #1E1B4B 50%, #070A14 100%)",
  };

  return (
    <div
      className="min-h-screen transition-colors duration-700 ease-in-out"
      style={{
        background: skyBackgrounds[effectivePhase],
      }}
    >
      <main className="mx-auto max-w-6xl px-3 py-3 md:px-6 md:py-8 min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-2 md:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-xl bg-[var(--glow)] grid place-items-center text-[var(--bg)] font-bold text-sm md:text-base">
              {effectivePhase === "malam" ? "🌙" : effectivePhase === "pagi" ? "🌅" : effectivePhase === "sore" ? "🌇" : "☀️"}
            </div>
            <div className="min-w-0">
              <div className="font-bold tracking-tight text-[15px] md:text-base leading-none">Hawa Weather</div>
              <div className="label -mt-0.5 truncate">instrumen cuaca · Open-Meteo</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0 flex-wrap">
            {/* Live Visitor Counter */}
            <div className="glass px-2.5 md:px-3 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-xs shrink-0" title="Penghitung total pengunjung">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--glow)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--glow)]"></span>
              </span>
              <span className="label font-mono text-[10px] md:text-xs">
                VISITOR · <span className="text-[var(--ink)] font-bold">{visitors !== null ? visitors.toLocaleString("id-ID") : "…"}</span>
              </span>
            </div>

            {/* Unit Switcher */}
            <div className="glass flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5">
              <span className="text-xs md:text-sm opacity-60 px-1">°</span>
              <button onClick={() => setUnit("C")} className={`min-h-9 md:min-h-11 min-w-9 md:min-w-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${unit === "C" ? "bg-[var(--glow)] text-[var(--bg)]" : "text-[var(--dim)]"}`}>C</button>
              <button onClick={() => setUnit("F")} className={`min-h-9 md:min-h-11 min-w-9 md:min-w-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-colors ${unit === "F" ? "bg-[var(--glow)] text-[var(--bg)]" : "text-[var(--dim)]"}`}>F</button>
            </div>

            <button onClick={() => { if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(p => setPlace({ name: "Lokasi saya", lat: p.coords.latitude, lon: p.coords.longitude })); }} className="glass min-h-9 md:min-h-11 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm hover:bg-white/5 shrink-0 transition-colors">📍 Saya</button>
          </div>
        </header>

        <div className="mt-3 md:mt-6 grid gap-3 md:gap-4 md:grid-cols-[1.1fr_.9fr] min-w-0">
          <div className="glass glow p-3 md:p-7 min-w-0 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="label">cari kota</div>
              <div className="relative mt-1.5 md:mt-2 min-w-0">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Yogyakarta, Tokyo, Berlin..." className="w-full min-w-0 rounded-full bg-white/5 border border-[var(--hair)] px-3 md:px-4 py-2.5 md:py-3 text-[15px] md:text-sm outline-none placeholder:text-[var(--dim)] focus:border-[var(--glow)] transition-colors" />
                {suggest.length > 0 && <div className="absolute z-10 mt-2 w-full glass p-2 max-h-64 overflow-auto shadow-2xl">
                  {suggest.map((s: any) => <button key={s.id} onClick={() => pick(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm break-words">{s.name} <span className="text-[var(--dim)]">· {s.country} {s.admin1 ? "· " + s.admin1 : ""}</span></button>)}
                </div>}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
                {PRESETS.map(p => <button key={p.name} onClick={() => setPlace(p)} className={`min-h-8 md:min-h-11 px-2.5 md:px-3.5 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-xs border transition-colors ${place.name === p.name ? "bg-[var(--glow)] text-[var(--bg)] border-transparent" : "border-[var(--hair)] text-[var(--dim)] hover:text-[var(--ink)]"}`}>{p.name}</button>)}
              </div>
            </div>

            {/* Central Weather Visual & Time-of-Day Instrument */}
            <div className="mt-4 md:mt-6 flex flex-col items-center text-center min-w-0">
              {/* Clickable Time of Day Selector */}
              <div className="flex items-center justify-center gap-1 p-1 rounded-full glass border border-[var(--hair)] mb-3 flex-wrap">
                {(["auto", "pagi", "siang", "sore", "malam"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTimeMode(m)}
                    className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs transition-all ${
                      timeMode === m
                        ? "bg-[var(--glow)] text-[var(--bg)] font-bold shadow-sm"
                        : "text-[var(--dim)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {m === "auto" ? "⚡ Auto" : m === "pagi" ? "🌅 Pagi" : m === "siang" ? "☀️ Siang" : m === "sore" ? "🌇 Sore" : "🌙 Malam"}
                  </button>
                ))}
              </div>

              {/* Animated 3D Weather Illustration */}
              <div
                onMouseMove={handleOrbMouseMove}
                onMouseLeave={handleOrbMouseLeave}
                className="py-2"
              >
                <WeatherVisual
                  phase={effectivePhase}
                  weatherCode={code}
                  tilt={orbTilt}
                  onClick={cyclePhase}
                />
              </div>

              <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight break-words w-full">{cur ? fmt(cur.temperature_2m) : loading ? "…" : "—"}</div>
              <div className="text-[13px] md:text-sm text-[var(--dim)] break-words px-2 capitalize">
                {meta.label} · {place.name} · {effectivePhase}
              </div>
              <div className="label mt-1">{meta.icon} WMO {code}</div>

              {cur && <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 md:gap-2 w-full text-xs md:text-sm min-w-0">
                <div className="glass p-2 md:p-3 min-w-0 overflow-hidden"><div className="label">terasa</div><div className="font-semibold truncate">{fmt(cur.apparent_temperature)}</div></div>
                <div className="glass p-2 md:p-3 min-w-0 overflow-hidden"><div className="label">lembap</div><div className="font-semibold truncate">{cur.relative_humidity_2m}%</div></div>
                <div className="glass p-2 md:p-3 min-w-0 overflow-hidden">
                  <div className="label">angin</div>
                  <div className="font-semibold truncate flex items-center justify-center gap-1">
                    <span>{cur.wind_speed_10m} km/h</span>
                    {cur.wind_direction_10m !== undefined && (
                      <span
                        className="inline-block text-[var(--glow)] text-xs font-bold"
                        style={{ transform: `rotate(${cur.wind_direction_10m}deg)` }}
                        title={`Arah: ${cur.wind_direction_10m}°`}
                      >
                        ↑
                      </span>
                    )}
                  </div>
                </div>
                <div className="glass p-2 md:p-3 min-w-0 overflow-hidden">
                  <div className="label">indeks uv</div>
                  <div className="font-semibold truncate">
                    {cur.uv_index !== undefined && cur.uv_index !== null
                      ? `${Math.round(cur.uv_index)} · ${cur.uv_index >= 8 ? "Tinggi" : cur.uv_index >= 3 ? "Sedang" : "Rendah"}`
                      : (daily[0]?.uv_max ? `${Math.round(daily[0].uv_max)} max` : "—")}
                  </div>
                </div>
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
              <div className="flex items-center justify-between gap-2">
                <div className="label">kualitas udara</div>
                {aqiStatus && (
                  <span className="label text-[10px] px-2 py-0.5 rounded-full border border-white/10" style={{ color: aqiColor }}>
                    {aqiStatus}
                  </span>
                )}
              </div>
              <div className="mt-1.5 md:mt-2 flex items-baseline gap-2 flex-wrap">
                <div className="text-2xl md:text-3xl font-bold">{data?.aqi ?? "—"}</div>
                <div className="label">US AQI</div>
              </div>
              <div className="mt-1.5 md:mt-2 h-1.5 md:h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (data?.aqi || 0) / 2)}%`,
                    backgroundColor: aqiColor,
                  }}
                />
              </div>
              <div className="label mt-1 leading-snug">0 baik · 300+ berbahaya · via Open-Meteo Air Quality</div>
            </div>

            <div className="glass p-3 md:p-4 min-w-0 overflow-hidden">
              <div className="label">7 hari ke depan</div>
              <div className="mt-2 grid gap-1.5 md:gap-2">
                {daily.map((d, i) => <div key={i} className="flex items-center justify-between gap-1 rounded-xl border border-[var(--hair)] px-2 md:px-3 py-2 min-w-0 hover:bg-white/[0.02] transition-colors">
                  <div className="text-xs md:text-sm truncate min-w-0">{new Date(d.date).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short" })}</div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm shrink-0">
                    <span>{wmo(d.code).icon}</span>
                    <span className="hidden sm:inline text-[var(--dim)] truncate max-w-[80px]">{wmo(d.code).label}</span>
                    {d.pop !== undefined && d.pop > 0 && (
                      <span className="text-[10px] md:text-[11px] text-[var(--glow)] font-mono opacity-80" title="Peluang hujan">
                        💧{d.pop}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs md:text-sm font-semibold shrink-0">{fmt(d.max)} <span className="text-[var(--dim)]">/ {fmt(d.min)}</span></div>
                </div>)}
              </div>
              {daily[0] && <div className="label mt-2 md:mt-3 break-words">☀︎ {new Date(daily[0].sunrise).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · ☾ {new Date(daily[0].sunset).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>}
            </div>
          </div>
        </div>

        <div className="mt-3 md:mt-4 glass p-3 md:p-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="label break-words min-w-0 flex-1">share · ?lat&lon&name → tautan langsung cuaca lokasi</div>
          <button onClick={async () => { const url = `${location.origin}?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(place.name)}`; await navigator.clipboard.writeText(url); alert("link disalin"); }} className="rounded-full bg-[var(--glow)] text-[var(--bg)] px-4 py-2.5 text-xs md:text-sm font-semibold shrink-0 min-h-9 hover:opacity-90 transition-opacity">Salin link</button>
        </div>

        <footer className="mt-4 md:mt-6 text-center px-2">
          <div className="label break-words flex flex-wrap items-center justify-center gap-2">
            <span>Built with Next.js · Data Open-Meteo · Style Hawa Weather glass/blur/glow</span>
            <span>·</span>
            <span className="text-[var(--glow)] font-semibold">
              {visitors !== null ? `TOTAL VISITORS: ${visitors.toLocaleString("id-ID")}` : "TOTAL VISITORS: …"}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}