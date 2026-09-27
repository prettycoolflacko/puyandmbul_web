import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    : `${new URL(request.url).origin}/api/auth/callback`;

  const getBasicAuth = () => Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.error) {
    return NextResponse.json({ error: data.error_description }, { status: 400 });
  }

  // Save the refresh token to the database
  if (data.refresh_token) {
    await prisma.setting.upsert({
      where: { key: "SPOTIFY_REFRESH_TOKEN" },
      update: { value: data.refresh_token },
      create: { key: "SPOTIFY_REFRESH_TOKEN", value: data.refresh_token },
    });
  }

  // Redirect back to the dashboard
  return NextResponse.redirect(new URL("/", request.url));
}
