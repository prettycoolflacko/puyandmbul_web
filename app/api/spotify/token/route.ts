import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/spotify";

export async function GET() {
  const token = await getAccessToken();
  
  if (!token) {
    return NextResponse.json({ error: "No Spotify token available" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
