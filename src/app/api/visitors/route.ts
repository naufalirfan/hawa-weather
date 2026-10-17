import { NextResponse } from "next/server";
import { getVisitors, incrementVisitors } from "@/lib/supabase";

export async function GET() {
  try {
    const count = await getVisitors();
    return NextResponse.json({ visitors: count });
  } catch (err: any) {
    console.error("GET /api/visitors error:", err);
    return NextResponse.json({ visitors: null, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const count = await incrementVisitors();
    return NextResponse.json({ visitors: count });
  } catch (err: any) {
    console.error("POST /api/visitors error:", err);
    return NextResponse.json({ visitors: null, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}