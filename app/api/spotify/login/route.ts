import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative";
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
  if (!CLIENT_ID) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;text-align:center;background:#1a103c;color:#fff;">
        <h2 style="color:#ff3fa4;">Spotify Client ID Missing</h2>
        <p>To use the custom Web Playback SDK player, set <code>SPOTIFY_CLIENT_ID</code> and <code>SPOTIFY_CLIENT_SECRET</code> in your <code>.env</code> file from the <a href="https://developer.spotify.com/dashboard" style="color:#4fd8f0;" target="_blank">Spotify Developer Dashboard</a>.</p>
        <p style="color:#aaa;margin-top:16px;">Or use the built-in Spotify embed player in the sidebar which plays your playlist with zero configuration!</p>
        <br/><a href="/" style="display:inline-block;padding:8px 16px;background:#ff3fa4;color:#fff;text-decoration:none;border-radius:6px;">← Back to Home</a>
      </body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    : `${new URL(request.url).origin}/api/auth/callback`;

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", CLIENT_ID);
  url.searchParams.append("scope", scope);
  url.searchParams.append("redirect_uri", REDIRECT_URI);

  return NextResponse.redirect(url.toString());
}
