// Turso LibSQL HTTP API Client for visitor tracking

const DEFAULT_TURSO_URL = "https://payment-bridge-db-naufalirfan.aws-ap-northeast-1.turso.io";
const DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEyMzY4MDIsImlkIjoiMDFhMTBlMDgtNmYwMS03MmU5LWExNDQtYzE2ZjM2YzQ0ZDIxIiwia2lkIjoiblRsYmdNTlhxcmRubDVHdUNkR3kzREhMckRjZ2J2b1FQVVJJUjRWWDZ2MCIsInJpZCI6IjkwMjU2MTU1LWNmMjctNGU0NC04MGEyLWUwYjA3YjJlMGJiOCJ9.OF1id5IV7pJN95uO54GRSq1HsSf4znF8b5-_usWLZSl8e0zSIm57TMATVSvY2vFbEwxkzoMsbPEjsAQZOCGLAw";

function getEndpoint(): { url: string; token: string } {
  const rawUrl = process.env.TURSO_DATABASE_URL || DEFAULT_TURSO_URL;
  const token = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;
  const baseUrl = rawUrl.replace(/^libsql:\/\//i, "https://").replace(/\/+$/, "");
  return {
    url: `${baseUrl}/v2/pipeline`,
    token,
  };
}

export async function incrementVisitors(): Promise<number> {
  const { url, token } = getEndpoint();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql: "UPDATE weather_orb_stats SET count = count + 1, updated_at = CURRENT_TIMESTAMP WHERE key = 'total_visitors' RETURNING count",
          },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Turso HTTP error: ${res.statusText}`);
  }

  const data = await res.json();
  const rows = data?.results?.[0]?.response?.result?.rows;
  if (rows && rows.length > 0 && rows[0][0]) {
    return Number(rows[0][0].value);
  }
  return 1;
}

export async function getVisitors(): Promise<number> {
  const { url, token } = getEndpoint();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          type: "execute",
          stmt: {
            sql: "SELECT count FROM weather_orb_stats WHERE key = 'total_visitors'",
          },
        },
      ],
    }),
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error(`Turso HTTP error: ${res.statusText}`);
  }

  const data = await res.json();
  const rows = data?.results?.[0]?.response?.result?.rows;
  if (rows && rows.length > 0 && rows[0][0]) {
    return Number(rows[0][0].value);
  }
  return 0;
}