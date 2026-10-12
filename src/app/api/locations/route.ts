import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  getSavedLocations,
  addSavedLocation,
  deleteSavedLocation,
  setPrimaryLocation,
  updateLocationLabel,
} from "@/lib/turso";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locations = await getSavedLocations(user.id);
    return NextResponse.json({ locations });
  } catch (error: any) {
    console.error("GET /api/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, custom_label, lat, lon, is_primary } = body;

    if (!name || typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json(
        { error: "Parameter name, lat, and lon are required" },
        { status: 400 }
      );
    }

    const location = await addSavedLocation(user.id, {
      name: String(name).trim(),
      custom_label: custom_label ? String(custom_label).trim() : "Favorit",
      lat,
      lon,
      is_primary: Boolean(is_primary),
    });

    return NextResponse.json({ success: true, location });
  } catch (error: any) {
    console.error("POST /api/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    let id = url.searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // ignore json parse error
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Location id is required" }, { status: 400 });
    }

    await deleteSavedLocation(user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, custom_label } = body;

    if (!id) {
      return NextResponse.json({ error: "Location id is required" }, { status: 400 });
    }

    if (action === "set_primary") {
      await setPrimaryLocation(user.id, id);
      return NextResponse.json({ success: true });
    }

    if (action === "update_label") {
      if (!custom_label) {
        return NextResponse.json({ error: "custom_label is required" }, { status: 400 });
      }
      await updateLocationLabel(user.id, id, String(custom_label).trim());
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
