// Supabase (PostgREST) data layer for Hawa Weather — server-side only.
// Uses the service role key; never import this from a client component.

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  created_at?: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  name: string;
  custom_label: string;
  lat: number;
  lon: number;
  is_primary: number;
  created_at?: string;
}

function env(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} env missing`);
  return v;
}

async function rest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const res = await fetch(`${env("SUPABASE_URL").replace(/\/+$/, "")}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const q = (v: string | number) => encodeURIComponent(String(v));

// ---------------- Visitor Tracking ---------------- //

export async function incrementVisitors(): Promise<number> {
  try {
    return Number(await rest<number>("/rpc/hawa_increment_visitors", { method: "POST", body: "{}" }));
  } catch (err) {
    console.error("incrementVisitors error:", err);
    return 1;
  }
}

export async function getVisitors(): Promise<number> {
  try {
    const rows = await rest<{ count: number }[]>("/hawa_stats?key=eq.total_visitors&select=count");
    return Number(rows?.[0]?.count ?? 0);
  } catch (err) {
    console.error("getVisitors error:", err);
    return 0;
  }
}

// ---------------- User Management ---------------- //

export async function upsertUser(user: UserProfile): Promise<UserProfile> {
  await rest("/hawa_users?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      updated_at: new Date().toISOString(),
    }),
  });
  return user;
}

export async function getUser(id: string): Promise<UserProfile | null> {
  const rows = await rest<UserProfile[]>(
    `/hawa_users?id=eq.${q(id)}&select=id,email,name,picture,created_at&limit=1`
  );
  return rows?.[0] ?? null;
}

// ---------------- Saved Locations Management ---------------- //

export async function getSavedLocations(userId: string): Promise<SavedLocation[]> {
  const rows = await rest<SavedLocation[]>(
    `/hawa_saved_locations?user_id=eq.${q(userId)}&select=*&order=is_primary.desc,created_at.desc`
  );
  return (rows ?? []).map((r) => ({
    ...r,
    lat: Number(r.lat),
    lon: Number(r.lon),
    is_primary: Number(r.is_primary),
  }));
}

async function clearPrimary(userId: string): Promise<void> {
  await rest(`/hawa_saved_locations?user_id=eq.${q(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_primary: 0 }),
  });
}

export async function addSavedLocation(
  userId: string,
  loc: {
    name: string;
    custom_label?: string;
    lat: number;
    lon: number;
    is_primary?: boolean;
  }
): Promise<SavedLocation> {
  const id = `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const label = loc.custom_label || "Favorit";
  const isPrimary = loc.is_primary ? 1 : 0;

  if (isPrimary) await clearPrimary(userId);

  await rest("/hawa_saved_locations", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      id,
      user_id: userId,
      name: loc.name,
      custom_label: label,
      lat: loc.lat,
      lon: loc.lon,
      is_primary: isPrimary,
    }),
  });

  return { id, user_id: userId, name: loc.name, custom_label: label, lat: loc.lat, lon: loc.lon, is_primary: isPrimary };
}

export async function deleteSavedLocation(userId: string, locationId: string): Promise<boolean> {
  await rest(`/hawa_saved_locations?id=eq.${q(locationId)}&user_id=eq.${q(userId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return true;
}

export async function setPrimaryLocation(userId: string, locationId: string): Promise<boolean> {
  await clearPrimary(userId);
  await rest(`/hawa_saved_locations?id=eq.${q(locationId)}&user_id=eq.${q(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ is_primary: 1 }),
  });
  return true;
}

export async function updateLocationLabel(
  userId: string,
  locationId: string,
  customLabel: string
): Promise<boolean> {
  await rest(`/hawa_saved_locations?id=eq.${q(locationId)}&user_id=eq.${q(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ custom_label: customLabel }),
  });
  return true;
}
