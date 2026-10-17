// Turso LibSQL HTTP API Client for Hawa Weather

const DEFAULT_TURSO_URL = "";
const DEFAULT_TURSO_TOKEN = "";

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

function getEndpoint(): { url: string; token: string } {
  const rawUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;
  if (!rawUrl || !token) throw new Error("TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env missing");
  const baseUrl = rawUrl.replace(/^libsql:\/\//i, "https://").replace(/\/+$/, "");
  return {
    url: `${baseUrl}/v2/pipeline`,
    token,
  };
}

function formatArg(arg: any): { type: string; value: any } {
  if (arg === null || arg === undefined) return { type: "null", value: null };
  if (typeof arg === "number") {
    if (Number.isInteger(arg)) return { type: "integer", value: String(arg) };
    return { type: "float", value: arg };
  }
  if (typeof arg === "boolean") return { type: "integer", value: arg ? "1" : "0" };
  return { type: "text", value: String(arg) };
}

export async function executePipeline(
  requests: Array<{ sql: string; args?: any[] }>
): Promise<any[]> {
  const { url, token } = getEndpoint();

  const bodyRequests = requests.map((r) => ({
    type: "execute",
    stmt: {
      sql: r.sql,
      args: (r.args || []).map(formatArg),
    },
  }));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests: bodyRequests }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Turso HTTP error: ${res.statusText}`);
  }

  const json = await res.json();
  return json.results || [];
}

// ---------------- Visitor Tracking ---------------- //

export async function incrementVisitors(): Promise<number> {
  try {
    const results = await executePipeline([
      {
        sql: "UPDATE weather_orb_stats SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE key = 'total_visitors' RETURNING count",
      },
    ]);
    const rows = results?.[0]?.response?.result?.rows;
    if (rows && rows.length > 0 && rows[0][0]) {
      return Number(rows[0][0].value);
    }
  } catch (err) {
    console.error("incrementVisitors error:", err);
  }
  return 1;
}

export async function getVisitors(): Promise<number> {
  try {
    const results = await executePipeline([
      {
        sql: "SELECT count FROM weather_orb_stats WHERE key = 'total_visitors'",
      },
    ]);
    const rows = results?.[0]?.response?.result?.rows;
    if (rows && rows.length > 0 && rows[0][0]) {
      return Number(rows[0][0].value);
    }
  } catch (err) {
    console.error("getVisitors error:", err);
  }
  return 0;
}

// ---------------- User Management ---------------- //

export async function upsertUser(user: UserProfile): Promise<UserProfile> {
  await executePipeline([
    {
      sql: `INSERT INTO hawa_users (id, email, name, picture, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              picture = excluded.picture,
              email = excluded.email,
              updated_at = CURRENT_TIMESTAMP`,
      args: [user.id, user.email, user.name, user.picture],
    },
  ]);
  return user;
}

export async function getUser(id: string): Promise<UserProfile | null> {
  const results = await executePipeline([
    {
      sql: "SELECT id, email, name, picture, created_at FROM hawa_users WHERE id = ? LIMIT 1",
      args: [id],
    },
  ]);

  const rows = results?.[0]?.response?.result?.rows;
  if (!rows || rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row[0].value,
    email: row[1].value,
    name: row[2].value,
    picture: row[3].value,
    created_at: row[4]?.value,
  };
}

// ---------------- Saved Locations Management ---------------- //

export async function getSavedLocations(userId: string): Promise<SavedLocation[]> {
  const results = await executePipeline([
    {
      sql: `SELECT id, user_id, name, custom_label, lat, lon, is_primary, created_at
            FROM hawa_saved_locations
            WHERE user_id = ?
            ORDER BY is_primary DESC, created_at DESC`,
      args: [userId],
    },
  ]);

  const rows = results?.[0]?.response?.result?.rows;
  if (!rows) return [];

  return rows.map((r: any[]) => ({
    id: r[0].value,
    user_id: r[1].value,
    name: r[2].value,
    custom_label: r[3].value,
    lat: Number(r[4].value),
    lon: Number(r[5].value),
    is_primary: Number(r[6].value),
    created_at: r[7]?.value,
  }));
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

  const pipeline: Array<{ sql: string; args?: any[] }> = [];

  if (isPrimary) {
    pipeline.push({
      sql: "UPDATE hawa_saved_locations SET is_primary = 0 WHERE user_id = ?",
      args: [userId],
    });
  }

  pipeline.push({
    sql: `INSERT INTO hawa_saved_locations (id, user_id, name, custom_label, lat, lon, is_primary)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, loc.name, label, loc.lat, loc.lon, isPrimary],
  });

  await executePipeline(pipeline);

  return {
    id,
    user_id: userId,
    name: loc.name,
    custom_label: label,
    lat: loc.lat,
    lon: loc.lon,
    is_primary: isPrimary,
  };
}

export async function deleteSavedLocation(userId: string, locationId: string): Promise<boolean> {
  await executePipeline([
    {
      sql: "DELETE FROM hawa_saved_locations WHERE id = ? AND user_id = ?",
      args: [locationId, userId],
    },
  ]);
  return true;
}

export async function setPrimaryLocation(userId: string, locationId: string): Promise<boolean> {
  await executePipeline([
    {
      sql: "UPDATE hawa_saved_locations SET is_primary = 0 WHERE user_id = ?",
      args: [userId],
    },
    {
      sql: "UPDATE hawa_saved_locations SET is_primary = 1 WHERE id = ? AND user_id = ?",
      args: [locationId, userId],
    },
  ]);
  return true;
}

export async function updateLocationLabel(
  userId: string,
  locationId: string,
  customLabel: string
): Promise<boolean> {
  await executePipeline([
    {
      sql: "UPDATE hawa_saved_locations SET custom_label = ? WHERE id = ? AND user_id = ?",
      args: [customLabel, locationId, userId],
    },
  ]);
  return true;
}
