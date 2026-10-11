export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) return Response.json({ error: "lat lon required" }, { status: 400 });
  const full = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,uv_index,precipitation&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`;
  const r = await fetch(full);
  const j = await r.json();
  // air quality (optional)
  let aqi: number | null = null;
  try {
    const ar = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`);
    const aj = await ar.json();
    aqi = aj.current?.us_aqi ?? null;
  } catch {}
  return Response.json({ ...j, aqi }, { headers: { "cache-control": "public, max-age=300" } });
}