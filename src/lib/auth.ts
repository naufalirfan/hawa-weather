// Web-Crypto compatible Auth & JWT Helpers for Hawa Weather

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET env missing");
  return s;
}

export interface SessionPayload {
  id: string; // Google sub
  email: string;
  name: string;
  picture: string;
}

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64URL encode/decode
function base64UrlEncode(buf: ArrayBuffer | Uint8Array): string {
  let binary = "";
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return atob(b64);
}

async function getCryptoKey(): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    strToBuf(jwtSecret()) as any,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days
  const fullPayload = { ...payload, exp };

  const encHeader = base64UrlEncode(strToBuf(JSON.stringify(header)));
  const encPayload = base64UrlEncode(strToBuf(JSON.stringify(fullPayload)));
  const data = `${encHeader}.${encPayload}`;

  const key = await getCryptoKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, strToBuf(data) as any);
  const encSig = base64UrlEncode(sigBuf);

  return `${data}.${encSig}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encHeader, encPayload, encSig] = parts;
    const data = `${encHeader}.${encPayload}`;

    const key = await getCryptoKey();
    const sigBytes = Uint8Array.from(base64UrlDecode(encSig), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes as any, strToBuf(data) as any);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    console.error("verifySessionToken error:", err);
    return null;
  }
}

// Verify Google ID Token via Google's tokeninfo endpoint
export async function verifyGoogleIdToken(idToken: string): Promise<SessionPayload | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Google tokeninfo error status:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data.sub || !data.email) {
      return null;
    }

    return {
      id: data.sub,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      picture: data.picture || "",
    };
  } catch (err) {
    console.error("verifyGoogleIdToken error:", err);
    return null;
  }
}

// Helper to extract and verify session user from NextRequest or standard Request
export async function getSessionUser(req: Request): Promise<SessionPayload | null> {
  let token: string | undefined;

  // 1. From Cookie header
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/hawa_auth_session=([^;]+)/);
  if (match) {
    token = match[1];
  }

  // 2. From Authorization header
  if (!token) {
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}
