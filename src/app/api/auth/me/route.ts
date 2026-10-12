import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSavedLocations } from "@/lib/turso";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        locations: [],
        savedLocations: [],
      });
    }

    // Fetch user saved locations from Turso DB
    const locations = await getSavedLocations(user.id);

    return NextResponse.json({
      authenticated: true,
      user,
      locations,
      savedLocations: locations,
    });
  } catch (err: any) {
    console.error("Auth me error:", err);
    return NextResponse.json({
      authenticated: false,
      user: null,
      locations: [],
      savedLocations: [],
    });
  }
}
