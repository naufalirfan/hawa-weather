import { NextRequest, NextResponse } from "next/server";
import { verifyGoogleIdToken, createSessionToken } from "@/lib/auth";
import { upsertUser } from "@/lib/turso";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const credential = body.credential || body.id_token;
    const isDemo = Boolean(body.is_demo || body.demoUser);

    let userPayload = null;

    if (credential) {
      userPayload = await verifyGoogleIdToken(credential);
      if (!userPayload) {
        return NextResponse.json({ error: "Invalid Google credential" }, { status: 401 });
      }
    } else if (isDemo) {
      // Demo / Direct simulation for testing without Google Cloud setup
      const demo = body.demoUser || {};
      userPayload = {
        id: demo.id || `google_user_naufal`,
        email: demo.email || "naufal@hawa.weather",
        name: demo.name || "Naufal Irfansyah",
        picture: demo.picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Naufal",
      };
    } else {
      return NextResponse.json({ error: "Credential or is_demo required" }, { status: 400 });
    }

    // Upsert into Turso database
    await upsertUser(userPayload);

    // Create session token
    const token = await createSessionToken(userPayload);

    const res = NextResponse.json({ ok: true, user: userPayload });

    // Set secure HTTP-only cookie
    res.cookies.set("hawa_auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600, // 30 days
    });

    return res;
  } catch (err: any) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
