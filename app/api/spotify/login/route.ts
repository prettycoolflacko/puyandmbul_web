import { NextResponse } from "next/server";

export async function GET() {
  const scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing";
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    : "http://127.0.0.1:3000/api/auth/callback";

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", CLIENT_ID);
  url.searchParams.append("scope", scope);
  url.searchParams.append("redirect_uri", REDIRECT_URI);

  return NextResponse.redirect(url.toString());
}
