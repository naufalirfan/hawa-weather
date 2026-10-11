export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return Response.json({ results: [] });
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=id&format=json`);
  const j = await r.json();
  return Response.json(j, { headers: { "cache-control": "public, max-age=60" } });
}
